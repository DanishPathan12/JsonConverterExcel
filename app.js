
// const fs = require('fs');
// const path = require('path');
// const xlsx = require('xlsx');

// // Directory containing your JSON files
// const directoryPath = 'jsondata';  // replace with your directory path

// // Create a workbook and an empty worksheet
// const workbook = xlsx.utils.book_new();
// const allData = [];
// const errorMessages = [];
// const maxErrors = 3;







// function extractData(json) {
//     // Helper function to flatten objects
//     function flattenObject(obj, parentKey = '', result = {}) {
//         for (let key in obj) {
//             if (obj.hasOwnProperty(key)) {
//                 const newKey = parentKey ? `${parentKey}.${key}` : key;

//                 if (key === 'socialNetworks' && Array.isArray(obj[key])) {
//                     // Special handling for socialNetworks
//                     obj[key].forEach((network) => {
//                         result[`${network.type}-profile`] = network.profile || '';
//                     });
//                 } else if (key === 'withEvent' && typeof obj[key] === 'object' && obj[key] !== null) {
//                     // Special handling for withEvent
//                     result['withEvent.pastMeetings'] = JSON.stringify(obj[key].pastMeetings); // Serialize array as JSON string
//                     obj[key].fields.forEach((field, index) => {
//                         result[`withEvent.fields[${index}].name`] = field.name;
//                         result[`withEvent.fields[${index}].value`] = field.value ? field.value.text : '';
//                     });
//                 } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
//                     flattenObject(obj[key], newKey, result);
//                 } else {
//                     result[newKey] = obj[key];
//                 }
//             }
//         }

//         // Remove `data.person.id` if it exists
//         if (result['data.person.id']) {
//             result['data.person.id'] = result['data.person.id'].split('/').pop(); // Get last segment after '/'
//         }

//         return result;
//     }

//     // Function to process each JSON object
//     function processObject(obj) {
//         let results = [];
//         const flattenedPerson = flattenObject(obj);

//         // Process socialNetworks
//         if (obj.socialNetworks && Array.isArray(obj.socialNetworks)) {
//             obj.socialNetworks.forEach((network) => {
//                 let row = { ...flattenedPerson };
//                 row['socialNetworkType'] = network.type || '';
//                 row['socialNetworkProfile'] = network.profile || '';
//                 results.push(row);
//             });
//         } else {
//             results.push(flattenedPerson);
//         }

//         // Process withEvent fields
//         if (obj.withEvent && Array.isArray(obj.withEvent.fields)) {
//             obj.withEvent.fields.forEach((field, index) => {
//                 let row = { ...flattenedPerson };
//                 row['withEventFieldName'] = field.name || '';
//                 row['withEventFieldValue'] = field.value ? field.value.text : '';
//                 results.push(row);
//             });
//         } else if (!obj.socialNetworks) {
//             results.push(flattenedPerson);
//         }

//         return results;
//     }

//     // Process the input JSON and return rows
//     let result = [];
//     if (Array.isArray(json)) {
//         json.forEach(item => {
//             result = result.concat(processObject(item));
//         });
//     } else if (typeof json === 'object' && json !== null) {
//         result = result.concat(processObject(json));
//     }

//     // Remove duplicate rows
//     const seen = new Set();
//     result = result.filter(row => {
//         const key = JSON.stringify(row);
//         if (seen.has(key)) {
//             return false;
//         }
//         seen.add(key);
//         return true;
//     });

//     return result;
// }


// fs.readdir(directoryPath, (err, files) => {
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }

//     files.forEach(file => {
//         if (path.extname(file) === '.json') {
//             try {
                
//                 const fileContent = fs.readFileSync(path.join(directoryPath, file), 'utf8');
                
                
//                 if (fileContent.trim() === "") {
//                     errorMessages.push(`File ${file} is empty.`);
//                     return;
//                 }

//                 const jsonData = JSON.parse(fileContent);

               
//                 const extractedData = extractData(jsonData);
                
                
//                 if (extractedData.length> 0) {
//                     allData.push(...extractedData);
//                 } else {
//                     errorMessages.push(`File ${file} does not contain valid data.`);
//                 }
//             } catch (error) {
//                 errorMessages.push(`Error reading/parsing file ${file}: ${error.message}`);
//             }
//         }
//     });

//     if (allData.length > 0) {

//         const worksheet = xlsx.utils.json_to_sheet(allData);

        
//         xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//         xlsx.writeFile(workbook, 'combined_output.xlsx');
//         console.log('Excel file created successfully as combined_output.xlsx');
//     } else {
//         console.log('No valid JSON data to write to Excel.');
//     }

    
//     if (errorMessages.length > 0) {
//         console.log('Error Messages:');
//         errorMessages.slice(0, maxErrors).forEach((msg, index) => {
//             console.log(`${index + 1}: ${msg}`);
//         });
//         if (errorMessages.length > maxErrors) {
//             console.log(`...and ${errorMessages.length - maxErrors} more errors.`);
//         }
//     }
// });


// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const xlsx = require('xlsx');

// const app = express();
// const port = 3000;

// // Setup multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// app.use(express.static('public'));  // Serve frontend files

// // Handle file upload
// app.post('/upload', upload.single('jsonfile'), (req, res) => {
//     const filePath = req.file.path;
//     const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

//     const extractedData = extractData(jsonData);  // Your existing function

//     if (extractedData.length > 0) {
//         const workbook = xlsx.utils.book_new();
//         const worksheet = xlsx.utils.json_to_sheet(extractedData);
//         xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

//         const outputFilePath = path.join(__dirname, 'uploads', 'output.xlsx');
//         xlsx.writeFile(workbook, outputFilePath);

//         res.download(outputFilePath, 'output.xlsx');
//     } else {
//         res.status(400).send('Invalid JSON data');
//     }
// });

// app.listen(port, () => {
//     console.log(`App running at http://localhost:${port}`);
// });

// // Your existing extractData function can be reused


const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const port = 3000;

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files (frontend)
app.use(express.static('public'));

// Helper function: flatten JSON and extract data
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

// Handle file upload and JSON to Excel conversion
app.post('/upload', upload.single('jsonfile'), (req, res) => {
    const filePath = req.file.path;
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const extractedData = extractData(jsonData);

    if (extractedData.length > 0) {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(extractedData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const outputFilePath = path.join(__dirname, 'uploads', 'output.xlsx');
        xlsx.writeFile(workbook, outputFilePath);

        res.download(outputFilePath, 'output.xlsx');
    } else {
        res.status(400).send('Invalid JSON data');
    }
});

// Start server
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
