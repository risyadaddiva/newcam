"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Username atau password salah");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-espresso p-4">
      <div className="w-full max-w-sm">
        <div className="bg-espresso-light border border-gold/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold/30">
                <Image
                  src="/menu/logo newcam.jpeg"
                  alt="Coffee New Cammary"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-cream">
              Coffee New Cammary
            </h1>
            <p className="text-gold/50 text-xs font-body mt-1 uppercase tracking-widest">
              Point of Sales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-cream/70 text-xs font-body font-bold uppercase tracking-widest mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="input-coffee"
                required
              />
            </div>
            <div>
              <label className="block text-cream/70 text-xs font-body font-bold uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="input-coffee"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center font-body">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full text-base"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
