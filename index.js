const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://youngdiv-frontend.vercel.app"],
  methods: ["POST", "DELETE", "GET", "PUT"],
  credentials: true
}));

app.use(express.json());

// Root route to prevent "Cannot GET /"
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/log', require('./routes/log'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

module.exports = app;
