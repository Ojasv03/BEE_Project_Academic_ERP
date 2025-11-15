"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiUsers, FiBookOpen, FiCalendar } from "react-icons/fi";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [teacher, setTeacher] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API}/teacher`, { credentials: "include" });
        const data = await res.json();
        setTeacher(data.teacher);
      } catch (err) {
        console.error("Teacher fetch error:", err);
      }
    }
    loadData();
  }, [API]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FiUser size={18} /> },
    { id: "students", label: "My Students", icon: <FiUsers size={18} /> },
    { id: "subjects", label: "Subjects", icon: <FiBookOpen size={18} /> },
    { id: "schedule", label: "Schedule", icon: <FiCalendar size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#11161d] text-white">

      {/* SIDEBAR LIKE STUDENT */}
      <aside className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 text-blue-400 tracking-wide">
          Teacher Panel
        </h2>

        <nav className="space-y-2">
          {tabs.map((t) => (
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
            Manage your classes, students & teaching schedule.
          </p>
        </header>

        <AnimatePresence mode="wait">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {/* Total Students */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl">
                <h3 className="text-lg font-semibold">Total Students</h3>
                <p className="text-4xl font-bold text-blue-400 mt-3">
                  {teacher?.studentCount ?? "—"}
                </p>
              </div>

              {/* Subjects Assigned */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl">
                <h3 className="text-lg font-semibold">Subjects Assigned</h3>
                <p className="text-4xl font-bold text-blue-400 mt-3">
                  {teacher?.subjects?.length ?? "—"}
                </p>
              </div>

              {/* Batch Info */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl col-span-full">
                <h3 className="text-lg font-semibold">Classes</h3>
                <p className="text-xl mt-2 text-white/80">
                  {teacher?.classes?.join(", ") || "No classes assigned"}
                </p>
              </div>
            </motion.div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">My Students</h2>

              <div className="space-y-3">
                {teacher?.students?.map((stu, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between"
                  >
                    <span className="text-white/80">{stu.name}</span>
                    <span className="text-blue-300 text-sm">{stu.class}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === "subjects" && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Subjects</h2>

              <ul className="space-y-3">
                {teacher?.subjects?.map((sub, idx) => (
                  <li
                    key={idx}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg text-white/80"
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* SCHEDULE TAB */}
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Teaching Schedule</h2>

              <div className="space-y-3">
                {teacher?.schedule?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <p className="text-white/80">{item.day}</p>
                    <p className="text-blue-300 text-sm">{item.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
