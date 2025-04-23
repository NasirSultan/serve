const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).send('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed, role: 'admin' });
  await user.save();
  res.status(201).send('Admin registered');
};



exports.registerUser = async (req, res) => {
  const { username, email,number, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).send('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email,number, password: hashed, role: 'user' });
  await user.save();
  res.status(201).send('User registered');
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ user, token });

};



exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password'); // exclude password for security
    if (!user) return res.status(404).send('User not found');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
