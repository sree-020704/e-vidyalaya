import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "users" | "branding" | "analytics" | "certs" | "activities" | "notif"
  >("users");

  // User Management State (FR-ADM-02)
  const [users, setUsers] = useState<any[]>([]);

  // White-Label Branding State (FR-ADM-03)
  const [tenantConfig, setTenantConfig] = useState({
    schoolName: "e-Vidyalaya High School",
    primaryColor: "#0F1E3D",
    secondaryColor: "#B8842E",
    customDomain: "campus.evidyalaya.edu",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=eVidyalaya",
  });

  // Audits & Analytics State (FR-ADM-04)
  const [analytics, setAnalytics] = useState<any>({
    metrics: {
      liveClassConcurrency: 1420,
      totalRevenue: "$128,450",
      activeUsers: 540,
      serverUptime: "99.98%",
    },
    auditLogs: [],
  });

  // Certifications, Activities & Notices State
  const [certifications, setCertifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [certCode, setCertCode] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certProvider, setCertProvider] = useState("");
  const [actTitle, setActTitle] = useState("");
  const [actCat, setActCat] = useState<"Sports" | "Events" | "Workshops">(
    "Events",
  );
  const [actDetails, setActDetails] = useState("");
  const [actVenue, setActVenue] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchTenantConfig();
    fetchAnalytics();
    fetchCertifications();
    fetchActivities();
  }, []);

  // --- FETCH API CALLS ---
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) {}
  };

  const fetchTenantConfig = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/tenant-config");
      if (res.ok) {
        const data = await res.json();
        setTenantConfig({
          schoolName: data.school_name || "",
          primaryColor: data.primary_color || "#0F1E3D",
          secondaryColor: data.secondary_color || "#B8842E",
          customDomain: data.custom_domain || "",
          logoUrl: data.logo_url || "",
        });
      }
    } catch (e) {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/analytics");
      if (res.ok) setAnalytics(await res.json());
    } catch (e) {}
  };

  const fetchCertifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/certifications");
      if (res.ok) setCertifications(await res.json());
    } catch (e) {}
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/activities");
      if (res.ok) setActivities(await res.json());
    } catch (e) {}
  };

  // --- EVENT HANDLERS ---
  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:5000/admin/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    alert(`User status updated to ${status}`);
    fetchUsers();
    fetchAnalytics();
  };

  const handleUpdateRole = async (id: number, role: string) => {
    await fetch(`http://localhost:5000/admin/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    alert(`User role updated to ${role}`);
    fetchUsers();
  };

  const handleResetPassword = async (id: number) => {
    await fetch(`http://localhost:5000/admin/users/${id}/reset-password`, {
      method: "POST",
    });
    alert("Triggered temporary password reset link.");
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/admin/tenant-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tenantConfig),
    });
    alert("White-label configuration saved!");
    fetchTenantConfig();
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: certCode,
        title: certTitle,
        provider: certProvider,
        gradeLevel: "Grade 10",
      }),
    });
    alert("Certification published!");
    setCertCode("");
    setCertTitle("");
    setCertProvider("");
    fetchCertifications();
  };

  const handleDeleteCert = async (id: number) => {
    if (confirm("Delete certification?")) {
      await fetch(`http://localhost:5000/admin/certifications/${id}`, {
        method: "DELETE",
      });
      fetchCertifications();
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/admin/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: actTitle,
        category: actCat,
        details: actDetails,
        venue: actVenue,
      }),
    });
    alert(`${actCat} activity published!`);
    setActTitle("");
    setActDetails("");
    setActVenue("");
    fetchActivities();
  };

  const handleDeleteActivity = async (id: number) => {
    if (confirm("Delete activity?")) {
      await fetch(`http://localhost:5000/admin/activities/${id}`, {
        method: "DELETE",
      });
      fetchActivities();
    }
  };

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:5000/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderRole: "Admin",
        senderName: "Campus Administration",
        title: notifTitle,
        message: notifMsg,
        gradeLevel: "Grade 10",
      }),
    });
    alert("Notice broadcasted!");
    setNotifTitle("");
    setNotifMsg("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col antialiased">
      <Head>
        <title>Administrator Portal — e-Vidyalaya</title>
      </Head>

      {/* HEADER */}
      <header className="bg-[#0F1E3D] text-white px-6 py-3.5 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <img
            src={tenantConfig.logoUrl}
            alt="Logo"
            className="w-8 h-8 rounded-lg bg-white p-0.5 object-cover"
          />
          <div>
            <h1 className="font-serif font-bold text-base text-white">
              {tenantConfig.schoolName}
            </h1>
            <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
              Administrator Control Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs font-bold bg-[#B8842E] hover:bg-[#a07226] text-white px-4 py-2 rounded-xl cursor-pointer"
        >
          Logout
        </button>
      </header>

      {/* MAIN CONTAINER WITH LEFT SIDEBAR */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-72 bg-white border-r border-slate-200/80 p-5 hidden md:flex flex-col justify-between sticky top-[61px] h-[calc(100vh-61px)] shadow-xs">
          <div className="space-y-2">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin Controls
            </div>
            {[
              { id: "users", label: "User & Roles (FR-ADM-02)", icon: "👥" },
              {
                id: "branding",
                label: "White-Labeling (FR-ADM-03)",
                icon: "🎨",
              },
              {
                id: "analytics",
                label: "Audits & Analytics (FR-ADM-04)",
                icon: "📊",
              },
              { id: "certs", label: "Certification Courses", icon: "🎓" },
              {
                id: "activities",
                label: "Sports, Events & Workshops",
                icon: "🏆",
              },
              { id: "notif", label: "Broadcast Announcements", icon: "🔔" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#0F1E3D] text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0F1E3D]"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Access Level
            </span>
            <p className="text-xs font-bold text-[#0F1E3D]">
              Super Administrator
            </p>
            <p className="text-[11px] text-slate-500">FR-ADM-01 Unrestricted</p>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* TAB 1: FR-ADM-02 USER & ROLE MANAGEMENT */}
          {activeTab === "users" && (
            <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                User & Role Management (FR-ADM-02)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold">
                          {u.name}
                          <br />
                          <span className="text-[10px] text-slate-400 font-normal">
                            {u.email}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleUpdateRole(u.id, e.target.value)
                            }
                            className="border rounded-lg p-1 font-bold bg-white cursor-pointer"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : u.status === "Pending_Approval"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          {u.status === "Pending_Approval" && (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "Active")}
                              className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              Approve Faculty
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                u.id,
                                u.status === "Active" ? "Suspended" : "Active",
                              )
                            }
                            className="bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            {u.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="bg-amber-500 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            Reset Password 🔑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FR-ADM-03 TENANT WHITE-LABELING */}
          {activeTab === "branding" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border shadow-xs max-w-2xl space-y-4 text-xs">
              <h2 className="font-serif font-bold text-xl text-[#0F1E3D]">
                Tenant & White-Label Management (FR-ADM-03)
              </h2>
              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div>
                  <label className="block font-bold mb-1">School Name</label>
                  <input
                    type="text"
                    value={tenantConfig.schoolName}
                    onChange={(e) =>
                      setTenantConfig({
                        ...tenantConfig,
                        schoolName: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    Custom Domain Binding
                  </label>
                  <input
                    type="text"
                    value={tenantConfig.customDomain}
                    onChange={(e) =>
                      setTenantConfig({
                        ...tenantConfig,
                        customDomain: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={tenantConfig.primaryColor}
                      onChange={(e) =>
                        setTenantConfig({
                          ...tenantConfig,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded-xl border-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={tenantConfig.secondaryColor}
                      onChange={(e) =>
                        setTenantConfig({
                          ...tenantConfig,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded-xl border-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Logo URL Path</label>
                  <input
                    type="text"
                    value={tenantConfig.logoUrl}
                    onChange={(e) =>
                      setTenantConfig({
                        ...tenantConfig,
                        logoUrl: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl font-mono text-[10px]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0F1E3D] text-white font-bold py-3.5 rounded-2xl cursor-pointer"
                >
                  Save Branding Configuration 🎨
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FR-ADM-04 AUDITS & ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-2xl font-black text-[#0F1E3D]">
                    {analytics.metrics?.liveClassConcurrency}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Live Concurrency 📡
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-2xl font-black text-emerald-600">
                    {analytics.metrics?.totalRevenue}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Total Revenue 💰
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-2xl font-black text-purple-600">
                    {analytics.metrics?.activeUsers}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Active Users 👥</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                  <span className="text-2xl font-black text-blue-600">
                    {analytics.metrics?.serverUptime}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Server SLA ⚡</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-3">
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  Audit Logs & Security Events (FR-ADM-04)
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
                  {analytics.auditLogs?.map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 border rounded-xl bg-slate-50 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                          {log.event_type}
                        </span>
                        <p className="font-bold text-[#0F1E3D] mt-1">
                          {log.details}
                        </p>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {log.performed_by}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFICATION COURSES */}
          {activeTab === "certs" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <form
                onSubmit={handleAddCert}
                className="bg-white p-5 rounded-2xl border space-y-3 text-xs shadow-xs"
              >
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  Add Certification Course
                </h3>
                <input
                  type="text"
                  placeholder="Code (e.g. AWS-CLOUD-01)"
                  value={certCode}
                  onChange={(e) => setCertCode(e.target.value)}
                  required
                  className="w-full border p-2 rounded-lg font-mono"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  required
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Provider"
                  value={certProvider}
                  onChange={(e) => setCertProvider(e.target.value)}
                  required
                  className="w-full border p-2 rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0F1E3D] text-white font-bold py-2 rounded-lg cursor-pointer"
                >
                  Publish 📜
                </button>
              </form>

              <div className="md:col-span-2 bg-white p-5 rounded-2xl border space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  Active Certifications
                </h3>
                <div className="space-y-2">
                  {certifications.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 border rounded-xl bg-amber-50/50 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold bg-[#B8842E] text-white px-2 py-0.5 rounded text-[10px]">
                          {c.code}
                        </span>
                        <h4 className="font-bold text-[#0F1E3D] mt-1">
                          {c.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteCert(c.id)}
                        className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CAMPUS ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <form
                onSubmit={handleAddActivity}
                className="bg-white p-5 rounded-2xl border space-y-3 text-xs shadow-xs"
              >
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  Add Activity
                </h3>
                <select
                  value={actCat}
                  onChange={(e) => setActCat(e.target.value as any)}
                  className="w-full border p-2 rounded-lg font-bold bg-white"
                >
                  <option value="Events">🎉 Event</option>
                  <option value="Sports">⚽ Sports</option>
                  <option value="Workshops">🔧 Workshop</option>
                </select>
                <input
                  type="text"
                  placeholder="Title"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  required
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Details"
                  value={actDetails}
                  onChange={(e) => setActDetails(e.target.value)}
                  required
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={actVenue}
                  onChange={(e) => setActVenue(e.target.value)}
                  required
                  className="w-full border p-2 rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0F1E3D] text-white font-bold py-2 rounded-lg cursor-pointer"
                >
                  Publish 🏆
                </button>
              </form>

              <div className="md:col-span-2 bg-white p-5 rounded-2xl border space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#0F1E3D]">
                  Campus Directory
                </h3>
                <div className="space-y-2">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 border rounded-xl bg-slate-50 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] uppercase">
                          {a.category}
                        </span>
                        <h4 className="font-bold text-[#0F1E3D] mt-1">
                          {a.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteActivity(a.id)}
                        className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
          {activeTab === "notif" && (
            <form
              onSubmit={handleSendNotif}
              className="bg-white p-6 rounded-3xl border shadow-xs max-w-xl space-y-4 text-xs"
            >
              <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                Broadcast System Notice
              </h3>
              <input
                type="text"
                placeholder="Title"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                required
                className="w-full border p-3 rounded-xl"
              />
              <textarea
                placeholder="Message..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                required
                className="w-full border p-3 rounded-xl h-28"
              />
              <button
                type="submit"
                className="w-full bg-[#0F1E3D] text-white font-bold py-3.5 rounded-2xl cursor-pointer"
              >
                Send Announcement 🔔
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
