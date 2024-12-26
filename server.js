const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Set up file storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create upload folder if it doesn't exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Handle Excel file upload and processing
app.post('/upload', upload.single('excel'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
        const workbook = xlsx.readFile(file.path);
        const sheets = workbook.SheetNames.map(sheetName => ({
            sheetName,
            data: xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]),
        }));

        fs.unlinkSync(file.path); // Delete the file after processing
        res.json({ success: true, sheets });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ success: false, message: 'Failed to process the file.' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
