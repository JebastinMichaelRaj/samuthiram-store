const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: Number, required: true },
    name:      { type: String, required: true },
    unit:      { type: String, required: true },
    price:     { type: Number, required: true },
    qty:       { type: Number, required: true },
    total:     { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId:         { type: String, unique: true, required: true },
    items:           [orderItemSchema],
    totalAmount:     { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'placed'
    },
    statusHistory: [{
        status:    String,
        note:      String,
        updatedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
