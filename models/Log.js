const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, enum: ['add', 'delete'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productSnapshot: {
    name: String,
    price: Number,
    quantity: Number,
    totalAmount: Number
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

// Removed pre-save hook and TTL index

module.exports = mongoose.model('Log', logSchema);
