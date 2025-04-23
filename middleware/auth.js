const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(verified.id);
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send('Admin Access Only');
  next();
};

module.exports = { auth, isAdmin };
