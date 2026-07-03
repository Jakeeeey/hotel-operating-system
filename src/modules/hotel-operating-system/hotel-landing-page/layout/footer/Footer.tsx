"use client";

import Link from "next/link";
import {
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Music2,
} from "lucide-react";

export function Footer() {
  const brandText = "Your Brand Name Here";
  const charCount = brandText.length || 5;

  // Dynamically calculate font-size using CSS clamp to guarantee edge-to-edge fit
  const fontSizeStyle = {
    fontSize: `clamp(24px, calc(145vw / ${charCount}), calc(1900px / ${charCount}))`
  };

  return (
    <footer className="w-full bg-[#000000] text-white pt-16 font-sans antialiased relative overflow-hidden select-none">
      {/* 1. Main Content Container - Kept safely within interactive z-index bounds */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
        {/* Top level link layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 gap-x-8 pb-14 border-b border-zinc-800/50">
          {/* Column 1 — Brand and Mission Description */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-[22px] h-[22px] text-white fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 2H6c-1.1 0-2 .9-2 2v4c0 2.2 1.8 4 4 4s4-1.8 4-4V4h4v4c0 2.2 1.8 4 4 4s4-1.8 4-4V4c0-1.1-.9-2-2-2zm-6 10c-2.2 0-4 1.8-4 4v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c0-2.2-1.8-4-4-4h-4zm2 8h-4v-4c0-1.1.9-2 2-2s2 .9 2 2v4z" />
              </svg>
              <span className="text-xl font-bold tracking-tight">Brand</span>
            </div>
            <p className="text-[13px] text-[#aaaaaa] leading-relaxed max-w-[280px]">
              Our mission is to equip modern explorers with cutting-edge,
              functional, and stylish bags that elevate every adventure.
            </p>
          </div>

          {/* Unified Links Row Layer */}
          <div className="col-span-full md:col-span-4 grid grid-cols-2 gap-x-8">
            {/* Sub-Column A — About Navigation Links */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                About
              </h3>
              <ul className="flex flex-col gap-2.5 text-[13px] text-[#aaaaaa]">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/career"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Career
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sub-Column B — Support Navigation Links */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Support
              </h3>
              <ul className="flex flex-col gap-2.5 text-[13px] text-[#aaaaaa]">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Return
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors duration-200"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4 — Newsletter Updates Block */}
          <div className="md:col-span-3 flex flex-col gap-4 w-full">
            <h3 className="text-md sm:text-sm font-semibold text-white tracking-wide w-full">
              Get Updates
            </h3>

            <div className="flex items-center bg-[#222222] border border-[#2b2b2b] rounded-lg p-1 focus-within:border-zinc-700 transition-colors duration-200 w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent text-white text-[13px] pl-3 pr-2 py-2 flex-1 placeholder-[#666666] outline-none min-w-0"
              />
              <button className="bg-white text-black text-[13px] font-semibold rounded-md px-4 py-2 hover:bg-[#e5e5e5] transition-colors duration-200 shrink-0">
                Subscribe
              </button>
            </div>

            <div className="flex items-center justify-between w-full mt-1">
              {[
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Twitter, href: "https://x.com" },
                { icon: Facebook, href: "https://facebook.com" },
                { icon: MessageCircle, href: "https://discord.com" },
                { icon: Music2, href: "https://tiktok.com" },
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 sm:w-14 h-16 sm:h-14 rounded-full bg-[#222222] flex items-center justify-center text-white hover:bg-[#2c2c2c] transition-colors duration-200"
                  >
                    <Icon
                      strokeWidth={2}
                      className="w-8 h-8 sm:w-[24px] sm:h-[24px]"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Legal Row Area - Stays layout-aligned above the giant text overflow path */}
        <div className="pt-6 pb-4 flex flex-col gap-4 sm:flex-row justify-between items-center text-[13px] text-[#666666] relative z-20">
          <span className="text-center sm:text-left">
            Realest©2025 . All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-zinc-400 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-zinc-400 transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Giant Footer Brand Text Watermark */}
      <div className="w-full max-w-[1400px] mx-auto flex justify-center pointer-events-none select-none overflow-hidden">
        <h1
          style={fontSizeStyle}
          className="font-bold leading-[1.3] bg-linear-to-b from-[#222222] to-[#111111] bg-clip-text text-transparent w-full text-center whitespace-nowrap"
        >
          {brandText}
        </h1>
      </div>
    </footer>
  );
}
