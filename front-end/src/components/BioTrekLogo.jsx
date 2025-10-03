import React from "react";

export default function BioTrekLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* DNA-style Icon */}
      <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 64 64"
  className="w-8 h-8 text-blue-400"
  fill="currentColor"
>
  {/* جسم الكوكب */}
  <circle cx="32" cy="32" r="14" />

  {/* الحلقة المدارية */}
  <path
    d="M8 28c10 8 38 8 48 0"
    stroke="currentColor"
    strokeWidth="4"
    fill="none"
  />
  <path
    d="M8 36c10 8 38 8 48 0"
    stroke="currentColor"
    strokeWidth="4"
    fill="none"
  />
</svg>


      {/* Text */}
      <h2 className="text-2xl font-bold tracking-wide">
        <span className="text-blue-400">Bio</span>
        <span className="text-white">Trek</span>
      </h2>
    </div>
  );
}
