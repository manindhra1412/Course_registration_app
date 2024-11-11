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

// Function to calculate the current semester
studentSchema.methods.calculateSemester = function () {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are 0-based

    // Check if the student is beyond their end year
    if (currentYear > this.endYear) return this.semester;

    // Calculate the number of years since the student started
    const yearsInSchool = currentYear - this.startYear;

    // Determine if it's the first (1) or second (2) semester of the current academic year
    const semesterInCurrentYear = currentMonth <= 6 ? 1 : 2;

    // Calculate and update the semester based on the start year and the current date
    return yearsInSchool * 2 + semesterInCurrentYear;
};

module.exports = mongoose.model('Student', studentSchema);