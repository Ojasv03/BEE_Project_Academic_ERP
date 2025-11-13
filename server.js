const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./db/connectDB');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const noticeRoutes = require("./routes/noticeRoutes");

const Attendance = require('./model/Attendance');
const Marks = require('./model/Marks');   
const User = require('./model/User');     

dotenv.config();
connectDB();

const app = express();

// socket setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  
        credentials: true
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend analytics page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

app.use('/notices', noticeRoutes);


app.get('/analytics/teacher/:teacherId', async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = req.query.to ? new Date(req.query.to) : new Date();

        // Attendance aggregation (uses markedBy)
        const attendanceAgg = await Attendance.aggregate([
            {
                $match: {
                    markedBy: new mongoose.Types.ObjectId(teacherId),
                    date: { $gte: from, $lte: to }
                }
            },
            {
                $group: {
                    _id: '$student',
                    presents: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            },
            {
                $project: {
                    studentId: '$_id',
                    presents: 1,
                    total: 1,
                    attendancePercent: { $multiply: [{ $divide: ['$presents', '$total'] }, 100] }
                }
            }
        ]);

        // Marks aggregation (uses uploadedBy)
        const marksAgg = await Marks.aggregate([
            {
                $match: {
                    uploadedBy: new mongoose.Types.ObjectId(teacherId),
                    date: { $gte: from, $lte: to }
                }
            },
            {
                $group: {
                    _id: '$student',
                    avgMarks: { $avg: '$marks' }
                }
            },
            {
                $project: { studentId: '$_id', avgMarks: 1 }
            }
        ]);

        // Merge data
        const byStudentMap = {};
        attendanceAgg.forEach(a => {
            byStudentMap[String(a.studentId)] = {
                studentId: a.studentId,
                attendancePercent: a.attendancePercent.toFixed(2),
                presents: a.presents,
                total: a.total
            };
        });

        marksAgg.forEach(m => {
            const sid = String(m.studentId);
            if (!byStudentMap[sid]) byStudentMap[sid] = { studentId: m.studentId };
            byStudentMap[sid].avgMarks = m.avgMarks ? Number(m.avgMarks.toFixed(2)) : null;
        });

        // Fetch student info
        const studentIds = Object.keys(byStudentMap).map(id => byStudentMap[id].studentId);
        const students = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('name email batch');
        const studentById = {};
        students.forEach(s => { studentById[String(s._id)] = s; });

        const perStudent = Object.values(byStudentMap).map(item => ({
            studentId: item.studentId,
            name: studentById[String(item.studentId)] ? studentById[String(item.studentId)].name : null,
            email: studentById[String(item.studentId)] ? studentById[String(item.studentId)].email : null,
            batch: studentById[String(item.studentId)] ? studentById[String(item.studentId)].batch : null,
            attendancePercent: item.attendancePercent || 0,
            avgMarks: item.avgMarks || null,
            presents: item.presents || 0,
            totalSessions: item.total || 0
        }));

        // Compute overall stats
        const overallAttendance = perStudent.length
            ? (perStudent.reduce((s, x) => s + Number(x.attendancePercent), 0) / perStudent.length)
            : 0;
        const classAvgMarks = perStudent.length
            ? (perStudent.reduce((s, x) => s + (x.avgMarks || 0), 0) / perStudent.length)
            : 0;

        res.json({
            meta: { from, to, teacherId },
            overallAttendance: Number(overallAttendance.toFixed(2)),
            classAverageMarks: Number(classAvgMarks.toFixed(2)),
            perStudent
        });

    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Failed to compute analytics', details: err.message });
    }
});

// socket connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // role registration from frontend
    socket.on('registerRole', (data) => {
        if (data && data.role) {
            socket.join(data.role);
            console.log(`${data.role} joined room`);
        } else {
            console.log('Invalid role data received:', data);
        }
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
