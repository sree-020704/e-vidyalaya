import React from "react";
import Link from "next/link";

interface HeaderProps {
  user: { name: string; role: string } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="h-16 bg-[#0F1E3D] text-white px-8 flex items-center justify-between border-b border-[#16294C]">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-[#B8842E] bg-[#0F1E3D] text-[#E7DCC4] flex items-center justify-center font-serif font-bold text-sm">
          eV
        </div>
        <span className="font-serif font-bold text-lg tracking-wide">
          e-Vidyalaya
        </span>
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-300">
            {user.name}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase bg-[#B8842E] text-white px-2.5 py-1 rounded">
            {user.role}
          </span>
          <button
            onClick={onLogout}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-300">Workspace Gateway</div>
      )}
    </header>
  );
};
