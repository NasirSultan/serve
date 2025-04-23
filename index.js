const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors({
  origin: ["https://youngdiv-frontend.vercel.app"], // no trailing slash
  methods: ["POST","DELETE","GET","PUT"], // should be 'methods' (plural) and uppercase
  credentials: true
}));

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/log', require('./routes/log'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('Server running on port', process.env.PORT);
    });
  })
  .catch(err => console.log(err));
