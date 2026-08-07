"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { getCategories } from "@/lib/services/operations/HomeApi";
import { quickLinks } from "@/data/footerLinks";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        const active = (data || []).filter(c => c && c.active === true);
        setCategories(active);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="w-full bg-[#0D0F12] border-t border-slate-900 pt-16 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-[1400px] mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Company Info */}
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Mobiking B2B"
                  className="h-10 w-10 object-contain"
                />
                <span className="font-bold text-xl text-white tracking-tighter">Mobiking B2B</span>
              </div>
            </Link>
            <p className="text-slate-400 text-[15px] leading-relaxed font-medium">
              India's premier B2B bulk sourcing hub for premium electronics and mobile accessories. Sourcing directly from manufacturers to protect retail margins.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center text-slate-400 hover:text-white transition-colors text-[15px] font-medium">
                <Mail className="h-4 w-4 mr-3 text-slate-500 shrink-0" />
                <span>wholesale@mobikingb2b.com</span>
              </div>
              <div className="flex items-center text-slate-400 hover:text-white transition-colors text-[15px] font-medium">
                <Phone className="h-4 w-4 mr-3 text-slate-500 shrink-0" />
                <span>+91 84482 72134</span>
              </div>
              <div className="flex items-start text-slate-400 hover:text-white transition-colors text-[15px] font-medium">
                <MapPin className="h-4 w-4 mr-3 mt-0.5 text-slate-500 shrink-0" />
                <span>91-B, Opp. Iskcon Temple, East of Kailash, New Delhi, 110065</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-5">
            <h3 className="font-bold text-base text-white tracking-tight">
              Corporate Desk
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-slate-400 hover:text-white text-[15px] font-medium transition-colors flex items-center gap-1.5"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Sourcing Categories */}
          <div className="space-y-5">
            <h3 className="font-bold text-base text-white tracking-tight">
              Bulk Categories
            </h3>
            <ul className="space-y-3">
              {loading ? (
                <li className="flex justify-start">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                </li>
              ) : (
                categories.slice(0, 6).map((category, index) => (
                  <li key={index}>
                    <Link
                      href={
                        category.subCategories?.[0]?.slug
                          ? `/cs/${category.subCategories[0].slug}`
                          : `/categories`
                      }
                      className="text-slate-400 hover:text-white text-[15px] font-medium transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
              <li className="pt-2">
                <Link
                  href="/categories"
                  className="text-[15px] font-bold text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Explore All Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: App Downloads */}
          <div className="space-y-5">
            <h3 className="font-bold text-base text-white tracking-tight">
              Download Merchant App
            </h3>
            <p className="text-slate-400 text-[15px] leading-relaxed font-medium">
              Access real-time inventory updates, live price drops, and order dispatch tracking on the go.
            </p>

            <div className="flex flex-col gap-3 pt-1">
              <a
                href="#"
                className="inline-block transition-all hover:opacity-90 max-w-[150px]"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="w-full h-auto object-contain"
                />
              </a>

              <a
                href="#"
                className="inline-block transition-all hover:opacity-90 max-w-[150px]"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  className="w-full h-auto object-contain"
                />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Extra Dark Copyright Bar */}
      <div className="w-full bg-[#060709] border-t border-slate-900/60 py-8 relative z-10 text-center">
        <div className="container mx-auto px-4 max-w-[1400px] flex flex-col items-center gap-4">
          {/* Let's Connect Heading */}
          <h4 className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            Let's Connect
          </h4>

          {/* Social Links */}
          <div className="flex justify-center space-x-3.5">
            <a
              href="#"
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition-all text-slate-400 hover:text-white"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/mobikingwholesale/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition-all text-slate-400 hover:text-white"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition-all text-slate-400 hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition-all text-slate-400 hover:text-white"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-slate-500 text-[14px] font-medium mt-2">
            © {new Date().getFullYear()} Mobiking B2B. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}