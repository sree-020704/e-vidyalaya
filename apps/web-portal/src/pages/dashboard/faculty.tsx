import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function FacultyDashboard() {
  const router = useRouter();
  const [facultyUser, setFacultyUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "classes"
    | "promos"
    | "content"
    | "assignments"
    | "roster"
    | "support"
  >("dashboard");
  const [targetGrade, setTargetGrade] = useState("Grade 10");

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

  // FR-FAC-01 Verification Status
  const [verificationStatus, setVerificationStatus] = useState("Active");

  // Stores
  const [schedules, setSchedules] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // FR-FAC-02 Form States
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("MATH-1001");
  const [newZoom, setNewZoom] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null,
  );

  // Material Form (Trailers, Syllabus, Promos)
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState<"Trailer" | "Syllabus" | "Promo">(
    "Trailer",
  );
  const [selectedMatFile, setSelectedMatFile] = useState<File | null>(null);

  // E-Library State
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState<"pdf" | "doc" | "ppt">("pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Assignment / Grading State
  const [assignTitle, setAssignTitle] = useState("");
  const [testLink, setTestLink] = useState("");

  // FR-FAC-04 Support Helpdesk State
  const [supportQuery, setSupportQuery] = useState("");
  const [supportLog, setSupportLog] = useState([
    {
      sender: "bot",
      text: "Welcome to EV-Tech Bot Support! Need instant help during your live stream?",
    },
  ]);

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchMaterials();
    fetchRoster();
    fetchAssignments();
  }, [targetGrade]);

  const fetchProfileStatus = async () => {
    try {
      const stored = localStorage.getItem("user");
      const user = stored
        ? JSON.parse(stored)
        : { name: "Prof. R. Sharma", email: "sharma@evidyalaya.com" };
      setFacultyUser(user);

      const res = await fetch(
        `http://localhost:5000/faculty/profile/status?email=${encodeURIComponent(user.email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus(data.verificationStatus || "Active");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/faculty/schedules/all?grade=${encodeURIComponent(targetGrade)}`,
      );
      if (res.ok) setSchedules(await res.json());
    } catch (e) {}
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/faculty/materials/all?grade=${encodeURIComponent(targetGrade)}`,
      );
      if (res.ok) setMaterials(await res.json());
    } catch (e) {}
  };

  const fetchRoster = async () => {
    try {
      const res = await fetch(`http://localhost:5000/faculty/roster`);
      if (res.ok) setRoster(await res.json());
    } catch (e) {}
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/faculty/assignments?grade=${encodeURIComponent(targetGrade)}`,
      );
      if (res.ok) setAssignments(await res.json());
    } catch (e) {}
  };

  // --- HANDLERS ---
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScheduleId) {
      await fetch(
        `http://localhost:5000/faculty/schedules/${editingScheduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zoomUrl: newZoom, dayOfWeek: "Monday" }),
        },
      );
      setEditingScheduleId(null);
    } else {
      await fetch(`http://localhost:5000/faculty/schedules/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          courseCode: newCode,
          gradeLevel: targetGrade,
          zoomUrl: newZoom,
        }),
      });
    }
    setNewTitle("");
    setNewZoom("");
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id: number) => {
    if (confirm("Delete live session schedule?")) {
      await fetch(`http://localhost:5000/faculty/schedules/${id}`, {
        method: "DELETE",
      });
      fetchSchedules();
    }
  };

  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle || !selectedMatFile) return alert("Select title and file!");

    const formData = new FormData();
    formData.append("title", matTitle);
    formData.append("materialType", matType);
    formData.append("gradeLevel", targetGrade);
    formData.append("file", selectedMatFile);

    await fetch("http://localhost:5000/faculty/materials/upload", {
      method: "POST",
      body: formData,
    });
    alert(`${matType} published successfully!`);
    setMatTitle("");
    setSelectedMatFile(null);
    fetchMaterials();
  };

  const handleMapStudent = async (
    id: number,
    assignedGroup: string,
    paymentStatus: string,
  ) => {
    await fetch(`http://localhost:5000/faculty/roster/${id}/map-group`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedGroup, paymentStatus }),
    });
    alert("Student mapped to group!");
    fetchRoster();
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportQuery.trim()) return;

    setSupportLog((prev) => [
      ...prev,
      { sender: "faculty", text: supportQuery },
    ]);
    setSupportQuery("");

    setTimeout(() => {
      setSupportLog((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Tech Assistant assigned. Priority response dispatched to your session email!",
        },
      ]);
    }, 400);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-bold text-[#0F1E3D]">
        Initializing Faculty Portal...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col antialiased">
      <Head>
        <title>Faculty Portal — e-Vidyalaya</title>
      </Head>

      {/* HEADER */}
      <header className="bg-[#0F1E3D] text-white px-6 py-3.5 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border-2 border-[#B8842E] bg-[#16294C] flex items-center justify-center font-bold text-[#E7DCC4] text-sm">
            eV
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white">
              e-Vidyalaya
            </h1>
            <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
              Faculty Management Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs text-amber-300 font-bold">
              Class View:
            </span>
            <select
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className="bg-[#0F1E3D] text-white text-xs font-bold px-2 py-0.5 rounded outline-none cursor-pointer"
            >
              {gradesList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            className="text-xs font-bold bg-[#B8842E] hover:bg-[#a07226] text-white px-4 py-2 rounded-xl cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* FR-FAC-01 VERIFICATION ALERT BANNER */}
      {verificationStatus !== "Active" && (
        <div className="bg-amber-500 text-slate-900 px-6 py-2 text-xs font-bold flex justify-between items-center shadow-xs">
          <span>
            ⚠️ Account Verification Pending: Content publishing is in preview
            mode until admin onboarding approval.
          </span>
          <button
            onClick={() => setVerificationStatus("Active")}
            className="underline cursor-pointer"
          >
            Simulate Approval
          </button>
        </div>
      )}

      {/* MAIN CONTAINER WITH LEFT SIDEBAR */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-72 bg-white border-r border-slate-200/80 p-5 hidden md:flex flex-col justify-between sticky top-[61px] h-[calc(100vh-61px)] shadow-xs">
          <div className="space-y-2">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Faculty Menu
            </div>
            {[
              {
                id: "dashboard",
                label: "Dashboard & Launcher (FR-FAC-03)",
                icon: "🎥",
              },
              {
                id: "classes",
                label: "Live Classes & Timetable (FR-FAC-02)",
                icon: "📡",
              },
              {
                id: "promos",
                label: "Trailers & Syllabus (FR-FAC-02)",
                icon: "🎬",
              },
              {
                id: "roster",
                label: "Roster Analytics & Mapping (FR-FAC-03)",
                icon: "📊",
              },
              { id: "assignments", label: "Test Links & Grading", icon: "📝" },
              {
                id: "support",
                label: "Live Support Portal (FR-FAC-04)",
                icon: "💬",
              },
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
              Verification Status
            </span>
            <p className="text-xs font-bold text-[#0F1E3D] flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${verificationStatus === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}
              ></span>
              {facultyUser?.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {facultyUser?.email}
            </p>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* TAB 1: FR-FAC-03 TEACHING SCHEDULE & LIVE CLASS LAUNCHER */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0F1E3D] via-[#16294C] to-[#0F1E3D] text-white p-6 rounded-3xl shadow-xl flex justify-between items-center">
                <div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    Teaching Launcher
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-[#E7DCC4] mt-2">
                    Welcome, {facultyUser?.name}!
                  </h2>
                  <p className="text-xs text-slate-300">
                    Target Grade:{" "}
                    <span className="font-bold text-amber-300">
                      {targetGrade}
                    </span>
                  </p>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="block text-2xl font-black text-amber-300">
                    {schedules.length}
                  </span>
                  <span className="text-[10px] text-slate-300 uppercase font-bold">
                    Upcoming Classes
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  🎥 Live Class Launcher ({targetGrade})
                </h3>
                <div className="space-y-3">
                  {schedules.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No active class schedules found.
                    </p>
                  ) : (
                    schedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                            {s.code || "LIVE"}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                            {s.title}
                          </h4>
                          <p className="text-slate-500">
                            ⏰ {s.start_time} - {s.end_time} · {s.day_of_week}
                          </p>
                        </div>
                        <a
                          href={s.zoomUrl || s.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#0F1E3D] hover:bg-[#16294C] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <span>Launch Zoom Broadcast</span> 🎥
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FR-FAC-02 CREATE & SCHEDULE LIVE/RECURRING CLASSES */}
          {activeTab === "classes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form
                onSubmit={handleSaveSchedule}
                className="bg-white p-6 rounded-3xl border shadow-xs space-y-4 text-xs"
              >
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  {editingScheduleId
                    ? "Edit Schedule"
                    : "Create & Schedule Live Class"}
                </h3>
                {!editingScheduleId && (
                  <>
                    <input
                      type="text"
                      placeholder="Title (e.g. Geometry & Theorems)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full border p-3 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Course Code (e.g. MATH-1001)"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                      className="w-full border p-3 rounded-xl font-mono"
                    />
                  </>
                )}
                <input
                  type="url"
                  placeholder="Zoom Meeting Room Link"
                  value={newZoom}
                  onChange={(e) => setNewZoom(e.target.value)}
                  required
                  className="w-full border p-3 rounded-xl font-mono"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0F1E3D] text-white font-bold py-3.5 rounded-2xl cursor-pointer"
                >
                  {editingScheduleId ? "Save Changes" : "Publish Schedule 📡"}
                </button>
              </form>

              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  Active Timetable Schedulers ({targetGrade})
                </h3>
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
                          {s.code}
                        </span>
                        <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                          {s.title}
                        </h4>
                        <p className="text-slate-500">
                          ⏰ {s.start_time} - {s.end_time} · {s.day_of_week}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingScheduleId(s.id);
                            setNewZoom(s.zoomUrl || s.meeting_link);
                          }}
                          className="bg-amber-500 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FR-FAC-02 CLASS TRAILERS, SYLLABUS & PROMO MATERIALS */}
          {activeTab === "promos" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <form
                onSubmit={handleMaterialUpload}
                className="bg-white p-6 rounded-3xl border shadow-xs space-y-4 text-xs"
              >
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  Upload Class Trailer or Syllabus
                </h3>
                <select
                  value={matType}
                  onChange={(e) => setMatType(e.target.value as any)}
                  className="w-full border p-3 rounded-xl font-bold bg-white"
                >
                  <option value="Trailer">🎬 Class Trailer Video</option>
                  <option value="Syllabus">📄 Syllabus Material</option>
                  <option value="Promo">🎥 Promotional Sample</option>
                </select>
                <input
                  type="text"
                  placeholder="Material Title"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  required
                  className="w-full border p-3 rounded-xl"
                />
                <input
                  type="file"
                  onChange={(e) =>
                    setSelectedMatFile(e.target.files?.[0] || null)
                  }
                  required
                  className="w-full border p-3 rounded-xl bg-slate-50"
                />
                <button
                  type="submit"
                  className="w-full bg-[#B8842E] text-white font-bold py-3.5 rounded-2xl cursor-pointer"
                >
                  Publish Material 🎬
                </button>
              </form>

              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border shadow-xs space-y-3">
                <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  Published Trailers & Syllabus Documents
                </h3>
                <div className="space-y-2">
                  {materials.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] uppercase">
                          {m.material_type}
                        </span>
                        <h4 className="font-bold text-[#0F1E3D] mt-1">
                          {m.title}
                        </h4>
                      </div>
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#0F1E3D] text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        View Material 🔗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FR-FAC-03 ROSTER ANALYTICS & INTEREST GROUP MAPPING */}
          {activeTab === "roster" && (
            <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                Student Roster Analytics & Mapping (FR-FAC-03)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Payment Status</th>
                      <th className="p-3">Attendance Rate</th>
                      <th className="p-3">Mapped Interest Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {roster.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold">
                          {s.name}
                          <br />
                          <span className="text-[10px] text-slate-400 font-normal">
                            {s.email}
                          </span>
                        </td>
                        <td className="p-3 font-bold">
                          {s.grade_level || s.grade}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.payment_status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                          >
                            {s.payment_status || "Paid"}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {s.attendance_rate || "92%"}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            defaultValue={
                              s.assigned_group || s.assignedGroup || "General"
                            }
                            onBlur={(e) =>
                              handleMapStudent(
                                s.id,
                                e.target.value,
                                s.payment_status || "Paid",
                              )
                            }
                            className="border p-1.5 rounded-lg text-xs font-bold outline-none focus:border-[#0F1E3D]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TESTS & MARKS GRADING */}
          {activeTab === "assignments" && (
            <div className="bg-white p-6 rounded-3xl border shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#0F1E3D]">
                Assignments Directory ({targetGrade})
              </h3>
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#0F1E3D]">
                        {a.title}
                      </h4>
                      <p className="text-slate-500 mt-0.5">Due: {a.due_date}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={a.test_link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl"
                      >
                        Open Test 🔗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FR-FAC-04 DEDICATED SUPPORT ACCESS (BOT / HELPDESK) */}
          {activeTab === "support" && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border shadow-xs max-w-2xl space-y-4 text-xs">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#0F1E3D]">
                  Dedicated Live Support Contact Portal (FR-FAC-04)
                </h3>
                <p className="text-slate-500 mt-1">
                  Get immediate technical assistance for stream latency, Zoom
                  SDK authentication, or screen share issues.
                </p>
              </div>

              <div className="h-60 border p-4 rounded-2xl bg-slate-50 overflow-y-auto space-y-2">
                {supportLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex ${log.sender === "faculty" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl shadow-xs ${log.sender === "faculty" ? "bg-[#0F1E3D] text-white" : "bg-white border border-slate-200 text-slate-800"}`}
                    >
                      {log.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSupportSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your live broadcast technical issue..."
                  value={supportQuery}
                  onChange={(e) => setSupportQuery(e.target.value)}
                  className="flex-1 border p-3 rounded-xl outline-none focus:border-[#0F1E3D]"
                />
                <button
                  type="submit"
                  className="bg-[#B8842E] hover:bg-[#a07226] text-white font-bold px-6 py-3 rounded-xl cursor-pointer"
                >
                  Send Assistance Request
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
