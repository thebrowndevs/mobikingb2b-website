'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Check } from 'lucide-react';

export default function ContactPage() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        phone: '',
        gstin: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => {
            setFormSubmitted(false);
            setFormData({ name: '', businessName: '', phone: '', gstin: '', message: '' });
        }, 3000);
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12">

            {/* HERO TITLE SECTION */}
            <header className="max-w-2xl mb-10">
                <span className="text-sm font-bold text-primary tracking-widest uppercase bg-slate-100 px-3.5 py-1.5 rounded-full">
                    Partner With Us
                </span>
                <h1 className="text-4xl font-bold leading-tight text-slate-800 tracking-tighter mt-5">
                    Connect With Our Wholesale Desk
                </h1>
                <p className="mt-4 text-[19px] text-slate-600 leading-relaxed font-medium">
                    Have questions about pricing tiers, custom bulk orders, or container logistics? Reach out to our B2B trade specialists today.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-10">

                {/* LEFT COLUMN: CONTACT DETAILS (Unified in a single card matching height) */}
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-8 flex flex-col justify-between h-full shadow-none gap-8 lg:gap-0">

                    {/* Phone & Support */}
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                            <Phone size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Call & WhatsApp</h3>
                            <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                                +91 84482 72134
                            </p>
                            <p className="mt-1 text-sm text-slate-400 font-semibold">
                                Instant trade inquiries & support
                            </p>
                        </div>
                    </div>

                    {/* Email Hub */}
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                            <Mail size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Email Sourcing</h3>
                            <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                                wholesale@mobikingb2b.com
                            </p>
                            <p className="mt-1 text-sm text-slate-400 font-semibold">
                                Submit custom specification RFP requests
                            </p>
                        </div>
                    </div>

                    {/* Address / Hub */}
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                            <MapPin size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Fulfillment Center</h3>
                            <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                                Mobiking B2B Sourcing Hub, New Delhi, India
                            </p>
                            <p className="mt-1 text-sm text-slate-400 font-semibold">
                                Warehouse dispatch & inventory processing
                            </p>
                        </div>
                    </div>

                    {/* Sourcing Hours */}
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                            <Clock size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Business Hours</h3>
                            <p className="mt-2 text-[19px] text-slate-600 leading-relaxed font-medium">
                                Monday – Saturday: 10:00 AM – 7:00 PM IST
                            </p>
                            <p className="mt-1 text-sm text-slate-400 font-semibold">
                                Response turnaround within 2 hours
                            </p>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: INQUIRY FORM */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-8 md:p-10 shadow-none flex flex-col justify-between h-full">
                    <div>
                        <div className="mb-6 flex items-center gap-2">
                            <MessageSquare size={20} className="text-primary" />
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">Submit Request</h2>
                        </div>

                        {formSubmitted ? (
                            <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-8 text-center text-emerald-800 flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                    <Check size={24} />
                                </div>
                                <h3 className="text-lg font-bold">Request Logged Successfully</h3>
                                <p className="text-sm font-semibold max-w-md">
                                    Thank you for your inquiry. A trade manager will get in touch with you shortly.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. John Doe"
                                            className="border border-slate-200 focus:border-slate-350 focus:bg-white bg-slate-50/50 rounded-lg p-3 outline-none text-slate-800 text-sm font-medium transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="businessName" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Name</label>
                                        <input
                                            type="text"
                                            id="businessName"
                                            required
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            placeholder="e.g. Acme Retailers"
                                            className="border border-slate-200 focus:border-slate-350 focus:bg-white bg-slate-50/50 rounded-lg p-3 outline-none text-slate-800 text-sm font-medium transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp / Phone</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="e.g. +91 98765 43210"
                                            className="border border-slate-200 focus:border-slate-350 focus:bg-white bg-slate-50/50 rounded-lg p-3 outline-none text-slate-800 text-sm font-medium transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="gstin" className="text-xs font-bold text-slate-400 uppercase tracking-wider">GSTIN (Optional)</label>
                                        <input
                                            type="text"
                                            id="gstin"
                                            value={formData.gstin}
                                            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                            placeholder="e.g. 07AAAAA1111A1Z1"
                                            className="border border-slate-200 focus:border-slate-350 focus:bg-white bg-slate-50/50 rounded-lg p-3 outline-none text-slate-800 text-sm font-medium transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="message" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirement Details / Message</label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Briefly state categories and average quantities required..."
                                        className="border border-slate-200 focus:border-slate-350 focus:bg-white bg-slate-50/50 rounded-lg p-3 outline-none text-slate-800 text-sm font-medium resize-none transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 text-xs uppercase tracking-wider shadow-none transition-all cursor-pointer border-0 mt-2"
                                >
                                    <Send size={14} />
                                    <span>Submit Inquiry</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
