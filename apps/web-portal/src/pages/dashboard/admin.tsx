import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

interface PendingFaculty {
  id: number;
  name: string;
  email: string;
  phone: string;
  requestedAt: string;
}

interface TenantConfig {
  schoolName: string;
  domain: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "analytics" | "users" | "tenants" | "logs"
  >("analytics");

  // Multi-Tenant White-Label Configuration State (FR-ADM-03)
  const [tenant, setTenant] = useState<TenantConfig>({
    schoolName: "e-Vidyalaya Central Campus",
    domain: "campus.evidyalaya.com",
    logoUrl: "",
    primaryColor: "#0F1E3D",
    secondaryColor: "#B8842E",
  });

  // Pending Faculty Approvals State (FR-ADM-02)
  const [pendingFaculty, setPendingFaculty] = useState<PendingFaculty[]>([
    {
      id: 101,
      name: "Dr. K. Varma",
      email: "varma@evidyalaya.com",
      phone: "+91 98765 43210",
      requestedAt: "Jul 22, 2026",
    },
    {
      id: 102,
      name: "Prof. S. Rao",
      email: "srao@evidyalaya.com",
      phone: "+91 91234 56789",
      requestedAt: "Jul 23, 2026",
    },
  ]);

  // Handle Faculty Approval / Rejection
  const handleApproveFaculty = (id: number, approved: boolean) => {
    setPendingFaculty((prev) => prev.filter((f) => f.id !== id));
    alert(
      approved
        ? "✅ Faculty account approved successfully!"
        : "❌ Faculty application rejected.",
    );
  };

  // Save White-Label Tenant Settings
  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `🎨 White-Label Branding Updated!\nCampus: ${tenant.schoolName}\nColors applied: ${tenant.primaryColor} / ${tenant.secondaryColor}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-[#1E293B] flex flex-col">
      <Head>
        <title>Admin Dashboard — e-Vidyalaya</title>
      </Head>

      {/* TOP HEADER */}
      <header className="bg-[#0F1E3D] text-white px-6 py-3.5 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#B8842E] bg-[#16294C] flex items-center justify-center font-bold text-[#E7DCC4] text-xs">
            eV
          </div>
          <div>
            <h1 className="font-serif font-bold text-base leading-none">
              e-Vidyalaya
            </h1>
            <span className="text-[10px] text-amber-200/80">
              Global System Administration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs bg-rose-600/30 border border-rose-400/30 text-rose-300 px-3 py-1 rounded-full font-bold">
            🛡️ Super Administrator
          </span>
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
        </div>
      </header>

      {/* MAIN BODY LAYOUT */}
      <div className="flex-1 flex min-h-[calc(100vh-57px)]">
        {/* LEFT NAVIGATION MENU */}
        <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col p-4 sticky top-[57px] h-[calc(100vh-57px)] z-30">
          <div className="space-y-1">
            {[
              {
                id: "analytics",
                label: "📊 System Analytics & Audits",
                icon: "📈",
              },
              { id: "users", label: "👥 User & Role Management", icon: "🛡️" },
              { id: "tenants", label: "🎨 White-Label Branding", icon: "🌐" },
              { id: "logs", label: "📜 System Audit Logs", icon: "🔍" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#0F1E3D] text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0F1E3D]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-[#0F1E3D]">Tenant Mode</span>
            <p className="text-slate-600 font-semibold">{tenant.schoolName}</p>
            <p className="text-[10px] text-slate-400">{tenant.domain}</p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
          {/* TAB 1: SYSTEM ANALYTICS & AUDITS (FR-ADM-04) */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                Platform Health & Concurrency Analytics (FR-ADM-04)
              </h2>

              {/* Real-Time Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Active Registered Students",
                    value: "542",
                    color: "border-blue-500",
                    note: "Baseline Target: 500",
                  },
                  {
                    label: "Active Faculty Members",
                    value: "28",
                    color: "border-emerald-500",
                    note: "Baseline Target: 50",
                  },
                  {
                    label: "Live Class Concurrency",
                    value: "12 Rooms",
                    color: "border-amber-500",
                    note: "Max daily cap: 200 classes",
                  },
                  {
                    label: "Total Platform Revenue",
                    value: "₹1,42,500",
                    color: "border-purple-500",
                    note: "Verified via PCI-DSS Gateway",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={`bg-white p-6 rounded-2xl border-l-4 ${stat.color} border-slate-200/80 shadow-sm space-y-1`}
                  >
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {stat.label}
                    </span>
                    <p className="text-2xl font-black text-slate-800">
                      {stat.value}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1">
                      {stat.note}
                    </span>
                  </div>
                ))}
              </div>

              {/* System Infrastructure Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-[#0F1E3D]">
                  ⚙️ Streaming & Server Latency Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800">
                        Live Video Stream Latency
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        WebRTC / Low-Latency HLS Target (&lt; 2.0s)
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      1.4s (Optimal)
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800">
                        On-Demand Adaptive Bitrate (CDN)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Encrypted resolution streaming (1080p to 360p)
                      </p>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      Active (100%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER & ROLE MANAGEMENT (FR-ADM-02) */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* PENDING FACULTY APPROVALS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                      🛡️ Pending Faculty Onboarding Approvals (FR-ADM-02)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review and approve educator registration requests before
                      granting course publishing privileges.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                    {pendingFaculty.length} Pending
                  </span>
                </div>

                {pendingFaculty.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                    🎉 No pending faculty approval requests. All educator
                    accounts are verified!
                  </div>
                ) : (
                  <div className="divide-y border rounded-2xl overflow-hidden">
                    {pendingFaculty.map((f) => (
                      <div
                        key={f.id}
                        className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white hover:bg-slate-50 transition"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">
                            {f.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {f.email} • {f.phone} • Requested:{" "}
                            <strong>{f.requestedAt}</strong>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveFaculty(f.id, true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                          >
                            Approve Faculty ✅
                          </button>
                          <button
                            onClick={() => handleApproveFaculty(f.id, false)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            Reject ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WHITE-LABEL & MULTI-TENANT BRANDING (FR-ADM-03) */}
          {activeTab === "tenants" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                  🎨 Multi-Tenant White-Label Configuration (FR-ADM-03)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize school branding including custom domain bindings,
                  logos, and primary/secondary color palettes.
                </p>
              </div>

              <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      School / Institution Name
                    </label>
                    <input
                      type="text"
                      value={tenant.schoolName}
                      onChange={(e) =>
                        setTenant({ ...tenant, schoolName: e.target.value })
                      }
                      required
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Bound Custom Domain / Subdomain
                    </label>
                    <input
                      type="text"
                      value={tenant.domain}
                      onChange={(e) =>
                        setTenant({ ...tenant, domain: e.target.value })
                      }
                      required
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Primary Theme Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={tenant.primaryColor}
                        onChange={(e) =>
                          setTenant({ ...tenant, primaryColor: e.target.value })
                        }
                        className="w-10 h-10 border rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={tenant.primaryColor}
                        onChange={(e) =>
                          setTenant({ ...tenant, primaryColor: e.target.value })
                        }
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Secondary Theme Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={tenant.secondaryColor}
                        onChange={(e) =>
                          setTenant({
                            ...tenant,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-10 h-10 border rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={tenant.secondaryColor}
                        onChange={(e) =>
                          setTenant({
                            ...tenant,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#0F1E3D] hover:bg-[#16294C] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-md"
                >
                  Save White-Label Branding 💾
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SYSTEM AUDIT LOGS */}
          {activeTab === "logs" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#0F1E3D]">
                📜 System Performance & Audit Logs
              </h2>

              <div className="font-mono text-xs bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2 h-64 overflow-y-auto">
                <p className="text-emerald-400">
                  [2026-07-23 16:40:12] [SYSTEM] Tenant 'default-campus'
                  initialized with RLS isolation.
                </p>
                <p className="text-blue-400">
                  [2026-07-23 16:35:00] [AUTH] OAuth 2.0 Token issued for user
                  ID #1042.
                </p>
                <p className="text-amber-400">
                  [2026-07-23 16:10:00] [LIVE] Concurrency peak: 12 active video
                  streaming rooms.
                </p>
                <p className="text-emerald-400">
                  [2026-07-23 15:45:22] [PAYMENT] Transaction ID #PAY-9921
                  tokenized via PCI-DSS Gateway.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
