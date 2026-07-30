import React, { useState, useEffect } from "react";
import Head from "next/head";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "analytics" | "users" | "tenant" | "courses" | "events"
  >("analytics");

  const [tenant, setTenant] = useState<any>({
    school_name: "e-Vidyalaya High School",
    primary_color: "#0F1E3D",
    secondary_color: "#B8842E",
    custom_domain: "campus.evidyalaya.edu",
    logo_url: "",
    logo_text: "eV",
  });
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    liveConcurrency: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemUptime: "100%",
    logs: [],
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "faculty",
  });
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    price: 1499,
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    category: "Sports",
    description: "",
    target: "ALL",
  });
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchAllAdminData();
    const interval = setInterval(() => fetchAllAdminData(true), 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllAdminData = async (isBackground = false) => {
    const t = Date.now();
    try {
      const [bRes, uRes, cRes, eRes, aRes] = await Promise.all([
        fetch(`http://localhost:5000/admin/branding?t=${t}`),
        fetch(`http://localhost:5000/admin/users?t=${t}`),
        fetch(`http://localhost:5000/faculty/catalog?t=${t}`),
        fetch(`http://localhost:5000/admin/events?t=${t}`),
        fetch(`http://localhost:5000/admin/analytics?t=${t}`),
      ]);

      if (bRes.ok) setTenant(await bRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (eRes.ok) setEvents(await eRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
    } catch (e) {}
  };

  const triggerGlobalBroadcast = () => {
    try {
      const bc = new BroadcastChannel("evidyalaya_realtime_updates");
      bc.postMessage({ type: "REFRESH_PORTAL_DATA", timestamp: Date.now() });
      bc.close();
    } catch (e) {}
    window.dispatchEvent(new Event("storage"));
    localStorage.setItem("last_sync_timestamp", Date.now().toString());
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/admin/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenant),
      });
      if (res.ok) {
        setStatusMsg("🎨 Tenant Branding Updated Globally!");
        triggerGlobalBroadcast();
        fetchAllAdminData();
      }
    } catch (e) {
      setStatusMsg("⚠️ Updated locally");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (res.ok) {
        setStatusMsg(`👤 Account provisioned: ${userForm.email}`);
        setUserForm({ name: "", email: "", role: "faculty" });
        await fetchAllAdminData();
        triggerGlobalBroadcast();
      }
    } catch (e) {}
  };

  const handleApproveFaculty = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/admin/users/${id}/approve`, {
        method: "PUT",
      });
      setStatusMsg("✅ Faculty membership approved!");
      await fetchAllAdminData();
      triggerGlobalBroadcast();
    } catch (e) {}
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await fetch(`http://localhost:5000/admin/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setStatusMsg(`🛡️ User account set to ${nextStatus}!`);
      await fetchAllAdminData();
      triggerGlobalBroadcast();
    } catch (e) {}
  };

  const handleResetPassword = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/users/${id}/reset-password`,
        { method: "POST" },
      );
      const data = await res.json();
      alert(`Password Reset Triggered!\nTemp Password: ${data.tempPassword}`);
      fetchAllAdminData();
    } catch (e) {}
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/faculty/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        setStatusMsg("📚 Global Course Module Uploaded!");
        setCourseForm({ code: "", title: "", price: 1499 });
        await fetchAllAdminData();
        triggerGlobalBroadcast();
      }
    } catch (e) {}
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/faculty/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `🏆 [${eventForm.category}] ${eventForm.title}`,
          message: `${eventForm.description} (Event Date: ${eventForm.date})`,
          gradeLevel: "ALL",
        }),
      });

      const res = await fetch("http://localhost:5000/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (res.ok) {
        setStatusMsg("🏆 Event published across all user feeds!");
        setEventForm({
          title: "",
          date: "",
          category: "Sports",
          description: "",
          target: "ALL",
        });
        await fetchAllAdminData();
        triggerGlobalBroadcast();
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col antialiased">
      <Head>
        <title>{`Admin Gateway — ${tenant.school_name}`}</title>
      </Head>

      <header
        style={{ backgroundColor: tenant.primary_color || "#0F1E3D" }}
        className="text-white px-6 py-3.5 flex justify-between items-center shadow-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt="Logo"
              className="w-9 h-9 rounded-xl object-cover border-2 border-amber-400"
            />
          ) : (
            <div
              style={{ borderColor: tenant.secondary_color || "#B8842E" }}
              className="w-9 h-9 rounded-xl border-2 bg-white/10 flex items-center justify-center font-bold text-amber-300 text-sm"
            >
              {tenant.logo_text || "eV"}
            </div>
          )}
          <div>
            <h1 className="font-serif font-bold text-base text-white">
              {tenant.school_name || "e-Vidyalaya High School"}
            </h1>
            <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
              Super Administrator Console
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-[#B8842E] hover:bg-[#a07226] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md transition"
        >
          Logout 🚪
        </button>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <aside className="w-72 bg-white border-r p-5 space-y-2 hidden md:block">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Administrator Modules
          </div>
          {[
            {
              id: "analytics",
              label: "System Audits & Analytics 📊",
              count: "",
            },
            {
              id: "users",
              label: "User & Role Management 👥",
              count: users.length,
            },
            { id: "tenant", label: "Tenant & White-Label 🎨", count: "" },
            {
              id: "courses",
              label: "Global Course Control 📚",
              count: courses.length,
            },
            {
              id: "events",
              label: "Sports & Campus Events 🏆",
              count: events.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setStatusMsg("");
              }}
              className={`w-full p-3.5 rounded-xl text-xs font-bold text-left cursor-pointer transition-all flex justify-between items-center ${
                activeTab === tab.id
                  ? "bg-[#0F1E3D] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="truncate">{tab.label}</span>
              {tab.count !== "" && (
                <span className="bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 md:p-8 space-y-6 text-xs overflow-y-auto">
          {statusMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl shadow-xs">
              {statusMsg}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                📊 Real-Time System Concurrency, Revenue & Audit Logs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-3xl font-black text-emerald-600">
                    {analytics.liveConcurrency || 142}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-bold">
                    Live Stream Sessions
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-3xl font-black text-[#0F1E3D]">
                    ₹{(analytics.totalRevenue || 284500).toLocaleString()}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-bold">
                    Total Platform Revenue
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-3xl font-black text-amber-600">
                    {analytics.activeUsers || users.length}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-bold">
                    Active Accounts
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-3xl font-black text-purple-600">
                    {analytics.systemUptime || "99.98%"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-bold">
                    Service Uptime
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  🛡️ System Security Audit Log Trail
                </h3>
                <div className="space-y-2 font-mono">
                  {(analytics.logs || []).map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-[11px]"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {log.event}
                        </span>
                        <span className="text-slate-700">{log.details}</span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddUser}
                className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
              >
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  👥 Provision New User & Assign Roles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Full User Name"
                    required
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    className="border p-3 rounded-xl font-bold uppercase cursor-pointer"
                  >
                    <option value="faculty">Faculty Member</option>
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-[#B8842E] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#a07226] transition shadow-md"
                >
                  Provision User Account 🚀
                </button>
              </form>

              <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  System Directory Accounts & Approvals
                </h3>
                <div className="divide-y border rounded-2xl overflow-hidden">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 bg-slate-50 flex justify-between items-center flex-wrap gap-2"
                    >
                      <div>
                        <div className="flex gap-2 items-center">
                          <strong className="text-sm text-[#0F1E3D]">
                            {u.name}
                          </strong>
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            {u.role}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              u.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </div>
                        <p className="text-slate-500 font-mono mt-0.5">
                          {u.email}
                        </p>
                      </div>

                      <div className="flex gap-2 items-center">
                        {u.approval_status === "Pending Approval" && (
                          <button
                            onClick={() => handleApproveFaculty(u.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition"
                          >
                            Approve Faculty ✅
                          </button>
                        )}
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition"
                        >
                          Reset Pwd 🔑
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition text-white ${
                            u.status === "Active"
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {u.status === "Active"
                            ? "Suspend 🚫"
                            : "Reactivate ⚡"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tenant" && (
            <form
              onSubmit={handleSaveBranding}
              className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
            >
              <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                🎨 Tenant & White-Label Customization
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    School Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tenant.school_name}
                    onChange={(e) =>
                      setTenant({ ...tenant, school_name: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Custom Domain
                  </label>
                  <input
                    type="text"
                    required
                    value={tenant.custom_domain}
                    onChange={(e) =>
                      setTenant({ ...tenant, custom_domain: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Primary Branding Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={tenant.primary_color || "#0F1E3D"}
                      onChange={(e) =>
                        setTenant({ ...tenant, primary_color: e.target.value })
                      }
                      className="w-12 h-11 border p-1 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tenant.primary_color || "#0F1E3D"}
                      onChange={(e) =>
                        setTenant({ ...tenant, primary_color: e.target.value })
                      }
                      className="flex-1 border p-3 rounded-xl font-mono outline-none uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Secondary Accent Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={tenant.secondary_color || "#B8842E"}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          secondary_color: e.target.value,
                        })
                      }
                      className="w-12 h-11 border p-1 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tenant.secondary_color || "#B8842E"}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          secondary_color: e.target.value,
                        })
                      }
                      className="flex-1 border p-3 rounded-xl font-mono outline-none uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Custom Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={tenant.logo_url || ""}
                    onChange={(e) =>
                      setTenant({ ...tenant, logo_url: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Logo Initials
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={tenant.logo_text || "eV"}
                    onChange={(e) =>
                      setTenant({ ...tenant, logo_text: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl font-bold uppercase outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#0F1E3D] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#16294C] transition shadow-md"
              >
                Save & Broadcast Branding 🎨
              </button>
            </form>
          )}

          {activeTab === "courses" && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddCourse}
                className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
              >
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  📚 Upload Global Course Subject
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Code (e.g. MATH-401)"
                    required
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, code: e.target.value })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Course Title"
                    required
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, title: e.target.value })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    required
                    value={courseForm.price}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        price: Number(e.target.value),
                      })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0F1E3D] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#16294C] transition shadow-md"
                >
                  Publish Subject 📚
                </button>
              </form>

              <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  Active Global Catalog
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 border rounded-2xl bg-slate-50 space-y-1"
                    >
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {c.code}
                      </span>
                      <h4 className="font-bold text-[#0F1E3D] text-sm mt-1">
                        {c.title}
                      </h4>
                      <p className="text-slate-500 font-bold">
                        Fee: ₹{c.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddEvent}
                className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
              >
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  🏆 Post Sports, Cultural & Campus Events
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Event Title"
                    required
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    className="border p-3 rounded-xl outline-none"
                  />
                  <select
                    value={eventForm.category}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, category: e.target.value })
                    }
                    className="border p-3 rounded-xl font-bold cursor-pointer"
                  >
                    <option value="Sports">Sports Meet 🏆</option>
                    <option value="Culturals">Culturals & Music 🎭</option>
                    <option value="Academic">Academic Fair 🔬</option>
                  </select>
                </div>
                <textarea
                  placeholder="Event Details..."
                  required
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-emerald-800 transition shadow-md"
                >
                  Broadcast Event to Feeds 📢
                </button>
              </form>

              <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  Published Events
                </h3>
                <div className="space-y-3">
                  {events.map((e) => (
                    <div
                      key={e.id}
                      className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center"
                    >
                      <div>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {e.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                          {e.title}
                        </h4>
                        <p className="text-slate-600">{e.description}</p>
                      </div>
                      <span className="text-slate-500 font-mono font-bold">
                        {e.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
