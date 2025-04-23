const express = require('express');
const router = express.Router();
const { registerAdmin, login, registerUser,getUserById } = require('../controllers/authController');

router.post('/admin/register', registerAdmin);
router.post('/register', registerUser); 
router.post('/login', login);

router.post('/user/:id',getUserById);

module.exports = router;
