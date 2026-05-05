"use client";

import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-body font-medium animate-fade-in ${
        type === "success"
          ? "bg-green-900/90 text-green-100 border border-green-700/50"
          : "bg-red-900/90 text-red-100 border border-red-700/50"
      }`}
    >
      {message}
    </div>
  );
}
