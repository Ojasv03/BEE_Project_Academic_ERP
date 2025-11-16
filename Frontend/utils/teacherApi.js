import api from "./api";

export const teacherApi = {
  getDashboard: async () => {
    const res = await api.get("/teacher");
    return res.data;
  },

  getStudents: async () => {
    const res = await api.get("/teacher/students");
    return res.data.students;
  },

  markAttendance: async (studentEmail, status) => {
    const res = await api.post("/teacher/attendance", { studentEmail, status });
    return res.data;
  },

  uploadMarks: async (studentEmail, subject, marks) => {
    const res = await api.post("/teacher/marks", { studentEmail, subject, marks });
    return res.data;
  },

  getNotices: async () => {
    const res = await api.get("/notices");
    return res.data.notices || [];
  },
};
