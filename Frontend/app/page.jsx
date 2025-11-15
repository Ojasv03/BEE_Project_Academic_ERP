"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleMode = (next) => setMode(next);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const payload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      let res;

      if (mode === "signin") {
        res = await api.post("/auth/login", {
          email: payload.email,
          password: payload.password,
        });
      } else {
        res = await api.post("/auth/signup", payload);
      }

      localStorage.setItem("loginEmail", payload.email);

      router.push("/otp");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
  };

  const formVariants = {
    initial: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.3 } }),
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#020611] via-[#0a1124] to-[#091f44] overflow-hidden">

      {/* BG animation */}
      <motion.div
        className="absolute w-[40rem] h-[40rem] rounded-full bg-gradient-to-r from-[#0a2e6f] to-[#1f5eff] opacity-20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* LOGO */}
      <motion.div
        className="absolute top-10 text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
        animate={{ filter: ["blur(0px)", "blur(4px)", "blur(0px)"], opacity: [1, 0.8, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        ClassSync
      </motion.div>

      {/* Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
        className="relative z-10 w-full max-w-md bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-lg"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {mode === "signin" ? "Welcome Back!" : "Join ClassSync"}
          </h2>
          <p className="text-sm text-white/60 mt-2">
            {mode === "signin" ? "Access your portal below" : "Create a new account"}
          </p>
        </div>

        {/* TOGGLE BUTTONS */}
        <div className="flex justify-center mb-6 space-x-3">
          <button
            onClick={() => toggleMode("signin")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "signin"
                ? "bg-gradient-to-r from-[#1f5eff] to-[#0a2e6f] text-white shadow-lg"
                : "bg-transparent border border-white/10 text-white/70 hover:text-white"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => toggleMode("signup")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-gradient-to-r from-[#1f5eff] to-[#0a2e6f] text-white shadow-lg"
                : "bg-transparent border border-white/10 text-white/70 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* FORM */}
        <AnimatePresence mode="wait" custom={mode === "signin" ? 1 : -1}>
          {mode === "signin" ? (
            <motion.form
              key="signin"
              onSubmit={handleSubmit}
              className="space-y-4"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={formVariants}
              custom={1}
            >
              <div>
                <label className="block text-sm text-white/80 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@classsync.com"
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-[#1f5eff] to-[#0a2e6f] text-white hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-md"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              onSubmit={handleSubmit}
              className="space-y-4"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={formVariants}
              custom={-1}
            >
              <div>
                <label className="block text-sm text-white/80 mb-2">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@classsync.com"
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/40 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-[#1f5eff] to-[#0a2e6f] text-white hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-md"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            {mode === "signin" ? "Don't have an account?" : "Already a user?"}{" "}
            <button
              onClick={() => toggleMode(mode === "signin" ? "signup" : "signin")}
              className="text-blue-400 hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
