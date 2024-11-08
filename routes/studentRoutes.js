// routes/studentRoutes.js
const express = require('express');
const { addCourse, viewCourses } = require('../controllers/studentController');
const auth = require('../middleware/auth.js');
const router = express.Router();

router.post('/add-course', auth(['student']), addCourse);
router.get('/courses', auth(['student']), viewCourses);

module.exports = router;