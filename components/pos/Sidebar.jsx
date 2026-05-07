"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/pos", label: "Kasir", icon: "☕" },
  { href: "/inventory", label: "Inventori", icon: "📦" },
  { href: "/internal", label: "Internal", icon: "📋" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timestamp = new Date().getTime();
    fetch(`/api/status?t=${timestamp}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setIsActive(data.isActive))
      .catch(() => {});
  }, []);

  const toggleStatus = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newStatus = !isActive;
    
    // Optimistic UI update
    setIsActive(newStatus);

    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (error) {
      // Revert if failed
      setIsActive(!newStatus);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-espresso border-r border-gold/10 flex flex-col h-full transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-gold/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/30">
              <Image
                src="/menu/logo newcam.jpeg"
                alt="Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-cream">
                New Cammary
              </h1>
              <p className="text-[10px] text-gold/60 font-body uppercase tracking-widest">
                Point of Sales
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-cream/50 hover:text-cream">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose && onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body font-medium transition-all ${
                  active
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-cream/50 hover:bg-espresso-light hover:text-cream/80"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status Toko Toggle */}
        <div className="p-4 border-t border-gold/10 flex flex-col gap-2">
          <div className="text-xs font-body uppercase tracking-widest text-cream/50 text-center mb-1">
            Status Toko
          </div>
          <div 
            onClick={toggleStatus}
            className={`mx-auto w-full h-12 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-500 ${
              isActive ? "bg-green-600/80 hover:bg-green-500" : "bg-red-600/80 hover:bg-red-500"
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div 
              className={`bg-white w-10 h-10 rounded-full shadow-lg transform transition-transform duration-500 flex items-center justify-center ${
                isActive ? "translate-x-[176px]" : "translate-x-0"
              }`}
            >
              <span className={`text-[10px] font-bold ${isActive ? "text-green-600" : "text-red-600"}`}>
                {isActive ? "ON" : "OFF"}
              </span>
            </div>
            <span className={`absolute w-full text-center text-xs font-bold pointer-events-none text-white ${isActive ? "pr-10" : "pl-10"}`}>
              {isActive ? "BUKA" : "TUTUP"}
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-gold/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-body font-medium text-cream/40 hover:bg-espresso-light hover:text-red-400 transition-all cursor-pointer"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
