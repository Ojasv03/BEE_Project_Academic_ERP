const express = require('express');
const User = require('../model/User');
const Attendance = require('../model/Attendance');
const Marks = require('../model/Marks');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Teacher dashboard
router.get('/', protect, allowRoles("teacher"), async (req, res) => {
  res.json({ message: `Welcome to your Teacher Dashboard, ${req.user.name}!` });
});

// Student list
router.get('/students', protect, allowRoles("teacher"), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email batch'); 
    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance 
router.post('/attendance', protect, allowRoles("teacher"), async (req, res) => {
  try {
    const { studentEmail, status } = req.body;
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const attendance = await Attendance.create({
      student: student._id,
      markedBy: req.user._id,
      status
    });

    // Socket 
    req.io.to('student').emit('notification', {
      message: `📅 Attendance updated for today`,
      type: "attendance"
    });

    res.json({ message: 'Attendance marked', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload marks 
router.post('/marks', protect, allowRoles("teacher"), async (req, res) => {
  try {
    const { studentEmail, subject, marks } = req.body;
    if (!studentEmail || !subject || marks == null) {
      return res.status(400).json({ message: 'studentEmail, subject, and marks required' });
    }

    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marksDoc = await Marks.create({
      student: student._id,
      subject,
      marks: Number(marks),
      uploadedBy: req.user._id
    });

    // Socket 
    req.io.to('student').emit('notification', {
      message: `📝 New marks uploaded`,
      type: "marks"
    });

    res.json({ message: 'Marks added', marks: marksDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
