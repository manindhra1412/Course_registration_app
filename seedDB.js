const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
// Import Models
const User = require('./models/User');
const Course = require('./models/Course');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');

// MongoDB URI (adjust this based on your database)
const dbURI = process.env.MONGO_URI;

// Function to calculate semester based on the start year
function calculateSemester(startYear) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 = January, 11 = December
    let semester = (currentYear - startYear) * 2;

    // If the current month is January to June (Spring/Summer semester), it's an odd semester (1st, 3rd, etc.)
    if (currentMonth < 6) {
        semester++;
    }

    return semester;
}

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Database connected successfully.');

        // 1. Clear the Database (delete all records in the collections)
        await User.deleteMany({});
        await Course.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});

        console.log('Database cleared.');

        // 2. Create Users
        const users = [
            // Students
            {
                name: 'John Doe',
                username: '21BCS001',
                password: 'password123', // This will be hashed
                role: 'student',
                startYear: 2022,
                endYear: 2026,
            },
            {
                name: 'Alice Green',
                username: '21BCS002',
                password: 'password123',
                role: 'student',
                startYear: 2022,
                endYear: 2026,
            },
            {
                name: 'Bob Brown',
                username: '21BCS003',
                password: 'password123',
                role: 'student',
                startYear: 2022,
                endYear: 2026,
            },
            // Teachers
            {
                name: 'Jane Smith',
                username: 'jane_cse',
                password: 'password123',
                role: 'teacher',
            },
            {
                name: 'Richard White',
                username: 'richard_cse',
                password: 'password123',
                role: 'teacher',
            },
            // Admin
            {
                name: 'Admin User',
                username: 'ADMIN001',
                password: 'admin123',
                role: 'admin',
            },
        ];

        // Hash passwords and save users
        const userDocs = [];
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword,
            });
            userDocs.push(await user.save());
        }

        console.log('Users created.');

        // 3. Create Courses
        const courses = [
            { title: 'Math 101', code: 'MTH101', semester: 1, credits: 3, status: true, teacher: userDocs[3]._id },
            { title: 'Physics 101', code: 'PHY101', semester: 1, credits: 4, status: true, teacher: userDocs[3]._id },
            { title: 'History 101', code: 'HIS101', semester: 1, credits: 3, status: true, teacher: userDocs[3]._id },
            { title: 'Chemistry 101', code: 'CHEM101', semester: 2, credits: 3, status: true, teacher: userDocs[4]._id },
            { title: 'Computer Science 101', code: 'CS101', semester: 1, credits: 4, status: true, teacher: userDocs[4]._id },
            { title: 'Data Structures', code: 'CS102', semester: 2, credits: 4, status: true, teacher: userDocs[4]._id },
            { title: 'Database Management', code: 'DBM101', semester: 3, credits: 3, status: true, teacher: userDocs[3]._id },
            { title: 'Algorithms', code: 'CS201', semester: 3, credits: 4, status: true, teacher: userDocs[4]._id },
        ];

        const courseDocs = [];
        for (const courseData of courses) {
            const course = new Course(courseData);
            courseDocs.push(await course.save());
        }

        console.log('Courses created.');

        // 4. Create Students (Automatically calculate the semester)
        const students = [
            {
                user: userDocs[0]._id,  // John Doe is the student
                startYear: 2022,
                endYear: 2026,
                semester: calculateSemester(2022),
                pendingCourses: [courseDocs[0]._id, courseDocs[1]._id],  // Math 101, Physics 101
                acceptedCourses: [courseDocs[2]._id], // History 101
            },
            {
                user: userDocs[1]._id,  // Alice Green
                startYear: 2022,
                endYear: 2026,
                semester: calculateSemester(2022),
                pendingCourses: [courseDocs[0]._id, courseDocs[2]._id],  // Math 101, History 101
                acceptedCourses: [courseDocs[3]._id], // Chemistry 101
            },
            {
                user: userDocs[2]._id,  // Bob Brown
                startYear: 2022,
                endYear: 2026,
                semester: calculateSemester(2022),
                pendingCourses: [courseDocs[1]._id, courseDocs[4]._id],  // Physics 101, Computer Science 101
                acceptedCourses: [courseDocs[2]._id], // History 101
            },
        ];

        for (const studentData of students) {
            const student = new Student(studentData);
            await student.save();
        }

        console.log('Students created.');

        // 5. Create Teachers
        const teachers = [
            {
                user: userDocs[3]._id,  // Jane Smith is the teacher
                department: 'Computer Science',
            },
            {
                user: userDocs[4]._id,  // Richard White is the teacher
                department: 'Computer Science',
            },
        ];

        for (const teacherData of teachers) {
            const teacher = new Teacher(teacherData);
            await teacher.save();
        }

        console.log('Teachers created.');

        // Close the database connection after seeding
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding the database:', error);
        mongoose.connection.close();
    }
}

seedDatabase();