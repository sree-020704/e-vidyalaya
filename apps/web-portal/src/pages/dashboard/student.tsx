import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useRouter } from "next/router";

interface ProgressMetric {
  subject: string;
  percentage: number;
  grade: string;
  color: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Filters
  const [docFilter, setDocFilter] = useState<"all" | "pdf" | "ppt" | "doc">(
    "all",
  );
  const [eventFilter, setEventFilter] = useState<"all" | "sports" | "cultural">(
    "all",
  );

  // AI Chat Bot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your e-Vidyalaya AI Assistant. How can I help you with notes, Zoom links, or courses today?",
    },
  ]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser({
          name: "Rahul Sharma",
          role: "student",
          gradeLevel: "Class 10",
          avatarUrl: null,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab as string);
    }
  }, [router.query.tab]);

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/student?tab=${tab}`, undefined, { shallow: true });
  };

  const goToProfile = () => {
    router.push(`/dashboard/profile?fromTab=${activeTab}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      let botReply =
        "I am processing your query. Please check your dashboard tabs!";
      const lower = userMsg.toLowerCase();

      if (lower.includes("zoom") || lower.includes("class")) {
        botReply =
          "Your live class timetable and Zoom links are in the Academics tab!";
      } else if (lower.includes("course")) {
        botReply =
          "You can view enrolled & available catalog courses under the Courses tab.";
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 500);
  };

  const subjectProgress: ProgressMetric[] = [
    {
      subject: "Data Structures",
      percentage: 85,
      grade: "A",
      color: "#3B82F6",
    },
    { subject: "DBMS & SQL", percentage: 92, grade: "A+", color: "#10B981" },
    {
      subject: "Web Development",
      percentage: 78,
      grade: "B+",
      color: "#F59E0B",
    },
    {
      subject: "Operating Systems",
      percentage: 64,
      grade: "B",
      color: "#EF4444",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-bold text-[#0F1E3D] animate-pulse">
        Loading Student Workspace...
      </div>
    );
  }

  const initials = user?.name
    ? user.name
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
      <div className="space-y-6 relative">
        {/* BANNER WITH PROFILE AVATAR */}
        <div className="bg-gradient-to-r from-[#0F1E3D] via-[#16294C] to-[#0F1E3D] text-white p-6 px-8 rounded-2xl flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
          <div className="flex items-center gap-4">
            <div
              className="relative group cursor-pointer"
              onClick={goToProfile}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#B8842E] shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-[#B8842E] bg-[#16294C] text-[#E7DCC4] font-black flex items-center justify-center text-xl shadow-md">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0F1E3D] rounded-full"></span>
            </div>

            <div>
              <h1 className="font-serif font-bold text-2xl text-[#E7DCC4]">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Class:{" "}
                <span className="font-semibold text-[#B8842E]">
                  {user?.gradeLevel || "Class 10"}
                </span>{" "}
                · Central Server Connected
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={goToProfile}
            className="bg-[#B8842E] hover:bg-[#a07226] text-white text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>Edit Profile</span>
            <span>👤</span>
          </button>
        </div>

        {/* 1. OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-lg font-serif font-bold text-[#0F1E3D]">
              Subject Mastery & Progress Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjectProgress.map((item) => {
                const strokeDashoffset = 283 - (283 * item.percentage) / 100;
                return (
                  <div
                    key={item.subject}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition"
                  >
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#E2E8F0"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke={item.color}
                          strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-800">
                          {item.percentage}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Grade {item.grade}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 mt-4">
                      {item.subject}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. ACADEMICS (TIMETABLE & ZOOM LINKS) */}
        {activeTab === "academics" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                📚 Academic Live Timetable & Virtual Classrooms
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Access your schedule and join live lectures directly through
                Zoom meeting links.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  code: "MATH-10",
                  title: "10th Standard Mathematics",
                  time: "09:00 AM – 10:00 AM (Mon & Wed)",
                  faculty: "Prof. R. Sharma",
                  zoomUrl: "https://zoom.us/j/1234567890",
                  status: "Live Now",
                },
                {
                  code: "SCI-10",
                  title: "Physical Science & Physics Lab",
                  time: "10:30 AM – 11:30 AM (Tue & Thu)",
                  faculty: "Dr. K. Varma",
                  zoomUrl: "https://zoom.us/j/0987654321",
                  status: "Upcoming",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border">
                      {item.code}
                    </span>
                    <h4 className="font-bold text-base text-[#0F1E3D] mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      ⏰ {item.time} · Faculty: {item.faculty}
                    </p>
                  </div>
                  <a
                    href={item.zoomUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#0F1E3D] hover:bg-[#16294C] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-2"
                  >
                    <span>Join Zoom Room</span>
                    <span>🎥</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. COURSES (ENROLLED & CATALOG) */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                📖 My Enrolled Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "10th Standard Mathematics",
                    faculty: "Prof. R. Sharma",
                    progress: 75,
                  },
                  {
                    title: "Physical Science & Physics",
                    faculty: "Dr. K. Varma",
                    progress: 60,
                  },
                ].map((course, idx) => (
                  <div
                    key={idx}
                    className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3"
                  >
                    <h4 className="font-bold text-base text-[#0F1E3D]">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Faculty: {course.faculty}
                    </p>
                    <button className="w-full bg-[#0F1E3D] text-white py-2 rounded-xl text-xs font-bold">
                      Enter Classroom →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                🌐 Available Course Catalog
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    code: "CS-101",
                    title: "Computer Applications & C++ Coding",
                    dept: "Computer Science Dept",
                  },
                  {
                    code: "ENV-201",
                    title: "Environmental Science & Sustainability",
                    dept: "Science Dept",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 border border-slate-200 rounded-2xl bg-white flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <h4 className="font-bold text-sm text-[#0F1E3D] mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500">{item.dept}</p>
                    </div>
                    <button className="bg-[#B8842E] text-white text-xs font-bold px-3 py-2 rounded-xl">
                      Enroll Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. CERTIFICATION COURSES */}
        {activeTab === "certifications" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🎓 Skill Certification Courses
            </h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              AWS & Full-Stack Web Development certification tracks open for
              enrollment.
            </div>
          </div>
        )}

        {/* 5. DIGITAL LIBRARY */}
        {activeTab === "elibrary" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              📂 Faculty Digital Resource Library
            </h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
              Lecture PDFs, Word Docs, and PPT Slide decks are available for
              download.
            </div>
          </div>
        )}

        {/* 6. SPORTS & EVENTS */}
        {activeTab === "events" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
              🏆 Sports & Cultural Campus Events
            </h2>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs">
              Cricket Tournament & Sanskriti Cultural Fest registration is
              active.
            </div>
          </div>
        )}
      </div>

      {/* FLOATING AI ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-[#0F1E3D] text-amber-300 font-bold p-4 rounded-full shadow-2xl hover:scale-105 transition flex items-center gap-2 border-2 border-[#B8842E]"
          >
            <span>🤖 Ask EV-Bot AI</span>
          </button>
        ) : (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[400px]">
            <div className="bg-[#0F1E3D] text-white p-4 flex justify-between">
              <span className="font-bold text-xs">EV-Bot Campus AI</span>
              <button onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl ${m.sender === "user" ? "bg-[#0F1E3D] text-white text-right" : "bg-slate-100 text-slate-800"}`}
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
                placeholder="Type message..."
                className="flex-1 text-xs border p-2 rounded-lg"
              />
              <button className="bg-[#B8842E] text-white px-3 py-1 rounded-lg text-xs font-bold">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
