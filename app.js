const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const port = 3000;

// Setup multer for multiple file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static frontend files
app.use(express.static('public'));

// Helper function: flatten and extract data from JSON
function extractData(json) {
    function flattenObject(obj, parentKey = '', result = {}) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;

                if (key === 'socialNetworks' && Array.isArray(obj[key])) {
                    obj[key].forEach((network) => {
                        result[`${network.type}-profile`] = network.profile || '';
                    });
                } else if (key === 'withEvent' && typeof obj[key] === 'object' && obj[key] !== null) {
                    result['withEvent.pastMeetings'] = JSON.stringify(obj[key].pastMeetings);
                    obj[key].fields.forEach((field, index) => {
                        result[`withEvent.fields[${index}].name`] = field.name;
                        result[`withEvent.fields[${index}].value`] = field.value ? field.value.text : '';
                    });
                } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    flattenObject(obj[key], newKey, result);
                } else {
                    result[newKey] = obj[key];
                }
            }
        }

        if (result['data.person.id']) {
            result['data.person.id'] = result['data.person.id'].split('/').pop();
        }

        return result;
    }

    function processObject(obj) {
        let results = [];
        const flattenedPerson = flattenObject(obj);

        if (obj.socialNetworks && Array.isArray(obj.socialNetworks)) {
            obj.socialNetworks.forEach((network) => {
                let row = { ...flattenedPerson };
                row['socialNetworkType'] = network.type || '';
                row['socialNetworkProfile'] = network.profile || '';
                results.push(row);
            });
        } else {
            results.push(flattenedPerson);
        }

        if (obj.withEvent && Array.isArray(obj.withEvent.fields)) {
            obj.withEvent.fields.forEach((field, index) => {
                let row = { ...flattenedPerson };
                row['withEventFieldName'] = field.name || '';
                row['withEventFieldValue'] = field.value ? field.value.text : '';
                results.push(row);
            });
        } else if (!obj.socialNetworks) {
            results.push(flattenedPerson);
        }

        return results;
    }

    let result = [];
    if (Array.isArray(json)) {
        json.forEach(item => {
            result = result.concat(processObject(item));
        });
    } else if (typeof json === 'object' && json !== null) {
        result = result.concat(processObject(json));
    }

    const seen = new Set();
    result = result.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    return result;
}

// Helper function to delete files after processing
function cleanUpFiles(files, outputFilePath) {
    // Delete all temporary uploaded files
    files.forEach(file => {
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error(`Error deleting file ${file.path}:`, err);
            } else {
                console.log(`Deleted file ${file.path}`);
            }
        });
    });

    // Delete the generated Excel file
    fs.unlink(outputFilePath, (err) => {
        if (err) {
            console.error(`Error deleting output file ${outputFilePath}:`, err);
        } else {
            console.log(`Deleted output file ${outputFilePath}`);
        }
    });
}

// Handle multiple JSON files uploaded from the folder
app.post('/upload-folder', upload.array('jsonfiles'), (req, res) => {
    const allData = [];
    const errorMessages = [];
    const maxErrors = 3;

    req.files.forEach(file => {
        try {
            const fileContent = fs.readFileSync(file.path, 'utf8');
            if (fileContent.trim() === "") {
                errorMessages.push(`File ${file.originalname} is empty.`);
                return;
            }

            const jsonData = JSON.parse(fileContent);
            const extractedData = extractData(jsonData);

            if (extractedData.length > 0) {
                allData.push(...extractedData);
            } else {
                errorMessages.push(`File ${file.originalname} does not contain valid data.`);
            }
        } catch (error) {
            errorMessages.push(`Error reading/parsing file ${file.originalname}: ${error.message}`);
        }
    });

    if (allData.length > 0) {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(allData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const outputFilePath = path.join(__dirname, 'uploads', 'combined_output.xlsx');
        xlsx.writeFile(workbook, outputFilePath);

        // Respond with the generated Excel file
        res.download(outputFilePath, 'combined_output.xlsx', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            } else {
                // Cleanup files after the download is complete
                cleanUpFiles(req.files, outputFilePath);
            }
        });
    } else {
        res.status(400).send('No valid JSON data to write to Excel.');
    }

    if (errorMessages.length > 0) {
        console.log('Error Messages:', errorMessages.slice(0, maxErrors));
    }
});

// Start the server
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
