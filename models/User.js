// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true }
});

module.exports = mongoose.model('User', userSchema);