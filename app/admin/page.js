"use client";

import { useState, useEffect } from "react";

export default function AdminActivationPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const timestamp = new Date().getTime();
      fetch(`/api/status?t=${timestamp}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => setIsActive(data.isActive));
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "eskopidua") {
      setIsAuthenticated(true);
      setStatus(null);
    } else {
      setStatus("error");
    }
  };

  const toggleStatus = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newStatus = !isActive;
    
    // Update UI immediately (optimistic UI)
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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-sm p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Status Toko</h1>
          <p className="text-zinc-400 text-sm mb-12">
            {isActive ? "Halaman utama AKTIF dan bisa diakses." : "Halaman utama BERHENTI (Kurir istirahat)."}
          </p>

          <div 
            onClick={toggleStatus}
            className={`mx-auto w-36 h-16 flex items-center rounded-full p-2 cursor-pointer transition-colors duration-500 ${
              isActive ? "bg-green-500" : "bg-red-500"
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div 
              className={`bg-white w-12 h-12 rounded-full shadow-lg transform transition-transform duration-500 flex items-center justify-center ${
                isActive ? "translate-x-20" : "translate-x-0"
              }`}
            >
              <span className={`text-xs font-bold ${isActive ? "text-green-500" : "text-red-500"}`}>
                {isActive ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Panel Admin</h1>
          <p className="text-zinc-400 text-sm">Hanya akses terbatas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setStatus(null); // reset status saat mengetik ulang
              }}
              className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Masukkan password"
              required
            />
            {status === "error" && (
              <p className="text-red-500 text-sm mt-2 font-medium">Password salah!</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-900/50 transform active:scale-[0.98]"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
