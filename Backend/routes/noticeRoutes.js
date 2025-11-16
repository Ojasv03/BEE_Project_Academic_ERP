const express = require('express');
const Notice = require('../model/Notice');
const allowRoles = require('../middleware/roleMiddleware');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// new notice
router.post('/add', protect,allowRoles("admin"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const notice = await Notice.create({
      title,
      description,
      postedBy: req.user._id,
    });

    // socket concept
    req.io.to('teacher').emit('notification', {
      message: `🆕 New Notice: ${notice.title}`,
    });
    req.io.to('student').emit('notification', {
      message: `🆕 New Notice: ${notice.title}`,
    });

    res.status(201).json({ message: 'Notice posted successfully', notice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('postedBy', 'name email role')
      .sort({ date: -1 });

    res.json({ notices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
