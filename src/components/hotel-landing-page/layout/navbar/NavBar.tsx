"use client";

import { useState, useEffect } from "react";
import { Search, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname(); // Reads the active route location to handle focus styles

  // Replaced arbitrary Link placeholder strings with exact funnel path strings
  const navLinks = [
    { label: "Home", path: "/hotel-landing-page/home" },
    { label: "Rooms", path: "/hotel-landing-page/rooms" }, // Points straight to your full grid catalog
    { label: "Amenities", path: "/hotel-landing-page/amenities" },
    { label: "Offers", path: "/hotel-landing-page/offers" },
    { label: "Contact", path: "/hotel-landing-page/contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Outer structural context wrapper */}
      <nav
        className={`fixed left-0 right-0 z-50 flex justify-center items-center transition-all duration-300 top-0 px-0 ${
          isScrolled ? "lg:top-3 lg:px-6" : ""
        }`}
      >
        <div
          className={`w-full flex items-center justify-between h-[60px] px-4 sm:px-6 transition-all duration-300 ${
            isOpen 
              ? "bg-transparent lg:bg-white" 
              : "bg-white"
          } ${
            isScrolled
              ? "lg:max-w-[1200px] lg:bg-white/95 lg:backdrop-blur-md lg:rounded-full lg:shadow-none lg:border lg:border-neutral-200/80"
              : "max-w-full border-b border-transparent"
          }`}
        >
          {/* Left Side: Logo + Desktop Links */}
          <div className="flex items-center gap-7">
            {/* Logo Wrapper */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <svg
                className={`w-[22px] h-[22px] fill-current transition-colors duration-300 ${
                  isOpen ? "text-white lg:text-[#111111]" : "text-[#111111]"
                }`}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 2H6c-1.1 0-2 .9-2 2v4c0 2.2 1.8 4 4 4s4-1.8 4-4V4h4v4c0 2.2 1.8 4 4 4s4-1.8 4-4V4c0-1.1-.9-2-2-2zm-6 10c-2.2 0-4 1.8-4 4v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c0-2.2-1.8-4-4-4h-4zm2 8h-4v-4c0-1.1.9-2 2-2s2 .9 2 2v4z" />
              </svg>
              <span 
                className={`text-lg font-bold tracking-[-0.2px] transition-colors duration-300 ${
                  isOpen ? "text-white lg:text-[#111111]" : "text-[#111111]"
                }`}
              >
                Brand
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-[22px]">
              {navLinks.map((link) => {
                // Determine if link matches the current URL path string location exactly
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative text-base font-normal py-1 leading-none tracking-[0.1px] transition-colors duration-300 ${
                      isActive
                        ? "text-[#111111] font-medium after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#111111] after:content-['']"
                        : "text-neutral-600 hover:text-black"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side: Search, Language, Actions & Mobile Menu Button */}
          <div className="flex items-center gap-[18px]">
            {/* Search Bar */}
            <div className="hidden md:flex w-[260px] h-[44px]">
              <div className="relative w-full h-full">
                <input
                  type="text"
                  placeholder="Search rooms..."
                  className="w-full h-full rounded-full border bg-neutral-100 border-neutral-200 text-black placeholder:text-neutral-400 focus:bg-neutral-200/50 pl-12 pr-6 text-sm font-extralight outline-none transition-all duration-300"
                />
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-[18px]">
              <div className="flex items-center gap-1.5 cursor-pointer select-none">
                <Globe size={16} strokeWidth={1.8} className="text-neutral-700" />
                <span className="text-sm text-neutral-700">EN</span>
              </div>
              <button className="text-sm font-normal bg-transparent border-none cursor-pointer text-neutral-600 hover:text-black transition-colors">
                Log In
              </button>
              <button className="rounded-[8px] px-4 py-2 text-sm font-semibold cursor-pointer whitespace-nowrap bg-[#111111] text-white hover:bg-neutral-800 transition-colors">
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className={`lg:hidden p-2 rounded-full transition-all duration-300 cursor-pointer ${
                isOpen 
                  ? "text-white bg-white/15 hover:bg-white/25" 
                  : "text-[#111111] bg-neutral-100 hover:bg-neutral-200"
              }`}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out Mobile Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#111111]/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-[60px] px-6 pb-8 justify-between">
          <div className="flex flex-col gap-8 mt-6">
            <div className="relative w-full h-[48px] md:hidden">
              <input
                type="text"
                placeholder="Search rooms..."
                className="w-full h-full rounded-full bg-white/10 border border-white/15 pl-12 pr-6 text-sm text-white placeholder:text-white/55 outline-none"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/65" />
            </div>

            {/* Mobile Link Mapping */}
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)} // Safely drop down drawer layer upon routing click
                    className={`text-left text-xl font-medium py-1 transition-colors ${
                      isActive
                        ? "text-white border-l-2 border-white pl-3"
                        : "text-white/70 pl-1"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions Footer */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between px-1 text-white/70">
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <span className="text-base">Language</span>
              </div>
              <span className="text-base font-semibold text-white">EN</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full border border-white/20 text-white rounded-[10px] py-3 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-white text-[#111111] rounded-[10px] py-3 text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}