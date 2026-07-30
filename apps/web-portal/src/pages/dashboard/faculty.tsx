import React, { useState, useEffect } from "react";
import Head from "next/head";

// ==========================================
// EMBEDDED DYNAMIC FACULTY PROFILE COMPONENT
// ==========================================
function FacultyProfile({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "Prof. R. Sharma",
    email: "sharma@evidyalaya.com",
    phone: "+91 98765 12345",
    employeeId: "FAC-2026-8821",
    department: "Department of Mathematics & Physics",
    designation: "Senior Professor",
    qualification: "Ph.D. in Theoretical Physics",
    address: "Faculty Block B, Quarter 4",
    bio: "Specializing in Advanced Calculus, Analytical Geometry, and Quantum Mechanics.",
    avatarUrl: "",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const existingUser = localStorage.getItem("user");
      const currentUser = existingUser ? JSON.parse(existingUser) : {};
      const updatedUser = { ...currentUser, ...formData, role: "faculty" };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      await fetch("http://localhost:5000/faculty/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
      }, 400);
    } catch (err) {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-bold text-[#0F1E3D]">
        Loading Faculty Profile Details...
      </div>
    );
  }

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FC";

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#0F1E3D] hover:text-[#B8842E] transition flex items-center gap-2 cursor-pointer"
        >
          ← Back to Main Dashboard
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Faculty Credentials Settings
        </span>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex justify-between items-center">
          <span>✅ Faculty profile credentials updated successfully!</span>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="font-serif font-bold text-lg text-[#0F1E3D] border-b pb-3">
            👤 Faculty Credentials & Academic Identity
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#B8842E]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-[#B8842E] bg-[#0F1E3D] text-[#E7DCC4] font-black flex items-center justify-center text-2xl">
                {initials}
              </div>
            )}
            <div>
              <h3 className="font-bold text-base text-[#0F1E3D]">
                {formData.name || "Faculty Member"}
              </h3>
              <p className="text-xs text-slate-500">
                Employee ID:{" "}
                <strong className="text-[#B8842E]">
                  {formData.employeeId || "Pending"}
                </strong>
              </p>
              <p className="text-xs text-slate-400">
                {formData.designation} · {formData.department}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full border p-2.5 rounded-xl font-mono font-bold outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qualification
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Avatar
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageUpload}
                className="w-full border p-2 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chamber Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Biography & Research Focus
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-3 rounded-xl cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0F1E3D] hover:bg-[#16294C] text-white font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer transition"
          >
            {saving ? "Saving..." : "Save Faculty Credentials 💾"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// MAIN FACULTY DASHBOARD PAGE
// ==========================================
export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState<
    | "classes"
    | "timetable"
    | "assignments"
    | "notices"
    | "materials"
    | "roster"
    | "support"
    | "profile"
  >("classes");
  const [user, setUser] = useState<any>(null);

  const [tenant, setTenant] = useState<any>({
    school_name: "e-Vidyalaya High School",
    primary_color: "#0F1E3D",
    secondary_color: "#B8842E",
    logo_url: "",
    logo_text: "eV",
  });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ gradeLevel: "Grade 10" });
  const [statusMsg, setStatusMsg] = useState("");

  const gradesList = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}
    fetchAllData();

    const interval = setInterval(() => fetchAllData(true), 1000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("evidyalaya_realtime_updates");
      bc.onmessage = (event) => {
        if (event.data?.type === "REFRESH_PORTAL_DATA") {
          fetchAllData(true);
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [activeTab]);

  const fetchAllData = async (isBackground = false) => {
    const t = Date.now();
    try {
      const [bRes, sRes, ttRes, aRes, nRes, mRes, rRes, tRes] =
        await Promise.all([
          fetch(`http://localhost:5000/admin/branding?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/schedules?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/timetable?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/assignments?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/announcements?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/materials/all?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/roster?t=${t}`, {
            cache: "no-store",
          }),
          fetch(`http://localhost:5000/faculty/support?t=${t}`, {
            cache: "no-store",
          }),
        ]);

      if (bRes.ok) setTenant(await bRes.json());
      if (sRes.ok) setSchedules(await sRes.json());
      if (ttRes.ok) setTimetable(await ttRes.json());
      if (aRes.ok) setAssignments(await aRes.json());
      if (nRes.ok) setNotices(await nRes.json());
      if (mRes.ok) setMaterials(await mRes.json());
      if (rRes.ok) setRoster(await rRes.json());
      if (tRes.ok) setTickets(await tRes.json());
    } catch (e) {}
  };

  const triggerLiveSync = () => {
    try {
      const bc = new BroadcastChannel("evidyalaya_realtime_updates");
      bc.postMessage({ type: "REFRESH_PORTAL_DATA", timestamp: Date.now() });
      bc.close();
    } catch (e) {}
    window.dispatchEvent(new Event("storage"));
    localStorage.setItem("last_sync_timestamp", Date.now().toString());
  };

  const handleSave = async (e: React.FormEvent, endpoint: string) => {
    e.preventDefault();
    const isEdit = editingId !== null;
    const url = isEdit
      ? `http://localhost:5000/faculty/${endpoint}/${editingId}`
      : `http://localhost:5000/faculty/${endpoint}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatusMsg("🚀 Saved & Broadcasted to Students!");
        setEditingId(null);
        setForm({ gradeLevel: "Grade 10" });
        await fetchAllData();
        triggerLiveSync();
      }
    } catch (e) {
      setStatusMsg("⚠️ Saved locally");
    }
  };

  const handleDelete = async (id: number, endpoint: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`http://localhost:5000/faculty/${endpoint}/${id}`, {
        method: "DELETE",
      });
      setStatusMsg("🗑️ Removed instantly!");
      await fetchAllData();
      triggerLiveSync();
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
        <title>{`${tenant.school_name || "Faculty Portal"}`}</title>
      </Head>

      {/* HEADER */}
      <header
        style={{ backgroundColor: tenant.primary_color || "#0F1E3D" }}
        className="text-white px-6 py-3.5 flex justify-between items-center shadow-lg transition-colors border-b border-amber-500/20"
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
              {tenant.logo_text || "FAC"}
            </div>
          )}
          <div>
            <h1 className="font-serif font-bold text-base text-white">
              {user?.name || "Prof. R. Sharma"}
            </h1>
            <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span>Faculty Instructor</span> •
              <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30">
                Verified ✅
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 p-1.5 px-3 rounded-2xl cursor-pointer border border-white/10 transition-all"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-400 text-[#0F1E3D] font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name[0].toUpperCase() : "P"}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">
                {user?.name || "Prof. R. Sharma"}
              </p>
              <span className="text-[10px] text-amber-300 font-mono">
                {user?.employeeId || "FAC-2026-8821"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{ backgroundColor: tenant.secondary_color || "#B8842E" }}
            className="text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md transition hover:brightness-110"
          >
            Logout 🚪
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-72 bg-white border-r p-5 space-y-2 hidden md:block">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Faculty Suite
          </div>
          {[
            {
              id: "classes",
              label: "🎥 Live Broadcasts",
              count: schedules.length,
            },
            {
              id: "timetable",
              label: "🗓️ Master Timetable",
              count: timetable.length,
            },
            {
              id: "materials",
              label: "📚 Course Materials",
              count: materials.length,
            },
            { id: "roster", label: "👥 Student Roster", count: roster.length },
            {
              id: "assignments",
              label: "📝 Assignments & Test Links",
              count: assignments.length,
            },
            { id: "notices", label: "🔔 Announcements", count: notices.length },
            { id: "support", label: "🎧 Tech Support", count: tickets.length },
            { id: "profile", label: "👤 My Faculty Profile", count: "" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setEditingId(null);
                setForm({ gradeLevel: "Grade 10" });
                setStatusMsg("");
              }}
              style={
                activeTab === tab.id
                  ? { backgroundColor: tenant.primary_color || "#0F1E3D" }
                  : {}
              }
              className={`w-full p-3 rounded-xl text-xs font-bold text-left cursor-pointer transition-all flex justify-between items-center ${
                activeTab === tab.id
                  ? "text-white shadow-md"
                  : "hover:bg-slate-100 text-slate-600"
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

        {/* MAIN WORKSPACE */}
        <main className="flex-1 p-6 md:p-8 space-y-6 text-xs overflow-y-auto">
          {activeTab === "profile" ? (
            <FacultyProfile onBack={() => setActiveTab("classes")} />
          ) : (
            <>
              {statusMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl shadow-xs">
                  {statusMsg}
                </div>
              )}

              {/* TAB 1: LIVE BROADCASTS */}
              {activeTab === "classes" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "schedules")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      🎥 Schedule Live Zoom Broadcast
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Class Topic Title"
                        required
                        value={form.title || ""}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <select
                        value={form.gradeLevel || "Grade 10"}
                        onChange={(e) =>
                          setForm({ ...form, gradeLevel: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        {gradesList.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Day (e.g. Monday)"
                        required
                        value={form.dayOfWeek || ""}
                        onChange={(e) =>
                          setForm({ ...form, dayOfWeek: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Start Time (08:30 AM)"
                        required
                        value={form.startTime || ""}
                        onChange={(e) =>
                          setForm({ ...form, startTime: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        placeholder="End Time (09:30 AM)"
                        required
                        value={form.endTime || ""}
                        onChange={(e) =>
                          setForm({ ...form, endTime: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                    </div>
                    <input
                      type="url"
                      placeholder="Zoom Meeting Host Link URL"
                      required
                      value={form.zoomUrl || ""}
                      onChange={(e) =>
                        setForm({ ...form, zoomUrl: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition shadow-md"
                    >
                      Schedule Live Session & Sync 🚀
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                    <h3 className="font-bold text-sm text-[#0F1E3D]">
                      Upcoming Teaching Schedule & Broadcast Launcher
                    </h3>
                    {schedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50 flex-wrap gap-2"
                      >
                        <div>
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {s.grade_level || s.gradeLevel || "Grade 10"}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                            {s.title}
                          </h4>
                          <p className="text-slate-500">
                            ⏰ {s.start_time || s.startTime} -{" "}
                            {s.end_time || s.endTime} ·{" "}
                            {s.day_of_week || s.dayOfWeek}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <a
                            href={s.zoom_url || s.zoomUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl cursor-pointer transition shadow-xs"
                          >
                            Launch Broadcast 🎥
                          </a>
                          <button
                            onClick={() => handleDelete(s.id, "schedules")}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl font-bold cursor-pointer transition"
                          >
                            Delete 🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: MASTER TIMETABLE */}
              {activeTab === "timetable" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "timetable")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      🗓️ Publish Weekly Master Timetable Slot
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Course Code (e.g. MATH-101)"
                        required
                        value={form.code || ""}
                        onChange={(e) =>
                          setForm({ ...form, code: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Subject Title"
                        required
                        value={form.title || ""}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <select
                        value={form.gradeLevel || "Grade 10"}
                        onChange={(e) =>
                          setForm({ ...form, gradeLevel: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        {gradesList.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Day (e.g. Monday)"
                        required
                        value={form.dayOfWeek || ""}
                        onChange={(e) =>
                          setForm({ ...form, dayOfWeek: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Start Time (08:30 AM)"
                        required
                        value={form.startTime || ""}
                        onChange={(e) =>
                          setForm({ ...form, startTime: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <input
                        type="text"
                        placeholder="End Time (09:30 AM)"
                        required
                        value={form.endTime || ""}
                        onChange={(e) =>
                          setForm({ ...form, endTime: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: tenant.primary_color || "#0F1E3D",
                      }}
                      className="text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:brightness-110 transition shadow-md"
                    >
                      Publish Timetable Slot 🗓️
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                    <h3 className="font-bold text-sm text-[#0F1E3D]">
                      Active School Timetable
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border border-slate-200">
                        <thead className="bg-slate-50 uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Grade</th>
                            <th className="p-3">Code</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Day</th>
                            <th className="p-3">Time</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {timetable.map((t) => (
                            <tr key={t.id}>
                              <td className="p-3 font-bold text-amber-800">
                                {t.grade_level || "Grade 10"}
                              </td>
                              <td className="p-3 font-mono font-bold">
                                {t.code}
                              </td>
                              <td className="p-3 font-bold">{t.title}</td>
                              <td className="p-3">{t.day_of_week}</td>
                              <td className="p-3 font-mono text-slate-500">
                                {t.start_time} - {t.end_time}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() =>
                                    handleDelete(t.id, "timetable")
                                  }
                                  className="text-red-600 font-bold hover:underline cursor-pointer"
                                >
                                  Delete 🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COURSE MATERIALS & TRAILERS */}
              {activeTab === "materials" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "materials")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      📚 Upload Syllabus, Materials & Promotional Trailers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Material / Video Title"
                        required
                        value={form.title || ""}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <select
                        value={form.docType || "Syllabus"}
                        onChange={(e) =>
                          setForm({ ...form, docType: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Syllabus">Syllabus PDF</option>
                        <option value="Formula Sheet">Formula Sheet</option>
                        <option value="Trailer Video">
                          Course Trailer Video
                        </option>
                      </select>
                      <select
                        value={form.gradeLevel || "Grade 10"}
                        onChange={(e) =>
                          setForm({ ...form, gradeLevel: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        {gradesList.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="url"
                      placeholder="Document / Video URL"
                      required
                      value={form.fileUrl || ""}
                      onChange={(e) =>
                        setForm({ ...form, fileUrl: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-[#0F1E3D] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#16294C] transition shadow-md"
                    >
                      Publish Material 📄
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                    <h3 className="font-bold text-sm text-[#0F1E3D]">
                      Published Materials Directory
                    </h3>
                    <div className="space-y-2">
                      {materials.map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 border rounded-2xl bg-slate-50 flex justify-between items-center"
                        >
                          <div>
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              {m.doc_type || m.docType}
                            </span>
                            <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                              {m.title}
                            </h4>
                          </div>
                          <a
                            href={m.file_url || m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-200 hover:bg-slate-300 font-bold px-3 py-1.5 rounded-lg text-slate-800"
                          >
                            Open Asset 🔗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STUDENT ROSTER & MAPPING */}
              {activeTab === "roster" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "roster")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      ➕ Map / Assign Enrolled Student
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Student Full Name"
                        required
                        value={form.name || ""}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Student Email Address"
                        required
                        value={form.email || ""}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <select
                        value={form.grade || "Grade 10"}
                        onChange={(e) =>
                          setForm({ ...form, grade: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        {gradesList.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Interest Group / Stream (e.g. Computer Science)"
                        value={form.interestGroup || ""}
                        onChange={(e) =>
                          setForm({ ...form, interestGroup: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                      <select
                        value={form.paymentStatus || "CONFIRMED"}
                        onChange={(e) =>
                          setForm({ ...form, paymentStatus: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="CONFIRMED">CONFIRMED (Paid)</option>
                        <option value="PENDING">PENDING (Unpaid)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#0F1E3D] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#16294C] transition shadow-md"
                    >
                      Map Student to Roster 👥
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-4 shadow-xs">
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      👥 Enrolled Student Roster & Analytics
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border border-slate-200">
                        <thead className="bg-slate-50 uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Grade</th>
                            <th className="p-3">Interest Group</th>
                            <th className="p-3">Payment Status</th>
                            <th className="p-3">Attendance Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {roster.map((r) => (
                            <tr key={r.id}>
                              <td className="p-3 font-bold text-[#0F1E3D]">
                                {r.name}
                              </td>
                              <td className="p-3 font-mono text-slate-500">
                                {r.email}
                              </td>
                              <td className="p-3 font-bold text-amber-800">
                                {r.grade}
                              </td>
                              <td className="p-3">{r.interestGroup}</td>
                              <td className="p-3">
                                <span
                                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                    r.paymentStatus === "CONFIRMED"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {r.paymentStatus}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-emerald-600">
                                {r.attendanceRate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ASSIGNMENTS & TEST LINKS */}
              {activeTab === "assignments" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "assignments")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-bold text-base text-[#0F1E3D]">
                      ➕ Publish Assignment or Test Link
                    </h3>

                    <input
                      type="text"
                      placeholder="Assignment Title (e.g. Mid-Term Calculus Quiz)"
                      required
                      value={form.title || ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />

                    <input
                      type="url"
                      placeholder="Test Link URL (e.g. https://forms.gle/sample)"
                      required
                      value={form.testLink || ""}
                      onChange={(e) =>
                        setForm({ ...form, testLink: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={form.gradeLevel || "Grade 10"}
                        onChange={(e) =>
                          setForm({ ...form, gradeLevel: e.target.value })
                        }
                        className="border p-3 rounded-xl font-bold cursor-pointer"
                      >
                        {gradesList.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        required
                        value={form.dueDate || ""}
                        onChange={(e) =>
                          setForm({ ...form, dueDate: e.target.value })
                        }
                        className="border p-3 rounded-xl outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#0F1E3D] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#16294C] transition shadow-md"
                    >
                      Publish Assignment & Test Link 🚀
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-3">
                    <h3 className="font-bold text-sm text-[#0F1E3D]">
                      Published Assignments
                    </h3>
                    {assignments.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50"
                      >
                        <div>
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.grade_level || item.gradeLevel || "Grade 10"}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                            {item.title}
                          </h4>
                          <p className="text-slate-500 font-mono">
                            Due: {item.due_date || item.dueDate}
                          </p>
                          {item.test_link || item.testLink ? (
                            <a
                              href={item.test_link || item.testLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 font-bold underline mt-1 inline-block"
                            >
                              🔗 Test Form URL:{" "}
                              {item.test_link || item.testLink}
                            </a>
                          ) : null}
                        </div>
                        <button
                          onClick={() => handleDelete(item.id, "assignments")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                        >
                          Delete 🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: ANNOUNCEMENTS */}
              {activeTab === "notices" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "announcements")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-bold text-base text-[#0F1E3D]">
                      📢 Broadcast Announcement
                    </h3>
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      required
                      value={form.title || ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />
                    <select
                      value={form.gradeLevel || "Grade 10"}
                      onChange={(e) =>
                        setForm({ ...form, gradeLevel: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl font-bold cursor-pointer"
                    >
                      {gradesList.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Message body..."
                      required
                      rows={3}
                      value={form.message || ""}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: tenant.secondary_color || "#B8842E",
                      }}
                      className="text-white px-6 py-3 rounded-xl font-bold cursor-pointer shadow-md"
                    >
                      Broadcast Instantly 📢
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-3">
                    {notices.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50"
                      >
                        <div>
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.grade_level || item.gradeLevel || "Grade 10"}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                            {item.title}
                          </h4>
                          <p className="text-slate-600">{item.message}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id, "announcements")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                        >
                          Delete 🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: TECH SUPPORT */}
              {activeTab === "support" && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSave(e, "support")}
                    className="bg-white p-6 rounded-3xl border space-y-4 shadow-sm"
                  >
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      🎧 Dedicated Live Technical Assistance Contact
                    </h3>
                    <input
                      type="text"
                      placeholder="Issue Subject (e.g. Zoom Audio / Stream Latency)"
                      required
                      value={form.subject || ""}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />
                    <textarea
                      placeholder="Describe technical issue..."
                      required
                      rows={3}
                      value={form.message || ""}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl outline-none"
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: tenant.primary_color || "#0F1E3D",
                      }}
                      className="text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition shadow-md"
                    >
                      Contact Technical Support 📩
                    </button>
                  </form>

                  <div className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                    <h3 className="font-bold text-sm text-[#0F1E3D]">
                      Support Ticket Status Trail
                    </h3>
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50"
                      >
                        <div>
                          <strong className="text-sm text-[#0F1E3D]">
                            {t.subject}
                          </strong>
                          <p className="text-slate-600">{t.message}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-[10px]">
                          {t.status || "Open"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
