import React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
      <h2 className="font-serif text-2xl font-bold text-[#0F1E3D] mb-1">
        {title}
      </h2>
      <p className="text-xs text-slate-500 mb-6">{subtitle}</p>
      {children}
    </div>
  );
};
