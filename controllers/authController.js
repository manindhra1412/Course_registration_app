// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        console.log(username);

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).send('Invalid credentials');
        }
        const token = jwt.sign({ _id: user._id, name: user.name, role: user.role }, process.env.JWT_TOKEN);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/main');
    } catch (error) {
        res.status(400).send('Error logging in');
    }
};