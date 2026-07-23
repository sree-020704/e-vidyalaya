import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function StudentProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    admissionNo: "",
    dob: "",
    gender: "Male",
    gradeLevel: "Class 10",
    parentName: "",
    parentPhone: "",
    address: "",
    avatarUrl: "", // Will hold the Base64 Image String
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setFormData({
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          admissionNo: parsed.admissionNo || "EV-2026-1042",
          dob: parsed.dob || "2010-05-15",
          gender: parsed.gender || "Male",
          gradeLevel: parsed.gradeLevel || "Class 10",
          parentName: parsed.parentName || "",
          parentPhone: parsed.parentPhone || "",
          address: parsed.address || "",
          avatarUrl: parsed.avatarUrl || "",
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
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

  // Image Upload Handler (Converts JPG/PNG to Base64 to save locally)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            avatarUrl: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert("⚠️ Please upload a valid JPG or PNG image file.");
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const existingUser = localStorage.getItem("user");
      const currentUser = existingUser ? JSON.parse(existingUser) : {};
      const updatedUser = { ...currentUser, ...formData };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
      }, 500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaving(false);
    }
  };

  const backTab = router.query.fromTab || "overview";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-bold text-[#0F1E3D] animate-pulse">
        Loading Student Profile...
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
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-[#1E293B] p-4 md:p-8">
      <Head>
        <title>Student Profile — e-Vidyalaya</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/dashboard/student?tab=${backTab}`)}
            className="text-xs font-bold text-[#0F1E3D] hover:text-[#B8842E] transition flex items-center gap-2 cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Student ID Settings
          </span>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex justify-between items-center animate-in fade-in">
            <span>✅ Profile details updated successfully!</span>
            <button
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-900"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Avatar & Personal Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D] border-b pb-3">
              👤 Personal Details & Identification
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
              {/* Profile Avatar Preview */}
              <div className="relative">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#B8842E] shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-[#B8842E] bg-[#0F1E3D] text-[#E7DCC4] font-black flex items-center justify-center text-2xl shadow-md">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-left">
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
              {/* Full Name */}
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
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
                />
              </div>

              {/* Admission Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleChange}
                  placeholder="e.g. EV-2026-1042"
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50 font-mono font-bold"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth (DOB)
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50 font-medium cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Grade / Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Grade / Standard
                </label>
                <input
                  type="text"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
                />
              </div>

              {/* Profile Image File Upload (JPG/PNG) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Profile Picture (JPG/PNG)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageUpload}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0F1E3D] bg-slate-50/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#0F1E3D] file:text-white hover:file:bg-[#16294C] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Parent Information */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-[#0F1E3D] border-b pb-3">
              📞 Contact & Parent Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Mobile Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
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
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent Contact Number
                </label>
                <input
                  type="text"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0F1E3D] bg-slate-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State, Pincode"
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-[#0F1E3D] bg-slate-50/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/student?tab=${backTab}`)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0F1E3D] hover:bg-[#16294C] active:scale-95 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-md flex items-center gap-2"
            >
              {saving ? "Saving Changes..." : "Save Profile Details 💾"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
