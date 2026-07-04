"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    id_number: "",
    id_photo_uuid: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/hotel-landing-page/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/hotel-landing-page/home");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 py-10 lg:px-20 xl:px-24">
        {/* Back Button */}
        <Link 
          href="/hotel-landing-page/home" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors mb-8 lg:mb-12 self-start"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 tracking-tight">Create an</h1>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">Account</h2>
            <p className="text-neutral-500 text-sm">Join us to experience exclusive perks and faster bookings.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                  placeholder="First Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                placeholder="Email Address"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact_number"
                required
                value={formData.contact_number}
                onChange={handleChange}
                className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                placeholder="Contact Number (+1 234 567 8900)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Valid ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id_number"
                required
                value={formData.id_number}
                onChange={handleChange}
                className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                placeholder="Valid ID Number (Passport / License)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="px-5 py-3.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                placeholder="Password (••••••••)"
              />
            </div>

            {/* Valid ID Upload UI would go here */}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-32 bg-[#8B5CF6] text-white py-3.5 rounded-xl text-sm font-medium shadow-md shadow-[#8B5CF6]/20 hover:bg-[#7C3AED] hover:shadow-lg hover:shadow-[#8B5CF6]/30 transition-all disabled:opacity-70"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/hotel-landing-page/login" className="text-[#8B5CF6] font-semibold hover:text-[#7C3AED] transition-colors">
              Sign In
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
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}
