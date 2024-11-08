// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Number, required: true }, // Store semester as a number
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    pendingCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    acceptedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

// Pre-save middleware to calculate the semester
studentSchema.pre('save', function (next) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // months are 0-based, so add 1

    // Calculate the total semesters the student has attended
    const yearsInSchool = currentYear - this.startYear;

    // If the student is already beyond their end year, don't change the semester
    if (currentYear > this.endYear) {
        return next();
    }

    // Determine if it's Semester 1 or Semester 2 of the current academic year
    const semesterInCurrentYear = currentMonth <= 6 ? 1 : 2;  // 1 for first half, 2 for second half

    // Calculate the semester number
    this.semester = yearsInSchool * 2 + semesterInCurrentYear;

    next();  // Continue saving the student
});

// To use the virtual property, you must call `.populate()` method if necessary
studentSchema.set('toObject', { virtuals: true });
studentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);