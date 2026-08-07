'use client';

import React from 'react';
import { ShieldCheck, Truck, Percent, CheckCircle2, Building2, HelpCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 py-16">

            {/* HERO SECTION */}
            <section className="grid gap-12 md:grid-cols-2 items-center mb-20">
                <div>
                    <span className="text-sm font-bold text-primary tracking-widest uppercase bg-slate-100 px-3.5 py-1.5 rounded-full">
                        India's Premier B2B Hub
                    </span>
                    <h2 className="text-4xl font-bold leading-tight text-slate-800 tracking-tighter mt-5">
                        We Power Retailers with Factory-Direct Sourcing
                    </h2>
                    <p className="mt-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">
                        Mobiking B2B Sourcing & Logistics
                    </p>
                    <p className="mt-5 text-[19px] text-slate-600 leading-relaxed font-medium">
                        Mobiking B2B is a dedicated business-to-business distribution platform. We streamline supply chains for mobile accessories and consumer electronics by connecting retail stores, regional distributors, and e-commerce merchants directly with leading manufacturers. We eliminate middlemen commissions to deliver unmatched margin opportunities for your business.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <a
                            href="/categories"
                            className="inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold shadow-none hover:bg-primary/95 transition-all text-white"
                        >
                            Explore Wholesale Catalog
                        </a>
                        <a
                            href="/contact"
                            className="inline-block rounded-full border border-slate-200 px-6 py-2.5 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all bg-white"
                        >
                            Become a Partner
                        </a>
                    </div>
                </div>

                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
                        alt="B2B Logistics Warehouse"
                        className="w-full rounded-2xl shadow-none border border-slate-150 object-cover h-80 md:h-96"
                    />
                </div>
            </section>

            {/* THREE CORE PILLARS */}
            <section className="mb-20">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tighter">Our Core Infrastructure Pillars</h3>
                    <p className="text-slate-500 text-base mt-1 font-medium">How we maintain the highest efficiency and quality standard for wholesale buyers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pillar 1 */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-none">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-primary mb-4 border border-slate-100">
                            <Building2 size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xl">Direct Factory Alliances</h4>
                        <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                            By working directly with certified manufacturing plants, we procure inventory at baseline production costs, passing pure profit margin back to our retail buyers.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-none">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-primary mb-4 border border-slate-100">
                            <ShieldCheck size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xl">QC Inspection Facility</h4>
                        <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                            Every single batch undergoes standard quality assessment checks at our warehouse hub, reducing defect ratios to less than 0.5% before final dispatch.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-none">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-primary mb-4 border border-slate-100">
                            <Truck size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xl">Bulk Fulfillment Network</h4>
                        <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                            Partnered with India's leading surface cargo and air shipping carriers to ensure fast, secure bulk parcel delivery directly to your store's doorstep.
                        </p>
                    </div>
                </div>
            </section>

            {/* PARTNERSHIP BENEFITS */}
            <section className="bg-white border border-slate-150 rounded-2xl p-8 md:p-10 shadow-none mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Growth Partnerships</span>
                        <h3 className="text-3xl font-bold text-slate-800 tracking-tighter mt-1">Scale Your Business Margins</h3>
                        <p className="mt-3 text-[19px] text-slate-600 leading-relaxed font-medium">
                            Mobiking B2B acts as your remote inventory department. Our wholesale portal provides real-time catalog pricing, live container dispatch status, and custom invoice management to ease GST filing and compliance.
                        </p>

                        <div className="mt-6 space-y-3.5">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                                <span className="text-[19px] text-slate-600 leading-relaxed font-medium">Flexible minimum order thresholds for growing shops.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                                <span className="text-[19px] text-slate-600 leading-relaxed font-medium">Authorized GST Invoices with split breakdown mapping.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                                <span className="text-[19px] text-slate-600 leading-relaxed font-medium">Live support from a dedicated account representative.</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-xl text-center">
                            <div className="text-4xl font-bold text-primary">15+</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Product Categories</div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-xl text-center">
                            <div className="text-4xl font-bold text-primary">5000+</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Active Resellers</div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-xl text-center">
                            <div className="text-4xl font-bold text-primary">100%</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">GST Compliant</div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-xl text-center">
                            <div className="text-4xl font-bold text-primary">&lt;0.5%</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Defect Ratio</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT ADVISORY GRID */}
            <section className="mb-20">
                <div className="mb-8 text-center md:text-left">
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tighter">Sourcing Hotspots</h3>
                    <p className="text-slate-500 text-base mt-1 font-medium">Bulk inventory lines that consistently offer the highest ROI for retailers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Item 1 */}
                    <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-none hover:border-slate-350 transition-all duration-300">
                        <div className="rounded-lg overflow-hidden h-44 bg-slate-50 border border-slate-100">
                            <img
                                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600"
                                alt="Wireless Earbuds Sourcing"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="mt-4 font-bold text-slate-800 text-[18px]">Acoustic Audio</h4>
                        <p className="mt-1.5 text-[19px] text-slate-600 leading-relaxed font-medium">True wireless earbuds, neckbands, and portable speakers.</p>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-none hover:border-slate-350 transition-all duration-300">
                        <div className="rounded-lg overflow-hidden h-44 bg-slate-50 border border-slate-100">
                            <img
                                src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600"
                                alt="Chargers Sourcing"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="mt-4 font-bold text-slate-800 text-[18px]">Power Supplies</h4>
                        <p className="mt-1.5 text-[19px] text-slate-600 leading-relaxed font-medium">Fast adapters, multiport hubs, and safe powerbanks.</p>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-none hover:border-slate-350 transition-all duration-300">
                        <div className="rounded-lg overflow-hidden h-44 bg-slate-50 border border-slate-100">
                            <img
                                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600"
                                alt="Smart Gadgets Sourcing"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="mt-4 font-bold text-slate-800 text-[18px]">Wearable Devices</h4>
                        <p className="mt-1.5 text-[19px] text-slate-600 leading-relaxed font-medium">Fitness smartwatches, screen protectors, and watch straps.</p>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-none hover:border-slate-350 transition-all duration-300">
                        <div className="rounded-lg overflow-hidden h-44 bg-slate-50 border border-slate-100">
                            <img
                                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600"
                                alt="Mobile cables and tools Sourcing"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="mt-4 font-bold text-slate-800 text-[18px]">Utility Accessories</h4>
                        <p className="mt-1.5 text-[19px] text-slate-600 leading-relaxed font-medium">Wired connectors, OTG keys, mounts, and tool kits.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
