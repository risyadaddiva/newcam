"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/pos", label: "Kasir", icon: "☕" },
  { href: "/inventory", label: "Inventori", icon: "📦" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-espresso border-r border-gold/10 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gold/10">
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
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}
