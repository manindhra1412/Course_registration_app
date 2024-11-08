/**
* Copyright 2019 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
**/
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');  // Import CORS
const message = require('./utils');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const auth = require('./middleware/auth');
const Course = require('./models/Course');
const Student = require('./models/Student');
app.use(cookieParser())
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

var PORT;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

connectDB();

app.get('/', function (req, res) {
  res.send(message.getWelcomeMessage());
});

app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/main', auth(['student', 'teacher', 'admin']), (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.get('/enrolled-courses', auth(['student']), async (req, res) => {
  try {
    const user = await Student.findOne({ user: req.user._id })
      .populate({ path: 'acceptedCourses', populate: { path: 'teacher', select: 'name' }, strictPopulate: false })
      .populate({ path: 'pendingCourses', populate: { path: 'teacher', select: 'name' }, strictPopulate: false });
    const currentSemester = user.semester;
    const previous_courses = user.acceptedCourses.map((e) => e.semester !== currentSemester);

    // Check if user is found
    if (!user) {
      return res.status(404).send('Student not found');
    }

    res.render('viewCourse', {
      previous_courses,
      pendingCourses: user.pendingCourses,
      acceptedCourses: user.acceptedCourses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Server error');
  }
});

app.get('/course-registration', auth(['student']), async (req, res) => {
  try {
    const user = await Student.findOne({ user: req.user._id })
      .populate({
        path: 'pendingCourses',
        populate: { path: 'teacher', select: 'name' }, // Populate teacher's name in pending courses
      })
      .populate({
        path: 'acceptedCourses',
        populate: { path: 'teacher', select: 'name' }, // Populate teacher's name in accepted courses
      });

    const semester = user.semester;

    const allCourses = await Course.find({ semester, status: true })
      .populate({ path: 'teacher', select: 'name' });  // Populate teacher's name in available courses

    const enrolledCourseIds = [...user.pendingCourses, ...user.acceptedCourses].map(course => course._id.toString());

    const availableCourses = allCourses.filter(course => !enrolledCourseIds.includes(course._id.toString()));

    res.render('enrollCourse', {
      user: req.user,
      semester,
      courses: availableCourses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Server error');
  }
});



app.get('/teacher-dashboard', auth(['teacher']), async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id });
  res.render('teacher', { courses });
});

app.get('/admin-dashboard', auth(['admin']), (req, res) => {
  res.render('admin', { user: req.user });
});

// Route to fetch students for a specific course
app.get('/teacher/course/:courseId', auth(['teacher']), async (req, res) => {
  const { courseId } = req.params;

  try {
    const pendingStudents = await Student.find({ pendingCourses: courseId }).populate('user');
    const acceptedStudents = await Student.find({ acceptedCourses: courseId }).populate('user');
    const course = await Course.findById(courseId);

    res.render('courseStudents', {
      course,
      pendingStudents,
      acceptedStudents
    });
  } catch (error) {
    console.error('Error fetching students for course:', error);
    res.status(500).send('Server error');
  }
});

app.post('/teacher/course/:courseId/accept/:studentId', auth(['teacher']), async (req, res) => {
  const { courseId, studentId } = req.params;
  try {
    // Move the student from pending to accepted for the course
    await Student.findByIdAndUpdate(studentId, {
      $pull: { pendingCourses: courseId },
      $addToSet: { acceptedCourses: courseId }
    });
    res.status(200).send('Student accepted successfully');
  } catch (error) {
    console.error('Error accepting student:', error);
    res.status(500).send('Error accepting student');
  }
});

// Reject student in a course
app.post('/teacher/course/:courseId/reject/:studentId', auth(['teacher']), async (req, res) => {
  const { courseId, studentId } = req.params;
  try {
    // Remove the student from pending courses
    await Student.findByIdAndUpdate(studentId, {
      $pull: { pendingCourses: courseId }
    });
    res.status(200).send('Student rejected successfully');
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).send('Error rejecting student');
  }
});

if (process.env.PORT) {
  PORT = process.env.PORT;
} else {
  PORT = 80;
}



app.listen(PORT);
console.log(message.getPortMessage() + PORT);