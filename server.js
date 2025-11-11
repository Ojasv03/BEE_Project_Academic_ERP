const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./db/connectDB');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const noticeRoutes = require("./routes/noticeRoutes");

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

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/notices', noticeRoutes);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
