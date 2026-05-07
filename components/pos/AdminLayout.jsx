"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-espresso">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-espresso-mid border-b border-gold/10 flex items-center px-4 z-40">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-cream hover:text-gold p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-4 font-display font-bold text-cream">Coffee New Cammary</span>
      </div>

      {/* Sidebar with mobile overlay */}
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full pt-20 md:pt-8 p-4 md:p-8 h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
