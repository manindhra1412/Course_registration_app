// controllers/adminController.js
const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.viewUsers = async (req, res) => {
    try {
        const users = await User.find({ role: req.params.role });
        res.json(users);
    } catch (error) {
        res.status(400).send(error.message);
    }
};