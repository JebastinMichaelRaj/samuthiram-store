require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const Product = require('./models/Product');
const Feedback = require('./models/Feedback');
const Order = require('./models/Order');
const defaultProducts = require('./seed');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Session — keeps admin login state server-side (no plaintext in localStorage)
app.use(session({
    secret: process.env.SESSION_SECRET || 'samuthiram-session-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,          // JS cannot read this cookie
        secure: false,           // set true in production (HTTPS)
        maxAge: 8 * 60 * 60 * 1000  // 8 hours
    }
}));

// Rate limiting — protects all /api/ routes from abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 200,                    // max 200 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Serve static files from the root and productimage directory
app.use(express.static(__dirname));
app.use('/productimage', express.static(path.join(__dirname, 'productimage')));

// ==================== LOCAL IMAGE STORAGE ====================
const uploadDir = path.join(__dirname, 'productimage');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

function saveImageLocally(base64Image, productId) {
    // Only save if it's a new base64 image, skip if it's already a URL
    if (!base64Image || !base64Image.startsWith('data:image/')) return base64Image;
    
    try {
        const matches = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 string');
        }
        
        let ext = matches[1];
        if (ext === 'jpeg') ext = 'jpg';
        
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `product_${productId}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        
        return `/productimage/${fileName}`;
    } catch (err) {
        console.error('Local Image Save Error:', err);
        throw new Error('Image save failed');
    }
}

// ==================== MONGODB ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samuthiram_store')
    .then(async () => {
        console.log('MongoDB connected');
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Seeding initial products data...');
            await Product.insertMany(defaultProducts);
            console.log('Database seeded successfully!');
        }
    })
    .catch(err => console.log('MongoDB connection error:', err));

// ==================== AUTH MIDDLEWARE ====================
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) return next();
    res.status(403).json({ error: 'Unauthorized. Please log in.' });
}

// ==================== ADMIN AUTH ROUTES ====================

// Login — validates credentials and sets a secure server-side session
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const validUser = process.env.ADMIN_USERNAME || 'admin';
        const storedHash = process.env.ADMIN_PASSWORD_HASH;

        let isValid = false;

        if (storedHash) {
            // Production: compare against bcrypt hash in .env
            isValid = username === validUser && await bcrypt.compare(password, storedHash);
        } else {
            // Development fallback: plaintext compare (set ADMIN_PASSWORD_HASH in .env for production)
            const fallbackPass = process.env.ADMIN_PASSWORD || 'samuthiram123';
            isValid = username === validUser && password === fallbackPass;
        }

        if (isValid) {
            req.session.isAdmin = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

// Auth check (used by admin.js to verify session on page load)
app.get('/api/admin/check', (req, res) => {
    res.json({ loggedIn: req.session?.isAdmin === true });
});

// Generate bcrypt hash — helper route for setting up ADMIN_PASSWORD_HASH in .env
// Only accessible in development (NODE_ENV !== 'production')
app.post('/api/admin/generate-hash', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const hash = await bcrypt.hash(password, 10);
    res.json({ hash, note: 'Add this as ADMIN_PASSWORD_HASH in your .env file' });
});

// ==================== PRODUCT API ====================
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product — protected + handles duplicate ID race condition
app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const newId = lastProduct ? lastProduct.id + 1 : 1;
        
        if (req.body.image && req.body.image.startsWith('data:image/')) {
            req.body.image = saveImageLocally(req.body.image, newId);
        }

        const newProduct = new Product({ ...req.body, id: newId });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate id race — find the actual current max and retry once
            try {
                const maxDoc = await Product.findOne().sort({ id: -1 });
                const retryProduct = new Product({ ...req.body, id: (maxDoc?.id || 0) + 1 });
                const saved = await retryProduct.save();
                return res.status(201).json(saved);
            } catch (retryErr) {
                return res.status(400).json({ error: retryErr.message });
            }
        }
        res.status(400).json({ error: err.message });
    }
});

// Update product — protected
app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        if (req.body.image && req.body.image.startsWith('data:image/')) {
            req.body.image = saveImageLocally(req.body.image, productId);
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { id: productId },
            { ...req.body, lastUpdated: Date.now() },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete product — protected
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
        if (!deleted) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Seed — protected (was completely open before)
app.post('/api/seed', requireAdmin, async (req, res) => {
    try {
        await Product.deleteMany();
        await Product.insertMany(defaultProducts);
        res.json({ message: 'Database reset and seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== FEEDBACK API ====================
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        const saved = await newFeedback.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/feedback/:id', requireAdmin, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==================== ORDER API ====================

// Helper: generate a human-readable order ID like SS-20250510-0042
async function generateOrderId() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Order.countDocuments() + 1;
    return `SS-${today}-${String(count).padStart(4, '0')}`;
}

// Customer: place an order (called when WhatsApp is opened)
app.post('/api/orders', async (req, res) => {
    try {
        const { items, totalAmount, deliveryAddress } = req.body;
        if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });
        if (!deliveryAddress)       return res.status(400).json({ error: 'Delivery address required' });

        const orderId = await generateOrderId();
        const order = new Order({
            orderId,
            items,
            totalAmount,
            deliveryAddress,
            statusHistory: [{ status: 'placed', note: 'Order placed via WhatsApp' }]
        });
        const saved = await order.save();
        res.status(201).json({ orderId: saved.orderId, _id: saved._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Customer: track a single order by orderId (no auth needed)
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: get all orders
app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: update order status
app.patch('/api/orders/:orderId/status', requireAdmin, async (req, res) => {
    try {
        const { status, note } = req.body;
        const allowed = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            {
                status,
                updatedAt: new Date(),
                $push: { statusHistory: { status, note: note || '', updatedAt: new Date() } }
            },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin: delete an order
app.delete('/api/orders/:orderId', requireAdmin, async (req, res) => {
    try {
        await Order.findOneAndDelete({ orderId: req.params.orderId });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==================== HTML ROUTES ====================
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.ADMIN_PASSWORD_HASH) {
        console.warn('[SECURITY] ADMIN_PASSWORD_HASH not set in .env. Using fallback plaintext password.');
        console.warn('[SECURITY] Run: POST /api/admin/generate-hash with {"password":"yourpassword"} to get a bcrypt hash, then add it to .env');
    }
});
