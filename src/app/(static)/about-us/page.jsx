'use client';

import React from 'react';

export default function AboutPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* HERO */}
            <section className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                    <h2 className="text-4xl font-extrabold leading-tight">About Mobiking Wholesale</h2>
                    <p className="mt-4 text-gray-700">
                        Mobiking Wholesale is a dedicated wholesale supplier of electronic accessories — from headphones and earbuds to speakers and chargers.
                        We source quality products and pass the savings to retailers and resellers. Our promise:{' '}
                        <strong className="text-indigo-600">the cheapest prices in the market</strong> without compromising on product quality.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <a
                            href="/categories"
                            className="inline-block rounded-md bg-indigo-600 px-5 py-3 text-white font-medium shadow-md hover:bg-indigo-700"
                        >
                            Browse Products
                        </a>
                        <a href="/contact" className="inline-block rounded-md border px-5 py-3 text-gray-700 hover:bg-gray-100">
                            Contact Sales
                        </a>
                    </div>
                </div>

                <div className="relative">
                    <img
                        src="/about-hero.png"
                        alt="Electronics showcase"
                        className="w-full rounded-xl shadow-lg object-cover h-72 md:h-96"
                    />
                </div>
            </section>

            {/* OUR PROMISE / VALUE */}
            <section className="mt-14 bg-gradient-to-r from-white to-indigo-50 rounded-xl p-8">
                <div className="md:flex gap-5 md:items-center md:justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Our Promise: Lowest Market Prices</h3>
                        <p className="mt-2 text-gray-700 max-w-2xl">
                            We negotiate with manufacturers and maintain lean operations so we can offer the most competitive wholesale prices
                            on popular accessories like headphones, earbuds, Bluetooth speakers, chargers and more. Buy in bulk and save more.
                        </p>
                    </div>

                    <div className="mt-6 md:mt-0 grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <h4 className="font-semibold">Bulk Discounts</h4>
                            <p className="text-sm text-gray-600">Higher quantity = better pricing tiers.</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <h4 className="font-semibold">Quality Checked</h4>
                            <p className="text-sm text-gray-600">Products inspected before dispatch.</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <h4 className="font-semibold">Fast Shipping</h4>
                            <p className="text-sm text-gray-600">Reliable logistics for nationwide delivery.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCTS SHOWCASE */}
            <section className="mt-14">
                <h3 className="text-2xl font-bold">Featured Categories</h3>
                <p className="text-gray-600 mt-2">Top-selling product categories we supply to retailers and resellers.</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
                        <img
                            src="/headphones.jpeg"
                            alt="Headphones"
                            className="w-full h-52 object-cover rounded-md"
                        />
                        <h4 className="mt-3 font-semibold">Headphones</h4>
                        <p className="text-sm text-gray-600 mt-1">Over-ear & on-ear options — wired and wireless.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
                        <img
                            src="/buds.jpeg"
                            alt="Earbuds"
                            className="w-full h-52 object-cover rounded-md"
                        />
                        <h4 className="mt-3 font-semibold">Earbuds</h4>
                        <p className="text-sm text-gray-600 mt-1">True wireless and sport-friendly models.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
                        <img
                            src="/speakers.jpeg"
                            alt="Speakers"
                            className="w-full h-52 object-cover rounded-md"
                        />
                        <h4 className="mt-3 font-semibold">Speakers</h4>
                        <p className="text-sm text-gray-600 mt-1">Bluetooth speakers — portable and party-ready.</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
                        <img
                            src="/accessories.jpeg"
                            alt="Accessories"
                            className="w-full h-52 object-cover rounded-md"
                        />
                        <h4 className="mt-3 font-semibold">Accessories</h4>
                        <p className="text-sm text-gray-600 mt-1">Cables, chargers, cases and more.
                        </p>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="mt-14 bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold">Why Choose Mobiking Wholesale?</h3>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-semibold">Competitive Pricing</h4>
                        <p className="text-gray-600 text-sm mt-1">We price-match and ensure you get the lowest market price for comparable items.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Trusted Sourcing</h4>
                        <p className="text-gray-600 text-sm mt-1">Longstanding relationships with factories and verified suppliers.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Dedicated Support</h4>
                        <p className="text-gray-600 text-sm mt-1">Account managers and quick responses for bulk buyers.</p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS + CTA */}
            {/* <section className="mt-14">
                <div className="rounded-xl bg-indigo-600 text-white p-8 md:flex md:items-center md:justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Ready to stock the best accessories at the best prices?</h3>
                        <p className="mt-2 text-indigo-100">Register as a reseller or drop us a message to get exclusive wholesale tiers.</p>
                    </div>

                    <div className="mt-6 md:mt-0">
                        <a href="/signup" className="rounded-md bg-white px-5 py-3 font-medium text-indigo-600">
                            Create an Account
                        </a>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <blockquote className="p-4 bg-white rounded shadow">
                        <p className="text-gray-700">"Great wholesale pricing and fast shipping — helped scale our retail business."</p>
                        <footer className="mt-3 text-sm text-gray-500">— Riya, Mumbai</footer>
                    </blockquote>

                    <blockquote className="p-4 bg-white rounded shadow">
                        <p className="text-gray-700">"Excellent packaging and product quality. Reorder every month."</p>
                        <footer className="mt-3 text-sm text-gray-500">— Ahmed, Delhi</footer>
                    </blockquote>

                    <blockquote className="p-4 bg-white rounded shadow">
                        <p className="text-gray-700">"Competitive tiers for large orders and helpful account manager."</p>
                        <footer className="mt-3 text-sm text-gray-500">— Priya, Bangalore</footer>
                    </blockquote>
                </div>
            </section> */}
        </div>
    );
}
