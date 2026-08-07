'use client';

import React from "react";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import Link from "next/link";
import { Building2, ShieldCheck, Truck, Percent } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50">

      {/* Left panel - Brand and B2B Value Highlights (visible on desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0D0F12] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/miniLogo.png" alt="logo" className="h-10 w-10 brightness-0 invert" />
            <span className="font-bold text-xl tracking-tighter">Mobiking B2B</span>
          </Link>

          <div className="mt-16 max-w-sm">
            <h2 className="text-3xl font-bold tracking-tighter leading-tight">
              Create Your Free B2B Sourcing Account
            </h2>
            <p className="text-slate-400 mt-4 text-sm font-medium leading-relaxed">
              Get immediate access to verified factories, high-volume tier pricing, and direct shipping logistics.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-sm">
          {[
            {
              icon: <Percent className="text-emerald-400" size={20} />,
              title: "Wholesale Tier Discounts",
              desc: "Higher quantity orders automatically qualify for lower slab prices."
            },
            {
              icon: <ShieldCheck className="text-sky-400" size={20} />,
              title: "Verified Manufacturer Catalogs",
              desc: "Browse authentic products sourced straight from top tier factories."
            },
            {
              icon: <Truck className="text-amber-400" size={20} />,
              title: "Fulfillment Support",
              desc: "Hassle-free shipping, packaging, and custom brand box labeling support."
            }
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">{title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs text-slate-500 font-semibold">
            © {new Date().getFullYear()} Mobiking Wholesale. All rights reserved.
          </p>
        </div>

      </div>

      {/* Right panel - Form (centered) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-2">
              <img src="/miniLogo.png" alt="logo" className="h-10 w-10" />
              <span className="font-bold text-xl tracking-tighter text-slate-800">Mobiking B2B</span>
            </Link>
            <p className="text-xs text-slate-500 font-semibold">
              India's Premier Electronics Sourcing Hub
            </p>
          </div>

          <PhoneOtpForm type="register" />
        </div>
      </div>

    </div>
  );
}
