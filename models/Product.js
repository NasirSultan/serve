const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: { // Actual price of the product
    type: Number,
    required: true
  },
  paidPrice: { // What the user paid
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
