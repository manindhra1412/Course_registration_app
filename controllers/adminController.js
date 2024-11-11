const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt');
// Create a new user
exports.createUser = async (req, res) => {
    try {
        let { name, username, password, role, department, semester, startYear, endYear } = req.body;
        password = await bcrypt.hash(password, 10);
        // Create the main user record
        const user = new User({ name, username, password, role });
        await user.save();

        // Based on the role, add to Student or Teacher model
        if (role === 'student') {
            const student = new Student({ user: user._id, semester, startYear, endYear });
            await student.save();
        } else if (role === 'teacher') {
            const teacher = new Teacher({ user: user._id, department });
            await teacher.save();
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Fetch users by role
// controllers/adminController.js
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const { semester, department } = req.query;
        let users;

        if (role === 'student') {
            const filter = semester ? { semester: parseInt(semester) } : {};
            users = await Student.find(filter).populate('user');
        } else if (role === 'teacher') {
            const filter = department ? { department } : {};
            users = await Teacher.find(filter).populate('user');
        } else if (role === 'admin') {
            users = await User.find({ role: 'admin' });
        }

        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
