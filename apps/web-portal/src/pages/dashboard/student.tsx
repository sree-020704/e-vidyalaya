import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useRouter } from "next/router";

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClassFilter, setSelectedClassFilter] =
    useState<string>("Grade 10");

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

  // Dynamic Stores
  const [profile, setProfile] = useState<any>({
    name: "Rahul Sharma",
    email: "rahul@student.com",
    admissionNo: "EV-2026-1042",
    gradeLevel: "Class 10",
    avatarUrl: "",
  });

  const [overview, setOverview] = useState<any>({
    attendancePct: 92,
    academicScorePct: 88,
    pendingAssignments: 1,
    overallGrade: "A",
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Tab Data
  const [schedules, setSchedules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [certCourses, setCertCourses] = useState<any[]>([]);
  const [libraryDocs, setLibraryDocs] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({
    present_days: 88,
    late_days: 4,
    absent_days: 2,
  });
  const [activities, setActivities] = useState<any[]>([]);

  // 🤖 FLOATING AI CHATBOT STATE
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am EV-Bot AI Campus Assistant. Ask me anything about your class timetable, homework test links, or Zoom rooms!",
    },
  ]);

  useEffect(() => {
    // Load student profile from LocalStorage if updated by profile page
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (router.query.tab) setActiveTab(router.query.tab as string);
  }, [router.query.tab]);

  // FETCH ALL NAVBAR DATA DYNAMICALLY FROM BACKEND
  useEffect(() => {
    async function fetchTabData() {
      const encGrade = encodeURIComponent(selectedClassFilter);
      try {
        // Fetch Live Notifications
        const notifRes = await fetch(
          `http://localhost:5000/api/student-portal/notifications?grade=${encGrade}`,
        );
        if (notifRes.ok) setNotifications(await notifRes.json());

        if (activeTab === "overview") {
          const res = await fetch(
            `http://localhost:5000/api/student-portal/overview?grade=${encGrade}`,
          );
          if (res.ok) setOverview(await res.json());
        } else if (activeTab === "academics" || activeTab === "timetable") {
          const res = await fetch(
            `http://localhost:5000/api/student-portal/schedules?grade=${encGrade}`,
          );
          if (res.ok) setSchedules(await res.json());
        } else if (activeTab === "courses") {
          const res = await fetch(
            `http://localhost:5000/api/student-portal/courses?grade=${encGrade}&category=Regular`,
          );
          if (res.ok) setCourses(await res.json());
        } else if (activeTab === "certifications") {
          const res = await fetch(
            `http://localhost:5000/api/student-portal/courses?grade=${encGrade}&category=Certification`,
          );
          if (res.ok) setCertCourses(await res.json());
        } else if (activeTab === "elibrary") {
          const res = await fetch(
            `http://localhost:5000/faculty/content/all?grade=${encGrade}`,
          );
          if (res.ok) setLibraryDocs(await res.json());
        } else if (activeTab === "assignments" || activeTab === "marks") {
          const res = await fetch(
            `http://localhost:5000/api/student-portal/assignments?grade=${encGrade}`,
          );
          if (res.ok) setAssignments(await res.json());
        } else if (activeTab === "attendance") {
          const res = await fetch(
            `http://localhost:5000/api/student-portal/attendance`,
          );
          if (res.ok) setAttendance(await res.json());
        } else if (
          activeTab === "sports" ||
          activeTab === "events" ||
          activeTab === "workshops"
        ) {
          const cat =
            activeTab === "sports"
              ? "Sports"
              : activeTab === "workshops"
                ? "Workshops"
                : "Events";
          const res = await fetch(
            `http://localhost:5000/api/student-portal/activities?category=${cat}`,
          );
          if (res.ok) setActivities(await res.json());
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchTabData();
  }, [selectedClassFilter, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      let botReply = "I am processing your query. Check your navigation tabs!";
      const lower = userMsg.toLowerCase();

      if (
        lower.includes("zoom") ||
        lower.includes("live") ||
        lower.includes("class")
      ) {
        botReply =
          "Your interactive live class Zoom links are under the Academics tab!";
      } else if (lower.includes("timetable") || lower.includes("schedule")) {
        botReply =
          "Your weekly class matrix is available under the Timetable tab.";
      } else if (
        lower.includes("marks") ||
        lower.includes("assignment") ||
        lower.includes("test")
      ) {
        botReply =
          "Online test forms and graded scores are located under Assignments & Marks!";
      } else if (lower.includes("profile") || lower.includes("photo")) {
        botReply =
          "Click on your top-left circular avatar DP to edit your student profile!";
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 400);
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/student?tab=${tab}`, undefined, { shallow: true });
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <DashboardLayout
      title="Student Workspace"
      activeTab={activeTab}
      onTabChange={handleTabSwitch}
    >
      <div className="space-y-6 font-sans text-slate-800">
        {/* HEADER BANNER WITH CIRCULAR DP AVATAR & NOTIFICATIONS */}
        <div className="bg-gradient-to-r from-[#0F1E3D] via-[#16294C] to-[#0F1E3D] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            {/* CIRCULAR PROFILE DP BUTTON (CLICKS TO EDIT PROFILE PAGE) */}
            <div
              onClick={() =>
                router.push(`/dashboard/profile?fromTab=${activeTab}`)
              }
              className="relative cursor-pointer group"
              title="Click to view/edit student profile settings"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile Avatar"
                  className="w-14 h-14 rounded-full border-2 border-[#B8842E] object-cover shadow-md group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-[#B8842E] bg-[#16294C] text-[#E7DCC4] font-black flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 bg-[#B8842E] text-[9px] text-white rounded-full px-1 font-bold">
                ✎
              </span>
            </div>

            <div>
              <h1 className="font-serif font-bold text-2xl text-[#E7DCC4]">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Admission No:{" "}
                <span className="font-mono text-amber-300">
                  {profile.admissionNo || "EV-2026-1042"}
                </span>{" "}
                · Class:{" "}
                <span className="font-bold text-amber-300">
                  {selectedClassFilter}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICATIONS BELL DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/20 text-sm relative cursor-pointer"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-xs text-[#0F1E3D]">
                      🔔 Faculty & Admin Notices
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-slate-400"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-center py-2">
                        No new announcements.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                        >
                          <span className="font-bold text-[10px] uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {n.sender_role}: {n.sender_name}
                          </span>
                          <h5 className="font-bold text-[#0F1E3D]">
                            {n.title}
                          </h5>
                          <p className="text-slate-500 text-[11px]">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CLASS FILTER DROPDOWN */}
            <div className="bg-white/10 p-2 px-3 rounded-xl border border-white/20 flex items-center gap-2">
              <span className="text-xs text-amber-300 font-bold">Grade:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-[#0F1E3D] text-white text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer"
              >
                {gradesList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
              <span className="text-2xl font-black text-[#0F1E3D]">
                {overview.attendancePct}%
              </span>
              <p className="text-xs text-slate-500 mt-1">Attendance Record</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
              <span className="text-2xl font-black text-emerald-600">
                {overview.academicScorePct}%
              </span>
              <p className="text-xs text-slate-500 mt-1">Academic Score Avg</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
              <span className="text-2xl font-black text-amber-600">
                {overview.pendingAssignments}
              </span>
              <p className="text-xs text-slate-500 mt-1">Pending Homework</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border text-center shadow-xs">
              <span className="text-2xl font-black text-purple-600">
                {overview.overallGrade}
              </span>
              <p className="text-xs text-slate-500 mt-1">Overall Grade Level</p>
            </div>
          </div>
        )}

        {/* 2. ACADEMICS TAB */}
        {activeTab === "academics" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🎥 Virtual Live Classrooms ({selectedClassFilter})
            </h2>
            <div className="space-y-3">
              {schedules.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-xl bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {item.code || "LIVE"}
                    </span>
                    <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      ⏰ {item.start_time} - {item.end_time} ·{" "}
                      {item.day_of_week}
                    </p>
                  </div>
                  <a
                    href={item.zoomUrl || item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#0F1E3D] text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
                  >
                    Join Zoom 🎥
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. COURSES TAB */}
        {activeTab === "courses" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              📖 Standard Curriculum Courses ({selectedClassFilter})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border rounded-xl bg-slate-50 space-y-2"
                >
                  <span className="text-[10px] font-bold bg-[#0F1E3D] text-white px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <h4 className="font-bold text-sm text-[#0F1E3D]">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Provider: {c.provider}
                  </p>
                  <button className="w-full bg-emerald-600 text-white py-1 rounded-lg text-xs font-bold">
                    ✓ Enrolled
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CERTIFICATION COURSES TAB */}
        {activeTab === "certifications" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🎓 Admin Certification Programs ({selectedClassFilter})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border rounded-xl bg-amber-50/50 border-amber-200 space-y-2"
                >
                  <span className="text-[10px] font-bold bg-[#B8842E] text-white px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <h4 className="font-bold text-sm text-[#0F1E3D]">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Certified by: {c.provider}
                  </p>
                  <button className="w-full bg-[#0F1E3D] text-white py-1.5 rounded-lg text-xs font-bold">
                    Enroll in Certification 📜
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DIGITAL LIBRARY TAB */}
        {activeTab === "elibrary" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              📂 Digital Library Downloads ({selectedClassFilter})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraryDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-xl bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {(doc.doc_type || "pdf").toUpperCase()}
                    </span>
                    <h4 className="font-bold text-sm text-[#0F1E3D] mt-2">
                      {doc.title}
                    </h4>
                  </div>
                  <a
                    href={doc.file_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#0F1E3D] text-white text-xs font-bold py-2 rounded-lg text-center block"
                  >
                    Download File 📥
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SPORTS & EVENTS TAB */}
        {(activeTab === "sports" || activeTab === "events") && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🏆 Campus Sports & Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 border rounded-xl bg-slate-50 space-y-2"
                >
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                    {act.category}
                  </span>
                  <h4 className="font-bold text-sm text-[#0F1E3D]">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {act.details} · 📍 {act.venue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. ASSIGNMENTS & MARKS TAB */}
        {(activeTab === "assignments" || activeTab === "marks") && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              📝 Homework Tests & Graded Marks ({selectedClassFilter})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border">
                <thead className="bg-slate-50 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Online Test Link</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 font-bold">{a.title}</td>
                      <td className="p-3">{a.due_date}</td>
                      <td className="p-3">
                        <a
                          href={a.test_link || "https://forms.gle"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-bold underline"
                        >
                          Open Online Form 🔗
                        </a>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold">
                        {a.obtained_marks} / {a.max_marks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. WORKSHOPS TAB */}
        {activeTab === "workshops" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🔧 Interactive Student Workshops
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 border rounded-xl bg-purple-50/50 border-purple-200 space-y-2"
                >
                  <h4 className="font-bold text-sm text-[#0F1E3D]">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {act.details} · 📍 {act.venue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. TIMETABLE TAB */}
        {activeTab === "timetable" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🗓️ Weekly Class Timetable ({selectedClassFilter})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#0F1E3D] text-white uppercase text-[10px]">
                    <th className="p-3 border">Period</th>
                    <th className="p-3 border">Monday</th>
                    <th className="p-3 border">Tuesday</th>
                    <th className="p-3 border">Wednesday</th>
                    <th className="p-3 border">Thursday</th>
                    <th className="p-3 border">Friday</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-bold bg-slate-100">
                      Period 1<br />
                      08:30-09:30 AM
                    </td>
                    <td className="p-3 border bg-blue-50/60 font-bold">
                      {selectedClassFilter} Math
                    </td>
                    <td className="p-3 border bg-emerald-50/60 font-bold">
                      {selectedClassFilter} Physics
                    </td>
                    <td className="p-3 border bg-blue-50/60 font-bold">
                      {selectedClassFilter} Math
                    </td>
                    <td className="p-3 border bg-amber-50/60 font-bold">
                      {selectedClassFilter} English
                    </td>
                    <td className="p-3 border bg-emerald-50/60 font-bold">
                      {selectedClassFilter} Chemistry
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              📊 Official Attendance Log
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-50 border rounded-xl">
                <span className="text-2xl font-black text-emerald-700">
                  {attendance.present_days} Days
                </span>
                <p className="text-xs">Present</p>
              </div>
              <div className="p-4 bg-amber-50 border rounded-xl">
                <span className="text-2xl font-black text-amber-700">
                  {attendance.late_days} Days
                </span>
                <p className="text-xs">Late</p>
              </div>
              <div className="p-4 bg-red-50 border rounded-xl">
                <span className="text-2xl font-black text-red-700">
                  {attendance.absent_days} Days
                </span>
                <p className="text-xs">Absent</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🤖 FLOATING AI CHATBOT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-[#0F1E3D] text-amber-300 font-bold p-4 rounded-full shadow-2xl hover:scale-105 transition flex items-center gap-2 border-2 border-[#B8842E] cursor-pointer"
          >
            <span>🤖 Ask EV-Bot AI</span>
          </button>
        ) : (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[400px]">
            <div className="bg-[#0F1E3D] text-white p-4 flex justify-between rounded-t-2xl">
              <span className="font-bold text-xs">EV-Bot Campus AI</span>
              <button
                onClick={() => setChatOpen(false)}
                className="cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl ${
                    m.sender === "user"
                      ? "bg-[#0F1E3D] text-white text-right font-medium"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={handleSendMessage}
              className="p-2 border-t flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask query..."
                className="flex-1 text-xs border border-slate-200 p-2 rounded-lg outline-none focus:border-[#0F1E3D]"
              />
              <button className="bg-[#B8842E] text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#a07226] transition">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
