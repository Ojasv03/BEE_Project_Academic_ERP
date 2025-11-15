"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api"; 

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (value.length > 1) return;

    const temp = [...otp];
    temp[index] = value;
    setOtp(temp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalOtp = otp.join("");

      const res = await api.post("/auth/verify-otp", {
        otp: finalOtp,
        email: localStorage.getItem("loginEmail"), 
      });

      const role = res.data.role;

      if (role === "admin") window.location.href = "/admin";
      else if (role === "teacher") window.location.href = "/teacher";
      else window.location.href = "/student";
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#020611] via-[#0a1124] to-[#091f44] overflow-hidden">

      <motion.div
        className="absolute w-[40rem] h-[40rem] rounded-full bg-gradient-to-r from-[#0a2e6f] to-[#1f5eff] opacity-20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />

      <motion.div
        className="absolute top-10 text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
        animate={{ opacity: [1, 0.8, 1], filter: ["blur(0px)", "blur(4px)", "blur(0px)"] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        ClassSync
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-lg"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Verify Your Email</h2>
          <p className="text-sm text-white/60 mt-2">
            Please enter the 4-digit OTP sent to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                autoFocus={index === 0}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-14 h-14 text-center text-2xl font-semibold rounded-xl 
                           bg-black/30 border border-white/10 text-white 
                           focus:ring-2 focus:ring-blue-500/40 outline-none"
                whileFocus={{ scale: 1.1 }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#1f5eff] to-[#0a2e6f]
                       text-white shadow-lg hover:scale-[1.01] active:scale-[0.99] 
                       transition-transform"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-white/70 hover:text-white text-sm hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
