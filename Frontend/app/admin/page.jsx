"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const ADMIN_API = `${API}/admin`;

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [noticePopup, setNoticePopup] = useState(null);
  const [totals, setTotals] = useState({
    students: 0,
    teachers: 0,
    feesCollected: 0,
  });

  // socket connection
  useEffect(() => {
    const socket = io(API, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      socket.emit("registerRole", { role: "admin" });
    });

    socket.on("new-notice", (payload) => {
      setNoticePopup(`${payload.message}: ${payload.title || ""}`);
      setTimeout(() => setNoticePopup(null), 3500);
    });

    return () => socket.disconnect();
  }, [API]);

  // load data
  useEffect(() => {
    loadStudents();
    loadTotals();
  }, []);

  async function loadStudents() {
    try {
      const res = await fetch(`${ADMIN_API}/students`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  }

  async function loadTotals() {
    try {
      const res = await fetch(`${ADMIN_API}/students`, { credentials: "include" });
      const studs = res.ok ? await res.json() : [];
      const studentsCount = Array.isArray(studs) ? studs.length : 0;

      const teachersCount = 0;
      const feesCollected = 0;

      setTotals({ students: studentsCount, teachers: teachersCount, feesCollected });
    } catch (err) {
      console.error(err);
    }
  }

  const toggle = (id) => {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  async function assignBatch(e) {
    e.preventDefault();
    const batch = e.target.batch.value.trim();
    if (!batch) return alert("Enter batch");
    if (selected.length === 0) return alert("Select students first");

    try {
      await Promise.all(
        selected.map((id) =>
          fetch(`${ADMIN_API}/students/${id}/batch`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batch }),
          })
        )
      );
      alert("Batch assigned");
      setSelected([]);
      e.target.reset();
      loadStudents();
      loadTotals();
    } catch (err) {
      console.error(err);
      alert("Failed to assign batch");
    }
  }

  async function postNotice(e) {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const content = e.target.content.value.trim();
    if (!title || !content) return alert("Fill title and content");

    try {
      const res = await fetch(`${ADMIN_API}/notice`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Notice failed");
      alert(json.message || "Notice posted");
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to post notice");
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0f14] text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6">
        <h2 className="text-2xl font-bold mb-8 text-orange-400">Admin Panel</h2>

        <nav className="space-y-3">
          <a className="block px-4 py-2 rounded-lg bg-white/5">Overview</a>
          <a className="block px-4 py-2 rounded-lg bg-white/5">Students</a>
          <a className="block px-4 py-2 rounded-lg bg-white/5">Notices</a>
          <a href="/analytics" className="block px-4 py-2 rounded-lg bg-white/5">Analytics</a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-400">Admin Dashboard</h1>
          <p className="text-white/70 mt-1">Manage students, batches & notices</p>
        </header>

        {noticePopup && (
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 right-6 bg-orange-600 text-white px-5 py-3 rounded-lg shadow-lg z-50"
          >
            {noticePopup}
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <h3 className="text-sm text-white/70">Total Students</h3>
            <p className="text-2xl font-bold text-orange-300 mt-2">{totals.students}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <h3 className="text-sm text-white/70">Total Teachers</h3>
            <p className="text-2xl font-bold text-orange-300 mt-2">{totals.teachers}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
            <h3 className="text-sm text-white/70">Fees Collected</h3>
            <p className="text-2xl font-bold text-orange-300 mt-2">₹{totals.feesCollected}</p>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-orange-300 mb-4">Students</h2>

          <div className="space-y-3 max-h-96 overflow-auto mb-6">
            {students.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-3 bg-[#07110f] rounded-md"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-white/60">{s.email}</p>
                </div>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selected.includes(s._id)}
                    onChange={() => toggle(s._id)}
                  />
                  <div className="w-10 h-5 bg-white/20 rounded-full relative transition peer-checked:bg-orange-600">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <form onSubmit={assignBatch} className="flex gap-3">
            <input
              name="batch"
              placeholder="Enter batch (e.g. A1)"
              className="flex-1 p-3 rounded-lg bg-[#07110f] border border-white/10 outline-none"
            />
            <button className="px-5 py-2 bg-orange-600 rounded-lg font-semibold">
              Assign
            </button>
          </form>
        </div>

        {/* Post Notice */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl mt-8">
          <h2 className="text-xl font-semibold text-orange-300 mb-4">Post Notice</h2>

          <form onSubmit={postNotice} className="space-y-3">
            <input name="title" placeholder="Title" className="w-full p-3 rounded-lg bg-[#07110f] border border-white/10" />
            <textarea name="content" placeholder="Content" className="w-full p-3 rounded-lg bg-[#07110f] border border-white/10 h-28" />
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-orange-600 rounded-lg text-white font-semibold">
                Post
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
