const express = require("express");
const router = express.Router();
const Notice = require("../model/Notice");
const User = require("../model/User");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

// student list
router.get("/students", protect,allowRoles("admin"), async (req, res) => {
  const students = await User.find({ role: "student" });
  res.json(students);
});

// teacher list
router.get("/teachers", protect, allowRoles("admin"), async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" });
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// assign batch
router.patch("/students/:id/batch", protect,allowRoles("admin"), async (req, res) => {
  const { batch } = req.body;
  const student = await User.findByIdAndUpdate(req.params.id, { batch }, { new: true });
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json({ message: "Batch assigned", student });
});

// send notice
router.post("/notice", protect,allowRoles("admin"), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const notice = new Notice({
      title,
      content,
      createdBy: req.user.name,
    });
    await notice.save();

    const io = req.app.get("io");
    io.emit("new-notice", {
      message: "🆕 New notice posted",
      title: notice.title,
    });

    res.status(201).json({ message: "Notice posted successfully", notice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
