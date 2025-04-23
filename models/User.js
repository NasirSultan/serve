const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  number: String, // ← added field
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

module.exports = mongoose.model('User', userSchema);
