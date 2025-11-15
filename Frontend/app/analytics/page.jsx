"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [teacherId, setTeacherId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!teacherId) return alert("Enter teacher id");
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`${API}/analytics/teacher/${teacherId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Unable to load analytics");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#0c0a14] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-purple-500/20 p-6">
        <h2 className="text-2xl font-bold mb-8 text-purple-400">Admin Panel</h2>

        <nav className="space-y-3">
          <a href="/admin" className="block px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition">
            Dashboard
          </a>
          <a href="/admin" className="block px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition">
            Students
          </a>
          <a href="/analytics" className="block px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition">
            Analytics
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-purple-400">Analytics</h1>
          <p className="text-white/70 mt-1">
            Teacher level analytics & class performance
          </p>
        </header>

        {/* Input Box */}
        <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 max-w-3xl">
          <div className="flex gap-3">
            <input
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="Enter teacher id"
              className="flex-1 p-3 rounded-lg bg-[#120f1f] border border-purple-500/20"
            />
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition rounded-lg"
            >
              Fetch
            </button>
          </div>
        </div>

        {/* Data Output */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-sm text-white/70">Overall Attendance</h3>
                <p className="text-2xl font-bold text-purple-300 mt-2">
                  {data.overallAttendance}%
                </p>
              </div>

              <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-sm text-white/70">Class Average Marks</h3>
                <p className="text-2xl font-bold text-purple-300 mt-2">
                  {data.classAverageMarks}
                </p>
              </div>
            </div>

            <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white/80 mb-3">
                Per Student Analytics
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-purple-500/20">
                      <th className="p-3 border border-purple-500/20 text-left">Name</th>
                      <th className="p-3 border border-purple-500/20 text-left">Attendance</th>
                      <th className="p-3 border border-purple-500/20 text-left">Avg Marks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.perStudent.map((s, i) => (
                      <tr key={i} className="hover:bg-purple-500/10 transition">
                        <td className="p-3 border border-purple-500/20">{s.name || "N/A"}</td>
                        <td className="p-3 border border-purple-500/20">
                          {s.attendancePercent}%
                        </td>
                        <td className="p-3 border border-purple-500/20">
                          {s.avgMarks ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
