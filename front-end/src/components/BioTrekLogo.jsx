import React from "react";
import logo from "../assets/logo.png";

export default function BioTrekLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo Image */}
      <img 
        src={logo} 
        alt="BioTrek Logo" 
        className="w-24 h-24 object-contain"
      />

      {/* Text */}
      <h2 className="text-2xl font-bold tracking-wide">
        <span className="text-blue-400">Bio</span>
        <span className="text-white">Trek</span>
      </h2>
    </div>
  );
}
