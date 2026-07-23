import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

interface DashboardLayoutProps {
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  title,
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Complete Navigation Items List
  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "academics", label: "Academics", icon: "📚" },
    { id: "courses", label: "Courses", icon: "📖" },
    { id: "certifications", label: "Certification Courses", icon: "🎓" },
    { id: "elibrary", label: "Digital Library", icon: "📂" },
    { id: "events", label: "Sports & Events", icon: "🏆" },
    { id: "assignments", label: "Assignments & Marks", icon: "📝" },
    { id: "workshops", label: "Workshops", icon: "🛠️" },
    { id: "timetable", label: "Timetable", icon: "📅" },
    { id: "attendance", label: "Attendance", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-[#1E293B] flex flex-col">
      <Head>
        <title>{title} — e-Vidyalaya</title>
      </Head>

      {/* Top Bar */}
      <header className="bg-[#0F1E3D] text-white px-6 py-3.5 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-amber-300 p-1 rounded transition cursor-pointer text-lg"
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <div className="w-8 h-8 rounded-full border-2 border-[#B8842E] bg-[#16294C] flex items-center justify-center font-bold text-[#E7DCC4] text-xs">
            eV
          </div>
          <div>
            <h1 className="font-serif font-bold text-base leading-none">
              e-Vidyalaya
            </h1>
            <span className="text-[10px] text-amber-200/80">
              Student Portal
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/");
          }}
          className="text-xs font-bold bg-[#B8842E] hover:bg-[#a07226] text-white px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-sm"
        >
          Logout
        </button>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex min-h-[calc(100vh-57px)]">
        {/* LEFT SIDEBAR */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col p-4 sticky top-[57px] h-[calc(100vh-57px)] z-30`}
        >
          <div className="space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0F1E3D] text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0F1E3D]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
