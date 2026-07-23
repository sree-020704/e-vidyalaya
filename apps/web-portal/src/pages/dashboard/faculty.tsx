import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

interface StudentRosterItem {
  id: number;
  name: string;
  email: string;
  grade: string;
  paymentStatus: "Paid" | "Pending";
  attendanceRate: string;
  group: string;
}

interface ClassScheduleItem {
  id: number;
  title: string;
  courseCode: string;
  scheduledAt: string;
  zoomUrl: string;
  status: "Live" | "Upcoming" | "Completed";
}

export default function FacultyDashboard() {
  const router = useRouter();
  const [facultyUser, setFacultyUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "classes" | "content" | "roster" | "support"
  >("classes");

  // Approval Status Badge
  const [isApproved, setIsApproved] = useState(true);

  // Live Classes State
  const [classes, setClasses] = useState<ClassScheduleItem[]>([
    {
      id: 1,
      title: "10th Standard Mathematics — Geometry & Theorems",
      courseCode: "MATH-10",
      scheduledAt: "Today · 09:00 AM - 10:00 AM",
      zoomUrl: "https://zoom.us/j/1234567890",
      status: "Live",
    },
    {
      id: 2,
      title: "Physical Science Lab Operations & Quantum Physics",
      courseCode: "SCI-10",
      scheduledAt: "Tomorrow · 10:30 AM - 11:30 AM",
      zoomUrl: "https://zoom.us/j/0987654321",
      status: "Upcoming",
    },
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("MATH-10");
  const [newTime, setNewTime] = useState("");
  const [newZoom, setNewZoom] = useState("");

  // Roster State
  const [roster, setRoster] = useState<StudentRosterItem[]>([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@student.com",
      grade: "Class 10",
      paymentStatus: "Paid",
      attendanceRate: "94%",
      group: "Advanced Mathematics",
    },
    {
      id: 2,
      name: "Ananya Patel",
      email: "ananya@student.com",
      grade: "Class 10",
      paymentStatus: "Paid",
      attendanceRate: "88%",
      group: "Physics Lab A",
    },
    {
      id: 3,
      name: "Vikram Singh",
      email: "vikram@student.com",
      grade: "Class 10",
      paymentStatus: "Pending",
      attendanceRate: "72%",
      group: "General Science",
    },
  ]);

  // Content Upload State
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState<"pdf" | "ppt" | "trailer">(
    "pdf",
  );

  // Support Chat Log
  const [supportQuery, setSupportQuery] = useState("");
  const [supportLog, setSupportLog] = useState([
    {
      sender: "system",
      text: "Welcome to Faculty Tech Support. Need immediate assistance during your live broadcast?",
    },
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setFacultyUser(JSON.parse(stored));
      } else {
        setFacultyUser({
          name: "Prof. R. Sharma",
          email: "sharma@evidyalaya.com",
          role: "faculty",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newZoom) return;

    const newClassItem: ClassScheduleItem = {
      id: Date.now(),
      title: newTitle,
      courseCode: newCode,
      scheduledAt: newTime || "Scheduled Time",
      zoomUrl: newZoom,
      status: "Upcoming",
    };

    setClasses((prev) => [newClassItem, ...prev]);
    setNewTitle("");
    setNewZoom("");
    setNewTime("");
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportQuery.trim()) return;

    const query = supportQuery;
    setSupportLog((prev) => [...prev, { sender: "faculty", text: query }]);
    setSupportQuery("");

    setTimeout(() => {
      setSupportLog((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Ticket #EV-SUP-${Math.floor(1000 + Math.random() * 9000)} generated. Support technician notified for your active session.`,
        },
      ]);
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-bold text-[#0F1E3D]">
        Initializing Faculty Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col antialiased">
      <Head>
        <title>Faculty Portal — e-Vidyalaya</title>
      </Head>

      {/* HEADER NAVBAR */}
      <header className="bg-[#0F1E3D] text-white px-6 py-3.5 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border-2 border-[#B8842E] bg-[#16294C] flex items-center justify-center font-bold text-[#E7DCC4] text-sm shadow-inner">
            eV
          </div>
          <div>
            <h1 className="font-serif font-bold text-base leading-tight text-white tracking-wide">
              e-Vidyalaya
            </h1>
            <span className="text-[10px] text-amber-300/80 font-medium tracking-wider uppercase">
              Faculty Management Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Verified Educator
          </span>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            className="text-xs font-bold bg-[#B8842E] hover:bg-[#a07226] text-white px-4 py-2 rounded-xl transition cursor-pointer shadow-md active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      {!isApproved && (
        <div className="bg-amber-500 text-slate-900 px-6 py-2.5 text-xs font-bold flex justify-between items-center shadow-sm">
          <span>
            ⚠️ Account Approval Pending: Content publishing is in preview mode
            until admin verification.
          </span>
          <button
            onClick={() => setIsApproved(true)}
            className="underline cursor-pointer"
          >
            Simulate Admin Approval
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-72 bg-white border-r border-slate-200/80 p-5 hidden md:flex flex-col justify-between sticky top-[61px] h-[calc(100vh-61px)] shadow-sm">
          <div className="space-y-2">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </div>
            {[
              { id: "classes", label: "Live Classes & Timetable", icon: "📡" },
              { id: "content", label: "Syllabus & Course Uploads", icon: "📤" },
              { id: "roster", label: "Student Roster Analytics", icon: "📊" },
              { id: "support", label: "Live Tech Helpdesk", icon: "💬" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#0F1E3D] text-white shadow-md shadow-blue-950/20 translate-x-1"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-[#0F1E3D]"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Educator Session
            </span>
            <p className="text-xs font-bold text-[#0F1E3D] truncate">
              {facultyUser?.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {facultyUser?.email}
            </p>
          </div>
        </aside>

        {/* CONTENT VIEWPORT */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* BANNER CARD */}
          <div className="bg-gradient-to-r from-[#0F1E3D] via-[#16294C] to-[#0F1E3D] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-700/50">
            <div className="space-y-2">
              <span className="bg-[#B8842E]/30 text-amber-200 border border-[#B8842E]/50 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Faculty Workspace
              </span>
              <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#E7DCC4]">
                Welcome back, {facultyUser?.name?.split(" ")[0] || "Professor"}!
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Manage your scheduled live interactive broadcasts, review
                student attendance rates, and publish class materials.
              </p>
            </div>

            <div className="flex gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <div className="text-center px-4 border-r border-white/20">
                <span className="block text-xl font-black text-amber-300">
                  2
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-medium">
                  Classes Today
                </span>
              </div>
              <div className="text-center px-4">
                <span className="block text-xl font-black text-emerald-400">
                  94%
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-medium">
                  Avg Attendance
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: LIVE CLASSES & SCHEDULE */}
          {activeTab === "classes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SCHEDULER FORM */}
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                    Schedule Live Class
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Publish new interactive Zoom links for students.
                  </p>
                </div>

                <form
                  onSubmit={handleScheduleClass}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Class Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10th Math Polynomials & Algebra"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D] focus:ring-2 focus:ring-[#0F1E3D]/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Course Mapping
                    </label>
                    <select
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D] bg-white"
                    >
                      <option value="MATH-10">
                        MATH-10: 10th Standard Mathematics
                      </option>
                      <option value="SCI-10">
                        SCI-10: Physical Science Lab
                      </option>
                      <option value="DEV-101">
                        DEV-101: Full-Stack Web Development
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Time Schedule
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Today · 02:00 PM - 03:00 PM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Zoom Meeting Classroom URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://zoom.us/j/1234567890"
                      value={newZoom}
                      onChange={(e) => setNewZoom(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D] font-mono text-[11px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0F1E3D] hover:bg-[#16294C] text-white font-bold py-3.5 rounded-2xl transition cursor-pointer shadow-md active:scale-95 text-xs"
                  >
                    Publish Schedule 📡
                  </button>
                </form>
              </div>

              {/* SCHEDULE LIST */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      Active Class Schedule
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your upcoming and ongoing broadcast sessions.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    {classes.length} Sessions Active
                  </span>
                </div>

                <div className="space-y-4">
                  {classes.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                            {c.courseCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              c.status === "Live"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            ● {c.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-[#0F1E3D]">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span>🕒</span> {c.scheduledAt}
                        </p>
                      </div>

                      <a
                        href={c.zoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#0F1E3D] hover:bg-[#16294C] text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95"
                      >
                        <span>Launch Zoom Room</span>
                        <span>🎥</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT UPLOADS */}
          {activeTab === "content" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 max-w-3xl">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                  Upload Materials & Class Preview Trailers
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Publish lecture slides, notes, or promotional preview videos
                  to the E-Library.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(
                    `Successfully uploaded "${contentTitle}" to student portal!`,
                  );
                  setContentTitle("");
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Document / Video Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 4 Integration Formula Notes"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D] bg-white"
                  >
                    <option value="pdf">📕 PDF Lecture Notes</option>
                    <option value="ppt">📊 PPT Slide Deck</option>
                    <option value="trailer">🎥 Preview Video Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Select File (PDF / PPTX / MP4)
                  </label>
                  <input
                    type="file"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 cursor-pointer text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#B8842E] hover:bg-[#a07226] text-white text-xs font-bold px-8 py-3.5 rounded-2xl transition shadow-md active:scale-95"
                >
                  Upload & Sync 📂
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ROSTER ANALYTICS */}
          {activeTab === "roster" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                    Student Roster & Interest Group Mapping
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage enrolled student profiles, attendance metrics, and
                    custom study groups.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-400 border-b">
                    <tr>
                      <th className="p-4">Student Profile</th>
                      <th className="p-4">Grade</th>
                      <th className="p-4">Fee Status</th>
                      <th className="p-4">Attendance</th>
                      <th className="p-4">Assigned Interest Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="p-4 font-bold text-slate-800">
                          {s.name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {s.email}
                          </span>
                        </td>
                        <td className="p-4">{s.grade}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              s.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {s.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">
                          {s.attendanceRate}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={s.group}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRoster((prev) =>
                                prev.map((item) =>
                                  item.id === s.id
                                    ? { ...item, group: val }
                                    : item,
                                ),
                              );
                            }}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0F1E3D]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HELPDESK */}
          {activeTab === "support" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 max-w-2xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                  Live Broadcast Tech Helpdesk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Need help with screen share, Zoom SDK key, or audio streaming?
                </p>
              </div>

              <div className="h-64 border border-slate-200 rounded-2xl p-4 bg-slate-50/50 overflow-y-auto space-y-3 text-xs">
                {supportLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex ${log.sender === "faculty" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
                        log.sender === "faculty"
                          ? "bg-[#0F1E3D] text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      {log.text}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSupportSubmit}
                className="flex gap-2 text-xs"
              >
                <input
                  type="text"
                  placeholder="Ask a question or report a stream issue..."
                  value={supportQuery}
                  onChange={(e) => setSupportQuery(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F1E3D]"
                />
                <button
                  type="submit"
                  className="bg-[#B8842E] hover:bg-[#a07226] text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
