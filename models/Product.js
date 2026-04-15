const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    badge: { type: String, default: "" },
    badgeType: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
