// routes/adminRoutes.js
const express = require('express');
const { createUser, viewUsers } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create-user', auth(['admin']), createUser);
router.get('/users/:role', auth(['admin']), viewUsers);

module.exports = router;