"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiUsers, FiBookOpen, FiCalendar } from "react-icons/fi";
import { teacherApi } from "@/utils/teacherApi";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [subjectInput, setSubjectInput] = useState(""); 
  const [marksInput, setMarksInput] = useState({}); 

  useEffect(() => {
    async function loadData() {
      try {
        const dash = await teacherApi.getDashboard();
        setTeacher(dash.teacher || { name: dash.message.split(",")[1].trim() });

        const stuList = await teacherApi.getStudents();
        setStudents(stuList);

        const noticeList = await teacherApi.getNotices();
        setNotices(noticeList);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleAttendance = async (email, status) => {
    try {
      await teacherApi.markAttendance(email, status);
      alert(`Attendance marked ${status} for ${email}`);
    } catch (err) {
      console.error(err);
      alert("Error marking attendance");
    }
  };

  const handleMarksUpload = async (email) => {
    try {
      const mark = marksInput[email];
      if (!subjectInput || mark == null) {
        alert("Enter subject and marks first");
        return;
      }
      await teacherApi.uploadMarks(email, subjectInput, Number(mark));
      alert(`Marks uploaded for ${email}`);
      setMarksInput(prev => ({ ...prev, [email]: "" }));
    } catch (err) {
      console.error(err);
      alert("Error uploading marks");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FiUser size={18} /> },
    { id: "attendance", label: "Mark Attendance", icon: <FiCalendar size={18} /> },
    { id: "marks", label: "Upload Marks", icon: <FiBookOpen size={18} /> },
    { id: "updates", label: "Updates", icon: <FiUsers size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#11161d] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 text-blue-400 tracking-wide">
          Teacher Panel
        </h2>
        <nav className="space-y-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                activeTab === t.id
                  ? "bg-blue-600/90 shadow-md"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-blue-400 drop-shadow-lg">
            Welcome, {teacher?.name || "Loading..."}
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Manage your classes, students & updates.
          </p>
        </header>

        <AnimatePresence mode="wait">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl">
                <h3 className="text-lg font-semibold">Total Students</h3>
                <p className="text-4xl font-bold text-blue-400 mt-3">
                  {students.length ?? "—"}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl col-span-full">
                <h3 className="text-lg font-semibold">Classes</h3>
                <p className="text-xl mt-2 text-white/80">
                  {teacher?.classes?.join(", ") || "No classes assigned"}
                </p>
              </div>
            </motion.div>
          )}

          {/* MARK ATTENDANCE */}
          {activeTab === "attendance" && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
              {students.map(stu => (
                <div
                  key={stu._id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-lg"
                >
                  <span>{stu.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttendance(stu.email, "present")}
                      className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAttendance(stu.email, "absent")}
                      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* UPLOAD MARKS */}
          {activeTab === "marks" && (
            <motion.div
              key="marks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold mb-4">Upload Marks</h2>
              <input
                type="text"
                placeholder="Enter Subject"
                value={subjectInput}
                onChange={e => setSubjectInput(e.target.value)}
                className="px-4 py-2 rounded bg-white/10 text-white w-full mb-4"
              />
              {students.map(stu => (
                <div
                  key={stu._id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-lg"
                >
                  <span>{stu.name}</span>
                  <input
                    type="number"
                    placeholder="Marks"
                    value={marksInput[stu.email] || ""}
                    onChange={e =>
                      setMarksInput(prev => ({ ...prev, [stu.email]: e.target.value }))
                    }
                    className="px-2 py-1 rounded bg-white/10 w-20 text-white"
                  />
                  <button
                    onClick={() => handleMarksUpload(stu.email)}
                    className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Upload
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* UPDATES (NOTICES) */}
          {activeTab === "updates" && (
            <motion.div
              key="updates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold mb-4">Updates</h2>
              {notices.map((n, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 p-5 rounded-xl shadow-xl"
                >
                  <h3 className="text-lg font-semibold text-blue-300">{n.title}</h3>
                  <p className="text-white/70 mt-1">{n.description}</p>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
