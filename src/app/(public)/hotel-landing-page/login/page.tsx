"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/hotel-landing-page/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/hotel-landing-page/home");
      router.refresh(); // Refresh to update navbar state if needed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 py-10 lg:px-20 xl:px-32">
        {/* Back Button */}
        <Link 
          href="/hotel-landing-page/home" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors mb-12 lg:mb-20 self-start"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2 tracking-tight">Holla,</h1>
            <h2 className="text-4xl font-bold text-neutral-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-neutral-500 text-sm">Hey, welcome back to your special place</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                placeholder="stanley@gmail.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                placeholder="••••••••••••••••"
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-colors border ${
                    rememberMe ? "bg-[#8B5CF6] border-[#8B5CF6]" : "bg-white border-neutral-300 group-hover:border-[#8B5CF6]"
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-neutral-500 select-none">Remember me</span>
              </label>
              
              <Link href="#" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-32 bg-[#8B5CF6] text-white py-3.5 rounded-xl text-sm font-medium shadow-md shadow-[#8B5CF6]/20 hover:bg-[#7C3AED] hover:shadow-lg hover:shadow-[#8B5CF6]/30 transition-all disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-16 text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link href="/hotel-landing-page/signup" className="text-[#8B5CF6] font-semibold hover:text-[#7C3AED] transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="hidden lg:block w-1/2 relative bg-neutral-100">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000"
          alt="Hotel Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Optional Overlay to give it a slightly premium vibe */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}
