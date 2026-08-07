'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Check } from 'lucide-react';

const inputClass =
    'w-full border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-3 outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400 transition-all duration-150';

const contactItems = [
    {
        icon: 'Phone',
        title: 'Call & WhatsApp',
        detail: '+91 84482 72134',
        sub: 'Instant trade inquiries & support',
    },
    {
        icon: 'Mail',
        title: 'Email Sourcing',
        detail: 'wholesale@mobikingb2b.com',
        sub: 'Submit custom specification RFP requests',
    },
    {
        icon: 'MapPin',
        title: 'Fulfillment Center',
        detail: 'Mobiking B2B Sourcing Hub, New Delhi, India',
        sub: 'Warehouse dispatch & inventory processing',
    },
    {
        icon: 'Clock',
        title: 'Business Hours',
        detail: 'Monday – Saturday: 10:00 AM – 7:00 PM IST',
        sub: 'Response turnaround within 2 hours',
    },
];

const iconMap = { Phone, Mail, MapPin, Clock };

export default function ContactPage() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        phone: '',
        gstin: '',
        message: ''
    });

    const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

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

            {/* HERO */}
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

                {/* LEFT — Contact Info */}
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-8 flex flex-col justify-between h-full shadow-none gap-8 lg:gap-0">
                    {contactItems.map(({ icon, title, detail, sub }) => {
                        const Icon = iconMap[icon];
                        return (
                            <div key={title} className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                                    <p className="mt-1.5 text-[17px] text-slate-600 leading-relaxed font-medium">{detail}</p>
                                    <p className="mt-0.5 text-sm text-slate-400 font-semibold">{sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT — Inquiry Form */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-8 md:p-10 shadow-none flex flex-col h-full">

                    <div className="mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-primary" />
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">Submit Request</h2>
                    </div>

                    {formSubmitted ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-10 text-center text-emerald-800 flex flex-col items-center gap-4 w-full">
                                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                    <Check size={26} />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Request Logged Successfully</h3>
                                <p className="text-sm font-semibold text-emerald-700 max-w-sm">
                                    Thank you for your inquiry. A trade manager will get in touch with you shortly.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="name" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input type="text" id="name" required value={formData.name}
                                        onChange={handleChange('name')} placeholder="e.g. Rahul Sharma" className={inputClass} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="businessName" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business Name</label>
                                    <input type="text" id="businessName" required value={formData.businessName}
                                        onChange={handleChange('businessName')} placeholder="e.g. Acme Retailers" className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="phone" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp / Phone</label>
                                    <input type="tel" id="phone" required value={formData.phone}
                                        onChange={handleChange('phone')} placeholder="e.g. +91 98765 43210" className={inputClass} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="gstin" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        GSTIN <span className="normal-case font-medium text-slate-400">(optional)</span>
                                    </label>
                                    <input type="text" id="gstin" maxLength={15} value={formData.gstin}
                                        onChange={handleChange('gstin')} placeholder="e.g. 07AAAAA1111A1Z1" className={inputClass} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 flex-1">
                                <label htmlFor="message" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Requirement Details</label>
                                <textarea id="message" required rows={5} value={formData.message}
                                    onChange={handleChange('message')}
                                    placeholder="Briefly describe the product categories and approximate quantities you need..."
                                    className={`${inputClass} resize-none h-full min-h-[120px]`}
                                />
                            </div>

                            <button type="submit"
                                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 mt-1">
                                <Send size={13} />
                                <span>Submit Inquiry</span>
                            </button>

                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}