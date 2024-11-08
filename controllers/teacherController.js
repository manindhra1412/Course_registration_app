// controllers/teacherController.js
const Course = require('../models/Course');
const Student = require('../models/Student');

// controllers/teacherController.js
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user._id });
        res.status(201).json(courses);  // Render teacher.ejs with courses data
    } catch (error) {
        res.status(400).send(error.message);
    }
};


exports.addCourse = async (req, res) => {
    try {
        const course = new Course({ ...req.body, teacher: req.user._id });
        await course.save();
        res.status(201).send('Course added');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
        res.send('Course deleted');
    } catch (error) {
        res.status(400).send(error.message);
    }
};