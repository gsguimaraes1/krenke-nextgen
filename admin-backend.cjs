const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'public', 'assets');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Preserve the original name or create a unique one
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read products' });
    }
});

// Update product
app.post('/api/products/update', (req, res) => {
    try {
        const { originalId, ...updatedProduct } = req.body;
        const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

        const index = data.findIndex(p => p.id === originalId);
        if (index !== -1) {
            // If the ID is changing, check if the new ID already exists
            if (updatedProduct.id !== originalId) {
                const idExists = data.some(p => p.id === updatedProduct.id);
                if (idExists) {
                    return res.status(400).json({ error: 'Nouveau ID already exists' });
                }
            }
            data[index] = { ...data[index], ...updatedProduct };
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        success: true,
        filename: req.file.filename,
        path: `/assets/${req.file.filename}`
    });
});

app.listen(port, () => {
    console.log(`Admin backend listening at http://localhost:${port}`);
});
