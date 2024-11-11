// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    semester: Number,
    credits: { type: Number, max: 8 },
    status: Boolean,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);