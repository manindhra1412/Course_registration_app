// routes/teacherRoutes.js
const express = require('express');
const { addCourse, deleteCourse, getCourses } = require('../controllers/teacherController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/course', auth(['teacher']), getCourses);
router.post('/course', auth(['teacher']), addCourse);
router.delete('/delete-course/:id', auth(['teacher']), deleteCourse);


module.exports = router;