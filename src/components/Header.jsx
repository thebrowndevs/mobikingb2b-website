"use client";

import {
  Home,
  Search,
  Heart,
  LogOut,
  MapIcon,
  ShoppingBag,
  ShoppingCart,
  User,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo, useEffect, Suspense } from "react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoginDialog from "./LoginDialog";
import MyCart from "./MyCart";
import WishlistSheet from "./WishlistSheet";
import { useAuth } from "@/context/AuthContext";
import SearchBar from './SearchBar';
import CategoryMegaMenu from "./CategoryMegaMenu";
import { quickLinks } from "@/data/footerLinks";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";

const accountMenuItems = [
  { label: "Profile", href: "/account?tab=profile", icon: User, auth: true },
  { label: "My Orders", href: "/account?tab=orders", icon: ShoppingBag, auth: true },
  { label: "My Address", href: "/account?tab=address", icon: MapIcon, auth: true },
  { type: "separator", auth: true },
  { label: "Logout", icon: LogOut, onClick: "logout", auth: true, isDestructive: true },
];

const mobileNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  // { label: "Wishlist", icon: Heart, onClick: "openWishlist", notification: "wishlist" },
  { label: "Cart", icon: ShoppingCart, onClick: "openCart", notification: "cart" },
  { label: "Orders", href: "/account?tab=orders", icon: ShoppingBag, auth: true },
  { label: "Account", href: "/account", icon: User, auth: true },
  { label: "Login", icon: User, onClick: "openLogin", auth: false },
];

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const { isAuthenticated, logout, user, loginOpen, setLoginOpen } = useAuth();

  const placeholderTexts = [
    "Search for earphones...",
    "Looking for power bank?",
    "Find your perfect headphones...",
    "Browse our collection...",
  ];

  // Typewriter effect
  useEffect(() => {
    const iv = setInterval(() => {
      const txt = placeholderTexts[currentPlaceholderIndex];
      if (isTyping) {
        if (charIndex < txt.length) {
          setPlaceholder(txt.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setIsTyping(false);
          setTimeout(() => setIsTyping(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(txt.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsTyping(true);
          setCurrentPlaceholderIndex((i) => (i + 1) % placeholderTexts.length);
        }
      }
    }, 100);
    return () => clearInterval(iv);
  }, [charIndex, currentPlaceholderIndex, isTyping]);

  const actionHandlers = {
    openWishlist: () => setIsWishlistOpen(true),
    openCart: () => setIsCartOpen(true),
    openLogin: () => setLoginOpen(true),
    logout: logout,
  };

  const visibleMobileNavItems = useMemo(
    () => mobileNavItems.filter(item => typeof item.auth === "undefined" || item.auth === isAuthenticated),
    [isAuthenticated]
  );

  const getNotificationCount = type => {
    if (!isAuthenticated || !user) return 0;
    if (type === "wishlist") return user.wishlist?.length || 0;
    if (type === "cart") return user.cart?.items?.length || 0;
    return 0;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm hidden md:block">
        <div className="container mx-auto px-4 py-2 gap-5 flex items-center justify-between max-w-[95vw]">
          <Link href="/" className="flex-shrink-0 py-2">
            {/* <Image
              src={IMAGES.WHITE_LOGO}
              alt="logo"
              width={230}
              height={280}
              className="w-auto h-auto"
            /> */}

            <div className="flex items-center gap-1 justify-center">
              <img
                src="/miniLogo.png"
                alt="Mobiking Wholesale"
                className="h-14 w-14 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg -mb-1">Mobiking Wholesale</h1>
                <p className="text-sm text-gray-500">Wholesale electronics & accessories</p>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4 ml-4">
            <CategoryMegaMenu />

            <div
              className="relative"
              onMouseEnter={() => setIsQuickLinksOpen(true)}
              onMouseLeave={() => setIsQuickLinksOpen(false)}
            >
              <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-primary font-medium">
                <span>Quick Links</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isQuickLinksOpen ? "rotate-180" : ""}`} />
              </Button>

              <AnimatePresence>
                {isQuickLinksOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-[100]"
                  >
                    {quickLinks.map((link) => (
                      <Link
                        key={link.title}
                        href={link.url}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-primary rounded-md transition-colors"
                        onClick={() => setIsQuickLinksOpen(false)}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar */}
          <Suspense fallback={
            <div
              className="flex items-center gap-2 border rounded-sm px-3 py-1.5"
            >
              <input
                className="text-sm text-gray-700 w-full outline-none"
                placeholder={placeholder}
              />

              <button
                type="button"
                className="cursor-pointer text-gray-500 hover:text-gray-800"
              >
                <Search size={18} className="" />
              </button>
            </div>
          }>
            <SearchBar />
          </Suspense>

          {/* Address, Profile Container */}
          <div className="flex items-center gap-2">

            {/* <LocationSelector /> */}
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1">
                      <User size={20} />
                      {/* <span>Account</span> */}
                      <ChevronDown size={16} className="text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg">
                    {accountMenuItems.map((item, i) => item.auth && !isAuthenticated ? null : item.type === "separator" ? (
                      <DropdownMenuSeparator key={i} />
                    ) : (
                      <DropdownMenuItem key={item.label} onClick={item.onClick ? actionHandlers[item.onClick] : undefined} asChild={!!item.href} className={item.isDestructive ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-50"}>
                        {item.href ? (
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2">
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" className="relative p-2" onClick={() => setIsWishlistOpen(true)}>
                  <Heart size={50} />
                  {getNotificationCount("wishlist") > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{getNotificationCount("wishlist")}</span>}
                </Button>
                <Button variant="ghost" className="relative p-2" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart size={30} />
                  {getNotificationCount("cart") > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{getNotificationCount("cart")}</span>}
                </Button>
              </>
            ) : (
              <Button onClick={() => setLoginOpen(true)} className="px-4 py-2">Login</Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Logo Row (scrolls off) */}
      <div className="md:hidden bg-white -mb2">
        <div className="flex items-center justify-between px-4 py-0">
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center justify-center">
              <img
                src="/mobikingNew.png"
                alt="Mobiking Logo"
                width={130}
                height={65}
                className="object-contain"
                style={{ WebkitUserDrag: "none" }}
              />
            </div>
          </Link>

          <div className="md:hidden flex items-center">
            <CategoryMegaMenu />
          </div>

          {/* <QrModal /> */}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account" className="h-10 w-10">
                  <User size={28} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg">
                {accountMenuItems.map((item, i) => item.auth && !isAuthenticated ? null : item.type === "separator" ? <DropdownMenuSeparator key={i} /> : (
                  <DropdownMenuItem key={item.label} onClick={item.onClick ? actionHandlers[item.onClick] : undefined} asChild={!!item.href}>
                    {item.href ? <Link href={item.href} className="flex items-center gap-2"><item.icon size={16} /><span>{item.label}</span></Link> : <div className="flex items-center gap-2"><item.icon size={16} /><span>{item.label}</span></div>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={actionHandlers.openLogin} aria-label="Login" className="h-10 w-10">
              <User size={28} />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search Row (sticky) */}
      {/* <div className="sticky top-0 z-40 lg:hidden bg-white border-b shadow-sm">
        <div className="px-4 py-2">
          <SearchSection />
        </div>
      </div> */}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t shadow-sm md:hidden z-[50]">
        <div className="flex justify-around items-center h-16">
          {visibleMobileNavItems.map(item => (
            item.href ? (
              <Link key={item.label} href={item.href} className="flex-1 text-center py-2">
                <div className="relative flex flex-col items-center gap-1">
                  <item.icon size={24} className="text-gray-600 hover:text-primary" />
                  <span className="text-xs">{item.label}</span>
                  {item.notification && getNotificationCount(item.notification) > 0 && <span className="absolute top-0 right-0 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">{getNotificationCount(item.notification)}</span>}
                </div>
              </Link>
            ) : (
              <button key={item.label} onClick={actionHandlers[item.onClick]} className="flex-1 text-center py-2">
                <div className="relative flex flex-col items-center gap-1">
                  <item.icon size={24} className="text-gray-600 hover:text-primary" />
                  <span className="text-xs">{item.label}</span>
                  {item.notification && getNotificationCount(item.notification) > 0 && <span className="absolute top-0 right-6 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">{getNotificationCount(item.notification)}</span>}
                </div>
              </button>
            )
          ))}
        </div>
      </nav>

      {/* Modals & Sheets */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      {
        isCartOpen && <MyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      }
      <WishlistSheet isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
}
