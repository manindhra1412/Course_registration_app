// controllers/studentController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');

exports.addCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);

        const user = await Student.findOne({ user: req.user._id })
            .populate('pendingCourses')
            .populate('acceptedCourses');

        if (!user) {
            return res.status(404).send('Student not found');
        }

        const totalCredits = user.acceptedCourses.concat(user.pendingCourses)
            .reduce((total, course) => total + course.credits, 0);

        if (totalCredits + course.credits > 25) {
            return res.status(400).send('Cannot add course, total credits would exceed 25.');
        }

        await Student.findOneAndUpdate(
            { user: req.user._id },
            { $addToSet: { pendingCourses: course._id } },
            { new: true }
        );

        res.send('Course added to pending courses');
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};


exports.viewCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id }).populate({ path: 'courses', strictPopulate: false });
        res.json(student.courses);
    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message);
    }
};
