const express = require('express');
const User = require('../model/User');
const Attendance = require('../model/Attendance');
const Marks = require('../model/Marks');
const Notice = require('../model/Notice');
const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// student dashboard
router.get('/', protect, allowRoles("student"), async (req, res) => {
  try {
    // Fetch student basic info
    const student = await User.findById(req.user._id).select('name email batch role');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch attendance records from Attendance collection
    const attendanceRecords = await Attendance.find({ student: req.user._id })
      .select('date status')
      .sort({ date: -1 });

    const attendanceObj = {};
    attendanceRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('en-IN');
      attendanceObj[date] = record.status;
    });

    // Fetch marks records from Marks collection
    const marksRecords = await Marks.find({ student: req.user._id })
      .select('subject marks')
      .sort({ date: -1 });

    const marksObj = {};
    marksRecords.forEach(record => {
      marksObj[record.subject] = record.marks;
    });

    // Fetch notices
    const notices = await Notice.find().sort({ date: -1 });
    const updatesObj = {};
    notices.forEach((record, index) => {
      updatesObj[`update_${index + 1}`] = {
        title: record.title,
        description: record.description,
        date: record.date
      };
    });

    res.json({
      student: {
        name: student.name,
        email: student.email,
        batch: student.batch,
        attendance: attendanceObj,
        marks: marksObj,
        updates: updatesObj
      }
    });

  } catch (err) {
    console.error('Error in student dashboard route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
