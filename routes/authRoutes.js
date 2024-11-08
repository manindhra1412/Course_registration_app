// routes/authRoutes.js
const express = require('express');
const { signup, login } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', auth(['admin']), signup);
router.post('/login', login);

module.exports = router;