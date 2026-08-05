"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Loader2, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { getCategories } from "@/lib/services/operations/HomeApi";
import { contactLinks, quickLinks } from "@/data/footerLinks";
import RaiseQueryButton from "@/components/RaiseQueryButton";
import { IMAGES } from './../lib/assets';

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  // console.log(categories)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black border-t border-gray-800 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-indigo-900 blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-rose-900 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-[1350px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Information */}
          <div className="space-y-6">
            <div className="flex items-center">
              <Link href="/">
                {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1.5 rounded-xl shadow-lg"> */}
                <div className="//bg-gray-900 
                //p-2 
                rounded-lg">
                  <Image
                    src={IMAGES.TRANSPARENT_LOGO}
                    alt="Logo"
                    width={250}
                    height={250}
                    className="w-auto h-auto 
                    invertbrightness-100"
                  />
                </div>
                {/* </div> */}
              </Link>
              {/* <span className="ml-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-xl font-bold tracking-wide">MOBIKING</span> */}
            </div>

            <p className="text-gray-400 text-sm max-w-xs">
              Get premium electronics delivered to your doorstep with lightning speed and exceptional service.
            </p>

            <div className="space-y-3">
              <div className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5 mr-3 text-purple-400" />
                <span>mobikingwholesale@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Phone className="h-5 w-5 mr-3 text-purple-400" />
                <span>+91 8882999214</span>
              </div>
              <div className="flex items-start text-gray-400 hover:text-white transition-colors">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-purple-400 flex-shrink-0" />
                <span>91-B opp Isckon Temple East of Kailash, New Delhi, Delhi, 110065</span>
              </div>
            </div>

            <div className="flex space-x-4 pt-2">
              {[
                // { Icon: Facebook, color: "text-blue-400", link: '' },
                // { Icon: Twitter, color: "text-sky-400", link: '' },
                { Icon: Instagram, color: "text-pink-400", link: 'https://www.instagram.com/mobikingwholesale/' },
                // { Icon: Linkedin, color: "text-blue-300" }
              ].map(({ Icon, color, link }, index) => (
                <Link
                  key={index}
                  href={link}
                  className={`p-2.5 bg-gray-800 hover:bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full transition-all duration-300 transform hover:-translate-y-1 ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Support */}
          <div className="space-y-6 max-[768px]:hidden sm:invisible">
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent inline-block">
              Support Center
            </h3>
            <ul className="space-y-3">
              {contactLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="flex items-center text-gray-400 hover:text-white group transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="flex items-center text-gray-400 hover:text-white group transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent inline-block">
              Shop Categories
            </h3>
            <ul className="space-y-3">
              {loading ? (
                <li className="flex justify-start">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
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
                      className="flex items-center text-gray-400 hover:text-white group transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
              <li className="pt-4">
                <Link
                  href="/categories"
                  className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300 group transition-colors"
                >
                  Explore All Categories
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Mobiking. All rights reserved.
          </p>
        </div>
      </div>

      {/* Floating support button */}
      {/* <RaiseQueryButton /> */}
    </footer>
  );
}