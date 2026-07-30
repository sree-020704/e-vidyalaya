import React, { useState } from "react";
import Head from "next/head";

const API = "http://localhost:5000/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    otp: "",
    acceptedTerms: false,
  });

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [forgotOpen, setForgotOpen] = useState(false);

  const [forgot, setForgot] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [otpSent, setOtpSent] = useState(false);

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  async function sendOtp() {
    clearMessages();

    if (!signup.email) {
      setError("Enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signup.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setOtpSent(true);
        setMessage("OTP sent successfully.");
      }
    } catch {
      setError("Server unavailable.");
    }

    setLoading(false);
  }

  async function verifyOtpAndSignup(e: React.FormEvent) {
    e.preventDefault();

    clearMessages();

    setLoading(true);

    try {
      const verify = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signup.email,
          otp: signup.otp,
        }),
      });

      const verifyData = await verify.json();

      if (!verify.ok) {
        setError(verifyData.message);
        setLoading(false);
        return;
      }

      const register = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signup),
      });

      const registerData = await register.json();

      if (!register.ok) {
        setError(registerData.message);
      } else {
        localStorage.setItem("token", registerData.token);

        setMessage("Registration Successful");

        setMode("login");
      }
    } catch {
      setError("Server unavailable.");
    }

    setLoading(false);
  }

  async function loginUser(e: React.FormEvent) {
    e.preventDefault();

    clearMessages();

    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        localStorage.setItem("token", data.token);

        window.location.href = "/";
      }
    } catch {
      setError("Server unavailable.");
    }

    setLoading(false);
  }

  async function sendForgotOtp() {
    clearMessages();

    if (!forgot.email) {
      setError("Enter your email address.");
      return;
    }

    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgot.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setMessage("Reset OTP sent to your email.");
      }
    } catch {
      setError("Server unavailable.");
    }
  }

  async function resetPassword() {
    clearMessages();

    if (!forgot.email || !forgot.otp || !forgot.newPassword) {
      setError("Please fill in all fields for password reset.");
      return;
    }

    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forgot),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setMessage("Password updated successfully.");
        setForgotOpen(false);
      }
    } catch {
      setError("Server unavailable.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Head>
        <title>e-Vidyalaya Authentication</title>
      </Head>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-8">
        <h1 className="text-3xl font-serif font-bold text-center text-[#0F1E3D]">
          e-Vidyalaya
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Secure Academic Portal
        </p>

        <div className="flex mt-6 rounded-xl overflow-hidden border">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 font-bold ${
              mode === "login"
                ? "bg-[#0F1E3D] text-white"
                : "bg-white text-slate-700"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 font-bold ${
              mode === "signup"
                ? "bg-[#0F1E3D] text-white"
                : "bg-white text-slate-700"
            }`}
          >
            Signup
          </button>
        </div>

        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* ===========================
          SIGNUP FORM
        =========================== */}

        {mode === "signup" && (
          <form onSubmit={verifyOtpAndSignup} className="space-y-4 mt-6">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name
              </label>

              <input
                type="text"
                required
                placeholder="Rahul Sharma"
                value={signup.name}
                onChange={(e) =>
                  setSignup({
                    ...signup,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 outline-none focus:border-[#0F1E3D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address
              </label>

              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={signup.email}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      email: e.target.value,
                    })
                  }
                  className="flex-1 border rounded-xl p-3 outline-none focus:border-[#0F1E3D]"
                />

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="bg-[#0F1E3D] text-white px-4 rounded-xl font-bold hover:bg-[#16294C]"
                >
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enter OTP
                </label>

                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={signup.otp}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      otp: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 tracking-[6px] text-center font-bold outline-none focus:border-[#0F1E3D]"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Role
              </label>

              <select
                value={signup.role}
                onChange={(e) =>
                  setSignup({
                    ...signup,
                    role: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 outline-none focus:border-[#0F1E3D]"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={signup.password}
                  onChange={(e) =>
                    setSignup({
                      ...signup,
                      password: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 pr-14 outline-none focus:border-[#0F1E3D]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#0F1E3D] font-bold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Password must contain:
                <br />
                • Minimum 8 characters
                <br />
                • One uppercase letter
                <br />
                • One lowercase letter
                <br />
                • One number
                <br />• One special character
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={signup.acceptedTerms}
                onChange={(e) =>
                  setSignup({
                    ...signup,
                    acceptedTerms: e.target.checked,
                  })
                }
                className="mt-1"
              />

              <p className="text-sm text-slate-600">
                I agree to the
                <span className="text-[#0F1E3D] font-bold">
                  {" "}
                  Terms & Conditions
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !signup.acceptedTerms}
              className="w-full bg-[#0F1E3D] hover:bg-[#16294C] text-white rounded-xl py-3 font-bold transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Verify OTP & Register"}
            </button>
          </form>
        )}

        {/* ===========================
          LOGIN FORM
        =========================== */}

        {mode === "login" && (
          <form onSubmit={loginUser} className="space-y-4 mt-6">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address
              </label>

              <input
                type="email"
                required
                placeholder="student@gmail.com"
                value={login.email}
                onChange={(e) =>
                  setLogin({
                    ...login,
                    email: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 outline-none focus:border-[#0F1E3D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={login.password}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      password: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 pr-16 outline-none focus:border-[#0F1E3D]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#0F1E3D] font-bold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-[#0F1E3D] font-semibold hover:underline text-sm"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F1E3D] hover:bg-[#16294C] text-white rounded-xl py-3 font-bold transition disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>
        )}
      </div>

      {/* ===========================
        FORGOT PASSWORD MODAL
      =========================== */}

      {forgotOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-[#0F1E3D] mb-5">
              Reset Password
            </h2>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={forgot.email}
                onChange={(e) =>
                  setForgot({
                    ...forgot,
                    email: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 outline-none focus:border-[#0F1E3D]"
              />

              <button
                type="button"
                onClick={sendForgotOtp}
                className="w-full bg-[#B8842E] hover:bg-[#a57424] text-white rounded-xl py-3 font-bold transition"
              >
                Send Reset OTP
              </button>

              <input
                type="text"
                placeholder="OTP"
                maxLength={6}
                value={forgot.otp}
                onChange={(e) =>
                  setForgot({
                    ...forgot,
                    otp: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 text-center tracking-[5px] outline-none focus:border-[#0F1E3D]"
              />

              <input
                type="password"
                placeholder="New Password"
                value={forgot.newPassword}
                onChange={(e) =>
                  setForgot({
                    ...forgot,
                    newPassword: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 outline-none focus:border-[#0F1E3D]"
              />

              <button
                type="button"
                onClick={resetPassword}
                className="w-full bg-[#0F1E3D] hover:bg-[#16294C] text-white rounded-xl py-3 font-bold transition"
              >
                Reset Password
              </button>

              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="w-full border rounded-xl py-3 font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
