"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, CalendarCheck, ArrowLeft } from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Account Settings",
      href: "/hotel-landing-page/account/settings",
      icon: User,
    },
    {
      name: "My Reservations",
      href: "/hotel-landing-page/account/history",
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 sticky top-28">
            <Link 
              href="/hotel-landing-page/home" 
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors px-4 mb-6"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h2 className="text-lg font-bold text-neutral-900 px-4 mb-4">My Account</h2>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium" 
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#8B5CF6]" : "text-neutral-400"} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
