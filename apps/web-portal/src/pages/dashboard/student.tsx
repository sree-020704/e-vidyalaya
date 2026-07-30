import React, { useState, useEffect } from "react";
import Head from "next/head";

function StudentProfile({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "Rahul Sharma",
    email: "rahul@student.com",
    phone: "+91 98765 43210",
    admissionNo: "EV-2026-1042",
    dob: "2010-05-15",
    gender: "Male",
    gradeLevel: "Grade 10",
    parentName: "Ramesh Sharma",
    parentPhone: "+91 98765 00000",
    address: "Central Campus Quarters",
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
      const updatedUser = { ...currentUser, ...formData };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      await fetch("http://localhost:5000/api/student-portal/profile", {
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
        Loading Student Profile Details...
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
    : "ST";

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
          Student Identification Settings
        </span>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex justify-between items-center">
          <span>✅ Profile credentials updated successfully!</span>
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
            👤 Personal Details & Academic Identity
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
                {formData.name || "Student Name"}
              </h3>
              <p className="text-xs text-slate-500">
                Admission No:{" "}
                <strong className="text-[#B8842E]">
                  {formData.admissionNo || "Pending"}
                </strong>
              </p>
              <p className="text-xs text-slate-400">
                {formData.gradeLevel} · Registered Student
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
                Admission Number
              </label>
              <input
                type="text"
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                required
                className="w-full border p-2.5 rounded-xl font-mono font-bold outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl font-medium cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grade Level
              </label>
              <input
                type="text"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Profile Avatar
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
                Parent / Guardian Name
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parent Phone Contact
              </label>
              <input
                type="text"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full border p-2.5 rounded-xl outline-none focus:border-[#0F1E3D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Address
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
            {saving ? "Saving..." : "Save Profile Details 💾"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function StudentDashboard() {
  const [selectedClassFilter, setSelectedClassFilter] = useState("Grade 10");
  const [activeTab, setActiveTab] = useState<
    | "assignments"
    | "overview"
    | "courses"
    | "upcoming"
    | "timetable"
    | "notifications"
    | "catalog"
    | "recordings"
    | "elibrary"
    | "support"
    | "profile"
  >("assignments");

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

  const [tenant, setTenant] = useState<any>({
    school_name: "e-Vidyalaya High School",
    primary_color: "#0F1E3D",
    secondary_color: "#B8842E",
    logo_url: "",
    logo_text: "eV",
  });

  const [profile, setProfile] = useState<any>({
    name: "Rahul Sharma",
    email: "rahul@student.com",
    roll_no: "EV-2026-1089",
    avatar_url: "",
  });
  const [overview, setOverview] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [elibraryDocs, setElibraryDocs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string }>
  >([
    {
      sender: "bot",
      text: "Hello! 👋 I'm connected to your live school records. Ask me about your assignments, upcoming live sessions, or course schedules!",
    },
  ]);

  useEffect(() => {
    fetchProfile();
  }, [activeTab]);

  useEffect(() => {
    fetchAllPortalData();

    const interval = setInterval(() => {
      fetchAllPortalData(true);
    }, 1000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("evidyalaya_realtime_updates");
      bc.onmessage = (event) => {
        if (event.data?.type === "REFRESH_PORTAL_DATA") {
          fetchAllPortalData(true);
        }
      };
    } catch (e) {}

    const syncHandler = () => fetchAllPortalData(true);
    window.addEventListener("storage", syncHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncHandler);
      if (bc) bc.close();
    };
  }, [selectedClassFilter]);

  const fetchProfile = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          name: parsed.name || "Rahul Sharma",
          email: parsed.email || "rahul@student.com",
          roll_no: parsed.admissionNo || "EV-2026-1089",
          avatar_url: parsed.avatarUrl || "",
        });
      }
    } catch (e) {}
  };

  const fetchAllPortalData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const encGrade = encodeURIComponent(selectedClassFilter);
    const t = Date.now();

    try {
      const [bRes, aRes, nRes, sRes, cRes, tRes, ttRes] = await Promise.all([
        fetch(`http://localhost:5000/admin/branding?t=${t}`, {
          cache: "no-store",
        }),
        fetch(
          `http://localhost:5000/faculty/assignments?grade=${encGrade}&t=${t}`,
          { cache: "no-store" },
        ),
        fetch(
          `http://localhost:5000/faculty/announcements?grade=${encGrade}&t=${t}`,
          { cache: "no-store" },
        ),
        fetch(
          `http://localhost:5000/faculty/schedules?grade=${encGrade}&t=${t}`,
          { cache: "no-store" },
        ),
        fetch(`http://localhost:5000/faculty/catalog?t=${t}`, {
          cache: "no-store",
        }),
        fetch(`http://localhost:5000/faculty/support?t=${t}`, {
          cache: "no-store",
        }),
        fetch(
          `http://localhost:5000/faculty/timetable?grade=${encGrade}&t=${t}`,
          { cache: "no-store" },
        ),
      ]);

      if (bRes.ok) setTenant(await bRes.json());
      if (aRes.ok) setAssignments(await aRes.json());
      if (nRes.ok) setNotifications(await nRes.json());
      if (sRes.ok) setUpcomingClasses(await sRes.json());
      if (cRes.ok) setCatalog(await cRes.json());
      if (tRes.ok) setTickets(await tRes.json());
      if (ttRes.ok) setTimetable(await ttRes.json());
    } catch (err) {
      console.error("Live fetch error:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleBuyCourse = async (course: any) => {
    try {
      alert(
        `Course Unlocked! ${course.title}. Transaction ID: TXN-${Date.now()}`,
      );
    } catch (e) {}
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage)
      return alert("Please fill in subject and message!");

    try {
      await fetch("http://localhost:5000/faculty/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          userEmail: profile.email || "rahul@student.com",
        }),
      });
      alert("Support ticket submitted!");
    } catch (e) {
      alert("Support ticket submitted!");
    } finally {
      setTicketSubject("");
      setTicketMessage("");
      fetchAllPortalData();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `I can help with your ${selectedClassFilter} assignments, upcoming live sessions, or notes!`,
        },
      ]);
    }, 400);
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
        <title>{`${tenant.school_name || "Student Portal"} — ${selectedClassFilter}`}</title>
      </Head>

      <header
        style={{ backgroundColor: tenant.primary_color || "#0F1E3D" }}
        className="text-white px-6 py-3.5 flex justify-between items-center shadow-lg sticky top-0 z-50 transition-colors"
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
              Student Learning Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs text-amber-300 font-bold">
              Class Filter:
            </span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-black/30 text-white text-xs font-bold px-2 py-0.5 rounded outline-none cursor-pointer"
            >
              {gradesList.map((g) => (
                <option key={g} value={g} className="text-slate-900 font-bold">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 p-1.5 px-3 rounded-2xl cursor-pointer border border-white/10 transition-all"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-400 text-[#0F1E3D] font-bold text-xs flex items-center justify-center">
                {profile.name ? profile.name[0].toUpperCase() : "S"}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">
                {profile.name}
              </p>
              <span className="text-[10px] text-amber-300 font-mono">
                {profile.roll_no}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{ backgroundColor: tenant.secondary_color || "#B8842E" }}
            className="text-xs font-bold text-white px-4 py-2 rounded-xl cursor-pointer shadow-md transition hover:brightness-110"
          >
            Logout 🚪
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <aside className="w-72 bg-white border-r border-slate-200/80 p-5 hidden md:flex flex-col justify-between sticky top-[61px] h-[calc(100vh-61px)] shadow-xs">
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </div>
            {[
              {
                id: "assignments",
                label: "Assignments & Tests 📝",
                icon: "📝",
              },
              { id: "overview", label: "Overview & Analytics 📊", icon: "📊" },
              { id: "courses", label: "Enrolled Courses 📖", icon: "📖" },
              { id: "upcoming", label: "Upcoming Classes 🎥", icon: "🎥" },
              { id: "timetable", label: "Timetable Schedule 🗓️", icon: "🗓️" },
              {
                id: "notifications",
                label: "Announcements & Events 🔔",
                icon: "🔔",
              },
              { id: "catalog", label: "Global Course Catalog 🛒", icon: "🛒" },
              {
                id: "recordings",
                label: "Archived Video Playback 📼",
                icon: "📼",
              },
              { id: "elibrary", label: "E-Library Documents 📚", icon: "📚" },
              { id: "support", label: "Helpdesk & Support 🎟️", icon: "🎟️" },
              { id: "profile", label: "My Student Profile 👤", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={
                  activeTab === tab.id
                    ? { backgroundColor: tenant.primary_color || "#0F1E3D" }
                    : {}
                }
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {activeTab === "profile" ? (
            <StudentProfile onBack={() => setActiveTab("assignments")} />
          ) : loading ? (
            <div className="p-12 text-center text-xs font-bold text-slate-500">
              🔄 Fetching dynamic records for {selectedClassFilter}...
            </div>
          ) : (
            <>
              {activeTab === "assignments" && (
                <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                    📝 Pending Tests & Published Assignments (
                    {selectedClassFilter})
                  </h3>
                  <div className="space-y-3">
                    {assignments.length === 0 ? (
                      <p className="text-slate-400 p-6 text-center">
                        No tests or assignments published yet for{" "}
                        {selectedClassFilter}.
                      </p>
                    ) : (
                      assignments.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs hover:border-[#0F1E3D] transition"
                        >
                          <div>
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              {a.grade_level ||
                                a.gradeLevel ||
                                selectedClassFilter}
                            </span>
                            <h4 className="font-bold text-[#0F1E3D] text-sm mt-1">
                              {a.title}
                            </h4>
                            <p className="text-slate-500 font-mono">
                              Due:{" "}
                              {a.due_date || a.dueDate || "Tomorrow · 11:59 PM"}
                            </p>
                          </div>
                          <a
                            href={a.test_link || "https://forms.gle/sample"}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs"
                          >
                            Open Test Form 🔗
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                    📊 Academic Overview & Attendance Metrics (
                    {selectedClassFilter})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                      <span className="text-3xl font-black text-emerald-600">
                        {overview?.attendancePct || 94}%
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-bold">
                        Attendance Rate 📈
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                      <span className="text-3xl font-black text-[#0F1E3D]">
                        {overview?.academicScorePct || 88}%
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-bold">
                        Academic Score 🎓
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                      <span className="text-3xl font-black text-amber-600">
                        {assignments.length}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-bold">
                        Pending Tests 📝
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                      <span className="text-3xl font-black text-purple-600">
                        {overview?.overallGrade || "A+"}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 font-bold">
                        Overall Grade 🏆
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "courses" && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                    📖 Enrolled Active Courses ({selectedClassFilter})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catalog.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white p-5 rounded-3xl border shadow-xs space-y-2 text-xs"
                      >
                        <span className="font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">
                          {c.code}
                        </span>
                        <h4 className="font-bold text-base text-[#0F1E3D]">
                          {c.title}
                        </h4>
                        <p className="text-slate-500">
                          Instructor: Prof. R. Sharma
                        </p>
                        <div className="pt-2 flex justify-between items-center text-slate-600 border-t">
                          <span>
                            Progress:{" "}
                            <strong className="text-emerald-600">85%</strong>
                          </span>
                          <button
                            onClick={() => setActiveTab("upcoming")}
                            style={{
                              backgroundColor:
                                tenant.primary_color || "#0F1E3D",
                            }}
                            className="text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer transition hover:brightness-110"
                          >
                            View Schedule 🎥
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "upcoming" && (
                <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                    🎥 Live Broadcasts & Upcoming Classes ({selectedClassFilter}
                    )
                  </h3>
                  <div className="space-y-3">
                    {upcomingClasses.length === 0 ? (
                      <p className="text-xs text-slate-400 p-6 text-center">
                        No live class schedules published yet for{" "}
                        {selectedClassFilter}.
                      </p>
                    ) : (
                      upcomingClasses.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs hover:border-[#0F1E3D] transition"
                        >
                          <div>
                            <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                              {s.grade_level ||
                                s.gradeLevel ||
                                selectedClassFilter}
                            </span>
                            <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                              {s.title}
                            </h4>
                            <p className="text-slate-500">
                              ⏰ {s.start_time || s.startTime || "08:30 AM"} -{" "}
                              {s.end_time || s.endTime || "09:30 AM"} ·{" "}
                              {s.day_of_week || s.dayOfWeek || "Monday"}
                            </p>
                          </div>
                          <a
                            href={
                              s.zoom_url ||
                              s.zoomUrl ||
                              s.meeting_link ||
                              "https://zoom.us/j/demo"
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor:
                                tenant.primary_color || "#0F1E3D",
                            }}
                            className="text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition hover:brightness-110"
                          >
                            Join Live Broadcast 🎥
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "timetable" && (
                <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                    🗓️ Weekly Timetable Schedule ({selectedClassFilter})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-slate-200">
                      <thead className="bg-slate-50 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Course Code</th>
                          <th className="p-3">Course Title</th>
                          <th className="p-3">Day</th>
                          <th className="p-3">Timing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {timetable.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-6 text-center text-slate-400"
                            >
                              No timetable entries found for{" "}
                              {selectedClassFilter}.
                            </td>
                          </tr>
                        ) : (
                          timetable.map((t, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-bold font-mono text-[#0F1E3D]">
                                {t.code}
                              </td>
                              <td className="p-3 font-bold">{t.title}</td>
                              <td className="p-3 font-bold text-amber-700">
                                {t.day_of_week}
                              </td>
                              <td className="p-3 text-slate-500 font-mono">
                                {t.start_time} - {t.end_time}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                    🔔 Class, Sports & Campus Announcements (
                    {selectedClassFilter})
                  </h3>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 p-6 text-center">
                        No announcements broadcasted yet for{" "}
                        {selectedClassFilter}.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-4 border rounded-2xl bg-amber-50/50 border-amber-200/80 space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#0F1E3D] text-sm">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                              {n.sender_name || "Faculty / Admin"}
                            </span>
                          </div>
                          <p className="text-slate-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "catalog" && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                    🛒 Global Course Catalog & Previews
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {catalog.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-4 text-xs"
                      >
                        <div>
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {c.code}
                          </span>
                          <h4 className="font-bold text-[#0F1E3D] text-sm mt-2">
                            {c.title}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() =>
                              setActiveTrailer(
                                c.trailer_url ||
                                  "https://www.w3schools.com/html/mov_bbb.mp4",
                              )
                            }
                            className="w-full bg-slate-100 hover:bg-slate-200 text-[#0F1E3D] font-bold py-2 rounded-xl border cursor-pointer transition"
                          >
                            Watch Trailer 🎬
                          </button>
                          <button
                            onClick={() => handleBuyCourse(c)}
                            style={{
                              backgroundColor:
                                tenant.primary_color || "#0F1E3D",
                            }}
                            className="w-full text-white font-bold py-2.5 rounded-xl cursor-pointer transition hover:brightness-110 shadow-xs"
                          >
                            Enroll / Buy (₹{c.price || 1299}) 💳
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "support" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
                  <form
                    onSubmit={handleCreateTicket}
                    className="bg-white p-6 rounded-3xl border space-y-3 shadow-xs"
                  >
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      🎟️ Create Support Ticket
                    </h3>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Question about assignment schedule"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        required
                        className="w-full border p-2.5 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Message Details
                      </label>
                      <textarea
                        placeholder="Describe your query..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        required
                        className="w-full border p-2.5 rounded-xl h-28 outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: tenant.primary_color || "#0F1E3D",
                      }}
                      className="w-full text-white font-bold py-3 rounded-xl cursor-pointer transition hover:brightness-110 shadow-md"
                    >
                      Submit Ticket 📩
                    </button>
                  </form>

                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border space-y-3 shadow-xs">
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      My Active Support Tickets
                    </h3>
                    <div className="space-y-2">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 border rounded-xl bg-slate-50 flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-bold text-[#0F1E3D]">
                              {t.subject}
                            </h4>
                            <p className="text-slate-500 mt-0.5">{t.message}</p>
                          </div>
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            {t.status || "Open"}
                          </span>
                        </div>
                      ))}
                    </div>
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
