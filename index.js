require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/Product');
const defaultProducts = require('./seed');

const app = express();

// ✅ FIX: Increase payload size
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use(express.static(__dirname));

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI;

console.log("MONGO_URI:", MONGO_URI);

if (!MONGO_URI) {
    console.error("❌ MONGODB_URI is NOT set!");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected');

        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Seeding initial products data...');
            await Product.insertMany(defaultProducts);
            console.log('Database seeded successfully!');
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ API Routes

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.json(products);
    } catch (err) {
        console.error("GET ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const newId = lastProduct ? lastProduct.id + 1 : 1;

        const newProduct = new Product({
            ...req.body,
            id: newId
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        console.error("POST ERROR:", err);
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { ...req.body, lastUpdated: Date.now() },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        console.error("PUT ERROR:", err);
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: parseInt(req.params.id) });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(400).json({ error: err.message });
    }
});

// Seed route
app.post('/api/seed', async (req, res) => {
    try {
        await Product.deleteMany();
        await Product.insertMany(defaultProducts);
        res.json({ message: 'Database reset and seeded successfully!' });
    } catch (err) {
        console.error("SEED ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// Fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});