import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F1E3D] text-slate-400 py-6 px-8 border-t border-[#16294C] text-xs flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border border-[#B8842E] text-[#E7DCC4] font-serif font-bold text-[10px] flex items-center justify-center">
          eV
        </div>
        <span className="font-semibold text-slate-300">
          e-Vidyalaya Platform Engine
        </span>
      </div>
      <div>
        © 2026 e-Vidyalaya. All core data structures isolated under multi-tenant
        policies.
      </div>
    </footer>
  );
};
