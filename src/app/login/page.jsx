'use client';

import React from "react";
import PhoneOtpForm from "@/components/auth/PhoneOtpForm";
import Link from "next/link";
import Image from "next/image";
import { Building2, ShieldCheck, Truck, Percent } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50">

      {/* Left panel - Brand and B2B Value Highlights (visible on desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0D0F12] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-bg.jpg"
            alt="Gadgets and Audio Hub Background"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
          {/* Dark Overlay Layer */}
          <div className="absolute inset-0 bg-[#0D0F12]/80 backdrop-blur-[1px]" />
          {/* Background decorative pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/miniLogo.png" alt="logo" className="w-10 " />
            <span className="font-bold text-xl tracking-tighter">Mobiking B2B</span>
          </Link>

          <div className="mt-16 max-w-sm">
            <h2 className="text-3xl font-bold tracking-tighter leading-tight">
              India's Premier B2B Electronics Sourcing Hub
            </h2>
            <p className="text-slate-300 mt-4 text-sm font-medium leading-relaxed">
              We connect retail stores, local distributors, and e-commerce sellers directly with top-tier manufacturers.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-sm relative z-10">
          {[
            {
              icon: <Percent className="text-emerald-400" size={20} />,
              title: "Factory-Direct Margins",
              desc: "Eliminate middlemen and secure high margin procurement options."
            },
            {
              icon: <ShieldCheck className="text-sky-400" size={20} />,
              title: "QC Inspection Facility",
              desc: "Every batch is inspected at our hub ensuring defect ratios under 0.5%."
            },
            {
              icon: <Truck className="text-amber-400" size={20} />,
              title: "Assured Logistics",
              desc: "Real-time tracked express shipping across India right to your store doorstep."
            }
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">{title}</h4>
                <p className="text-xs text-slate-350 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-400 font-semibold">
            © {new Date().getFullYear()} Mobiking Wholesale. All rights reserved.
          </p>
        </div>

      </div>

      {/* Right panel - Form (centered) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden relative overflow-hidden rounded-2xl mb-8 p-6 text-white min-h-[350px] flex flex-col justify-end shadow-md">
            <Image
              src="/login-bg.jpg"
              alt="Gadgets and Audio Hub Background"
              fill
              priority
              className="object-cover object-top"
              unoptimized
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F12]/95 via-[#0D0F12]/75 to-[#0D0F12]/40" />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 mb-1.5">
                <img src="/miniLogo.png" alt="logo" className="w-12" />
                <span className="font-bold text-lg tracking-tighter">Mobiking B2B</span>
              </Link>
              <p className="text-xs text-slate-300 font-medium">
                India's Premier Electronics Sourcing Hub
              </p>
            </div>
          </div>

          <PhoneOtpForm type="login" />
        </div>
      </div>

    </div>
  );
}
