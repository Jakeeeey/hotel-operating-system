"use client";

import { useState, useEffect } from "react";
import { Save, Lock } from "lucide-react";

export default function AccountSettingsPage() {
  const [profileData, setProfileData] = useState({
    email: "",
    id_number: "",
    id_photo_uuid: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    // Fetch initial user data from auth/me
    fetch("/api/hotel-landing-page/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfileData({
            email: data.user.email || "",
            id_number: data.user.id_number || "", // Assume we added this to session or fetch separately
            id_photo_uuid: data.user.id_photo_uuid || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/hotel-landing-page/user/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg({ type: "", text: "" });

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/hotel-landing-page/user/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading settings...</div>;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Profile Details Section */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Profile Details</h2>
          <p className="text-sm text-neutral-500 mt-1">Update your personal information and valid ID.</p>
        </div>

        {profileMsg.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm border ${
            profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5 max-w-xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700">Email Address</label>
            <input
              type="email"
              required
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700">Valid ID Number</label>
            <input
              type="text"
              required
              value={profileData.id_number}
              onChange={(e) => setProfileData({ ...profileData, id_number: e.target.value })}
              className="px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700">ID Photo UUID (Directus Reference)</label>
            <input
              type="text"
              value={profileData.id_photo_uuid}
              onChange={(e) => setProfileData({ ...profileData, id_photo_uuid: e.target.value })}
              className="px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all bg-neutral-50 text-neutral-500"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            />
            <p className="text-xs text-neutral-400 mt-1">For now, input the Directus File UUID manually.</p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-2 flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-70"
          >
            <Save size={16} />
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Security Section */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Security</h2>
          <p className="text-sm text-neutral-500 mt-1">Update your password to keep your account secure.</p>
        </div>

        {passwordMsg.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm border ${
            passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-5 max-w-xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              className="px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">New Password</label>
              <input
                type="password"
                required
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="mt-2 flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-70"
          >
            <Lock size={16} />
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

    </div>
  );
}
