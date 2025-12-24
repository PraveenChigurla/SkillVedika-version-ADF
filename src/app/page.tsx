"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import axios from "../utils/axios";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useSearchParams();


  /* =====================================================
     SHOW LOGOUT SUCCESS TOAST
  ===================================================== */
  useEffect(() => {
    if (params.get("logout") === "1") {
      if (!sessionStorage.getItem("logout_toast_shown")) {
        toast.success("Logged out successfully!");
        sessionStorage.setItem("logout_toast_shown", "yes");
      }

      // Remove ?logout=1 from URL
      globalThis.window.history.replaceState({}, "", "/");
    }
  }, [params]);

  /* =====================================================
     HANDLE LOGIN
  ===================================================== */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // axios instance will ensure CSRF cookie (via interceptor)
      // Laravel will set HTTP-only cookie automatically
      const res = await axios.post("/admin/login", { email, password });

      const data = res.data;

      // Save avatar if returned (for display purposes only)
      if (data?.user?.avatar) {
        localStorage.setItem("admin_avatar", data.user.avatar);
        // notify header via event so avatar updates immediately
        globalThis.window.dispatchEvent(new CustomEvent("admin:profileUpdated", { detail: { avatar: data.user.avatar } }));
      }

      // Redirect to dashboard
      // Authentication is handled by HTTP-only cookie, no token storage needed
      globalThis.window.location.href = "/dashboard";
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong. Check backend connection.";
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster />

      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#0F1E33" }}
      >
        <div
          className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8"
          style={{ borderTop: "4px solid #1A3F66" }}
        >
          <h1 className="text-3xl font-extrabold text-center mb-2 text-[#1A3F66]">
            SkillVedika Admin
          </h1>
          <p className="text-center text-gray-500 mb-6">Sign in to continue</p>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block font-medium mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  className="w-full border rounded-lg pl-10 p-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-medium mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full border rounded-lg pl-10 pr-12 p-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end -mt-2 mb-2">
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* LOGIN BUTTON */}
            <button
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-[#1A3F66] text-white py-3 rounded-lg font-semibold hover:bg-[#244f88] transition shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiLogIn />
              )}
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0F1E33" }}>
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
