import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTenantTheme } from "../hooks/useTenantTheme";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuthContext } from "../context/AuthContext";

export default function Home() {
  const { branding } = useTenantTheme();
  const { user, loginSession, logout } = useAuthContext();
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [sessionUser, setSessionUser] = useState<{
    name: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setSessionUser({ name: user.name, role: user.role.toLowerCase() });
    } else {
      setSessionUser(null);
    }
  }, [user]);

  const [viewState, setViewState] = useState<
    "login" | "signup" | "forgot" | "reset"
  >("login");

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    identity: "",
    password: "",
    otp: "",
    newPassword: "",
    role: "student" as "student" | "faculty" | "admin",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (authMethod === "phone") {
      const cleaned = rawVal.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, identity: cleaned });
    } else {
      setFormData({ ...formData, identity: rawVal.trim() });
    }
  };

  const validatePasswordRules = (pwd: string): boolean => {
    if (pwd.length < 8) {
      setStatusMessage("Password must be at least 8 characters long.");
      return false;
    }
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    if (!hasLetter || !hasDigit) {
      setStatusMessage(
        "Password must contain at least one character and one digit.",
      );
      return false;
    }
    if (!hasSpecialChar) {
      setStatusMessage(
        "Password must contain at least one special symbol (e.g. @, #, $, !).",
      );
      return false;
    }
    return true;
  };

  const validateCredentials = (): boolean => {
    if (authMethod === "phone") {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.identity)) {
        setStatusMessage(
          "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.",
        );
        return false;
      }
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.identity)) {
        setStatusMessage(
          "Please enter a valid email address (e.g. student@gmail.com).",
        );
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setSuccessMessage("");

    if (!validateCredentials()) return;

    if (viewState === "signup") {
      if (!validatePasswordRules(formData.password)) return;
    }

    try {
      const endpoint =
        viewState === "signup" ? "/auth/register" : "/auth/login";

      const defaultName =
        authMethod === "email"
          ? formData.identity.split("@")[0]
          : `Student_${formData.identity.slice(-4)}`;

      const payload =
        viewState === "signup"
          ? {
              name: formData.name || defaultName,
              identity: formData.identity,
              authMethod,
              password: formData.password,
              role: formData.role.toLowerCase(),
              tenantId: "default-campus",
            }
          : {
              identity: formData.identity,
              authMethod,
              password: formData.password,
              role: formData.role.toLowerCase(),
              tenantId: "default-campus",
            };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed.");

      if (viewState === "signup") {
        setSuccessMessage(
          "Account registered successfully! Switching to Login...",
        );
        setTimeout(() => {
          setViewState("login");
          setSuccessMessage("");
        }, 1500);
        return;
      }

      const rawUser = data.user || {};
      const normalizedUser = {
        id: rawUser.id || 1,
        name: rawUser.name || defaultName,
        email:
          rawUser.email || (authMethod === "email" ? formData.identity : ""),
        phone:
          rawUser.phone || (authMethod === "phone" ? formData.identity : ""),
        role: (rawUser.role || formData.role).toLowerCase(),
        gradeLevel: rawUser.grade_level || rawUser.gradeLevel || "Class 10",
      };

      const activeToken = data.token || "active-session-token";
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", activeToken);

      if (loginSession) loginSession(activeToken, normalizedUser);

      setSessionUser({
        name: normalizedUser.name,
        role: normalizedUser.role,
      });

      router.push(`/dashboard/${normalizedUser.role}`);
    } catch (err: any) {
      setStatusMessage(err.message || "Network connection failed.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setSuccessMessage("");

    if (!validateCredentials()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: formData.identity, authMethod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP request failed.");

      setSuccessMessage(
        `${data.message} ${
          data.otpDemo ? `(Testing OTP Code: ${data.otpDemo})` : ""
        }`,
      );
      setTimeout(() => {
        setViewState("reset");
      }, 2000);
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to process request.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setSuccessMessage("");

    if (!validatePasswordRules(formData.newPassword)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: formData.identity,
          authMethod,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed.");

      setSuccessMessage("Password reset successful! You can now log in.");
      setTimeout(() => {
        setViewState("login");
        setSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      setStatusMessage(err.message || "Password reset failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] font-sans text-[#22262E]">
      <Head>
        <title>{branding.name} — Workspace Gateway</title>
      </Head>

      <Header user={sessionUser} onLogout={logout} />

      <main className="flex-1 flex flex-col items-center justify-center">
        {!sessionUser ? (
          <div className="w-full max-w-[1440px] min-h-[700px] flex overflow-hidden bg-white md:rounded-lg shadow-xl my-8 border border-[#E2E6EC]">
            {/* Left Branding */}
            <div className="hidden md:flex flex-1 flex-col justify-between p-14 text-white bg-gradient-to-br from-[#0F1E3D]/95 to-[#16294C]/90 relative overflow-hidden">
              <div className="flex items-center gap-3 font-serif font-bold text-xl relative z-10">
                <div className="w-[38px] h-[38px] rounded-full border-2 border-[#B8842E] bg-[#0F1E3D] text-[#E7DCC4] flex items-center justify-center text-base font-bold">
                  eV
                </div>
                <span>e-Vidyalaya</span>
              </div>
              <div className="max-w-[420px] relative z-10">
                <h2 className="font-serif text-[26px] font-bold leading-tight mb-2.5">
                  One campus login for classrooms, faculty and families.
                </h2>
              </div>
            </div>

            {/* Right Form */}
            <div className="w-full md:w-[480px] bg-white flex flex-col justify-center px-8 py-12 md:px-16 overflow-y-auto">
              <h1 className="font-serif text-2xl font-bold text-[#0F1E3D] mb-2">
                {viewState === "signup" && "Create your account"}
                {viewState === "login" && "Welcome back"}
                {viewState === "forgot" && "Reset Password"}
                {viewState === "reset" && "Set New Password"}
              </h1>

              {/* Email / Phone Mode Switcher */}
              {viewState !== "reset" && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#324566] uppercase mb-1.5">
                    Sign in using
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod("email");
                        setFormData({ ...formData, identity: "" });
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        authMethod === "email"
                          ? "bg-white text-[#0F1E3D] shadow-sm"
                          : "text-slate-500 hover:text-[#0F1E3D]"
                      }`}
                    >
                      📧 Email Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod("phone");
                        setFormData({ ...formData, identity: "" });
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        authMethod === "phone"
                          ? "bg-white text-[#0F1E3D] shadow-sm"
                          : "text-slate-500 hover:text-[#0F1E3D]"
                      }`}
                    >
                      📱 Mobile Number
                    </button>
                  </div>
                </div>
              )}

              {/* Login / Signup */}
              {(viewState === "login" || viewState === "signup") && (
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#324566] uppercase mb-2">
                      I am a
                    </label>
                    <div className="flex gap-2">
                      {["student", "faculty", "admin"].map((roleOpt) => (
                        <button
                          key={roleOpt}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, role: roleOpt as any })
                          }
                          className={`flex-1 py-2.5 text-[12.5px] font-bold uppercase border rounded cursor-pointer ${
                            formData.role === roleOpt
                              ? "bg-[#0F1E3D] text-white"
                              : "bg-[#fbfbfc] text-[#324566]"
                          }`}
                        >
                          {roleOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {viewState === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#324566] uppercase mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-3 text-sm border border-[#E2E6EC] rounded bg-[#fbfbfc]"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#324566] uppercase mb-1.5">
                      {authMethod === "phone"
                        ? "10-Digit Mobile Number"
                        : "Email Address"}
                    </label>
                    <input
                      type={authMethod === "phone" ? "tel" : "email"}
                      required
                      value={formData.identity}
                      onChange={handleIdentityChange}
                      maxLength={authMethod === "phone" ? 10 : 80}
                      className="w-full p-3 text-sm border border-[#E2E6EC] rounded bg-[#fbfbfc]"
                      placeholder={
                        authMethod === "phone"
                          ? "e.g. 9876543210"
                          : "e.g. student@gmail.com"
                      }
                    />
                  </div>

                  {/* Password Field with Eye Toggle */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[#324566] uppercase">
                        Password
                      </label>
                      {viewState === "login" && (
                        <button
                          type="button"
                          onClick={() => setViewState("forgot")}
                          className="text-xs font-bold text-[#B8842E] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full p-3 pr-16 text-sm border border-[#E2E6EC] rounded bg-[#fbfbfc]"
                        placeholder="Min 8 chars, 1 letter, 1 digit, 1 symbol"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[11px] font-bold text-slate-500 hover:text-[#0F1E3D] cursor-pointer select-none px-2 py-1 bg-slate-100 rounded border border-slate-200"
                      >
                        {showPassword ? "🙈 Hide" : "👁️ Show"}
                      </button>
                    </div>
                    {viewState === "signup" && (
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Must contain at least 8 characters, a letter, a number &
                        a special symbol.
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#B8842E] hover:bg-[#b57a24] text-white p-3.5 rounded font-bold text-[14.5px] uppercase shadow-sm transition-all cursor-pointer"
                  >
                    {viewState === "signup"
                      ? "Register Account"
                      : "Log In to System"}
                  </button>
                </form>
              )}

              {/* Forgot Password */}
              {viewState === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#324566] uppercase mb-1.5">
                      {authMethod === "phone"
                        ? "Registered 10-Digit Mobile Number"
                        : "Registered Email Address"}
                    </label>
                    <input
                      type={authMethod === "phone" ? "tel" : "email"}
                      required
                      value={formData.identity}
                      onChange={handleIdentityChange}
                      maxLength={authMethod === "phone" ? 10 : 80}
                      className="w-full p-3 text-sm border border-[#E2E6EC] rounded bg-[#fbfbfc]"
                      placeholder={
                        authMethod === "phone"
                          ? "e.g. 9876543210"
                          : "e.g. student@gmail.com"
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#B8842E] hover:bg-[#b57a24] text-white p-3.5 rounded font-bold text-[14.5px] uppercase shadow-sm transition-all cursor-pointer"
                  >
                    Send OTP Reset Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState("login")}
                    className="w-full text-center text-xs font-bold text-[#0F1E3D] hover:underline cursor-pointer pt-2 block"
                  >
                    ← Back to Login
                  </button>
                </form>
              )}

              {/* Reset Password */}
              {viewState === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#324566] uppercase mb-1.5">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.otp}
                      onChange={(e) =>
                        setFormData({ ...formData, otp: e.target.value })
                      }
                      className="w-full p-3 text-sm border border-[#E2E6EC] rounded bg-[#fbfbfc] font-mono tracking-widest text-center text-lg font-bold"
                      placeholder="123456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#324566] uppercase mb-1.5">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full p-3 pr-16 text-sm border border-[#E2E6EC] rounded bg-[#fbfbfc]"
                        placeholder="Min 8 chars, 1 letter, 1 digit, 1 symbol"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[11px] font-bold text-slate-500 hover:text-[#0F1E3D] cursor-pointer select-none px-2 py-1 bg-slate-100 rounded border border-slate-200"
                      >
                        {showPassword ? "🙈 Hide" : "👁️ Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#B8842E] hover:bg-[#b57a24] text-white p-3.5 rounded font-bold text-[14.5px] uppercase shadow-sm transition-all cursor-pointer"
                  >
                    Confirm & Update Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState("login")}
                    className="w-full text-center text-xs font-bold text-[#0F1E3D] hover:underline cursor-pointer pt-2 block"
                  >
                    ← Back to Login
                  </button>
                </form>
              )}

              {/* Feedback Notifications */}
              {successMessage && (
                <div className="mt-4 p-3 rounded text-xs font-bold bg-[#E1EAE5] text-[#3E7059] border border-emerald-200">
                  ✅ {successMessage}
                </div>
              )}

              {statusMessage && (
                <div className="mt-4 p-3 rounded text-xs font-bold bg-[#F1DFDB] text-[#AE4A3B] border border-rose-200">
                  ⚠️ {statusMessage}
                </div>
              )}

              {/* Switch View State */}
              {(viewState === "login" || viewState === "signup") && (
                <div className="mt-6 text-xs text-[#7c7666]">
                  {viewState === "signup" ? (
                    <span>
                      Already have an account?{" "}
                      <strong
                        onClick={() => setViewState("login")}
                        className="text-[#B8842E] cursor-pointer"
                      >
                        Log in
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Need an account?{" "}
                      <strong
                        onClick={() => setViewState("signup")}
                        className="text-[#B8842E] cursor-pointer"
                      >
                        Sign up
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl px-6 py-8 space-y-6">
            <div className="bg-[#E7DCC4] text-[#5c461e] p-6 px-8 rounded-lg border border-amber-200 flex justify-between items-center shadow-sm">
              <div>
                <h1 className="font-serif text-2xl font-bold">
                  Welcome back, {sessionUser.name}!
                </h1>
                <p className="text-xs mt-1 opacity-90">
                  Connected to e-Vidyalaya PostgreSQL Database.
                </p>
              </div>
              <button
                onClick={() => router.push(`/dashboard/${sessionUser.role}`)}
                className="bg-[#0F1E3D] text-white px-5 py-2 rounded-md text-xs font-bold hover:bg-[#16294C] transition-all cursor-pointer"
              >
                Open Dedicated Portal →
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
