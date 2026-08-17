"use client";

import {
  Home,
  Heart,
  LogOut,
  MapIcon,
  ShoppingBag,
  ShoppingCart,
  User,
  ChevronDown,
  LayoutGrid,
  Menu,
  Search
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import NavbarLinks from "./NavbarLinks";
import CategoryMegaMenu from "./CategoryMegaMenu";
import clsx from "clsx";

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
  { label: "Cart", icon: ShoppingCart, onClick: "openCart", notification: "cart" },
  { label: "Orders", href: "/account?tab=orders", icon: ShoppingBag, auth: true },
  { label: "Account", href: "/account", icon: User, auth: true },
  { label: "Login", href: "/login", icon: User, auth: false },
];

export default function Header() {
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { isAuthenticated, logout, user, loginOpen, setLoginOpen } = useAuth();

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
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-none hidden md:block">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between sm:max-w-[90%]">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex-shrink-0 py-2 mr-15">
            <div className="flex items-center gap-1.5 justify-center">
              <img
                src="/miniLogo.png"
                alt="Mobiking B2B"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="font-bold text-2xl -mb-1 tracking-tighter text-slate-800">Mobiking B2B</h1>
              </div>
            </div>
          </Link>

          {/* Middle: Category Menu & Inline Navigation Links */}
          <NavbarLinks />

          {/* Right: Search bar & User/Cart Controls */}
          <div className="flex items-center gap-4 ml-auto">
            <Suspense fallback={
              <div className="h-9 w-48 bg-slate-50 border border-slate-200 rounded-full animate-pulse" />
            }>
              <SearchBar />
            </Suspense>

            <div className="flex items-center gap-1.5">
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center justify-center shadow-none font-semibold h-10 w-10 p-0 rounded-full bg-slate-100 hover:bg-slate-200 border-0">
                        <User size={18} className="text-slate-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-sm border border-slate-250 shadow-none">
                      {accountMenuItems.map((item, i) => item.auth && !isAuthenticated ? null : item.type === "separator" ? (
                        <DropdownMenuSeparator key={i} className="bg-slate-100" />
                      ) : (
                        <DropdownMenuItem key={item.label} onClick={item.onClick ? actionHandlers[item.onClick] : undefined} asChild={!!item.href} className={clsx("rounded-sm font-semibold text-xs py-2", item.isDestructive ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-50")}>
                          {item.href ? (
                            <Link href={item.href} className="flex items-center gap-2 w-full">
                              <item.icon size={14} />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 w-full cursor-pointer">
                              <item.icon size={14} />
                              <span>{item.label}</span>
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 shadow-none border-0 flex items-center justify-center" onClick={() => setIsWishlistOpen(true)}>
                    <Heart size={18} className="text-slate-700" />
                    {getNotificationCount("wishlist") > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#ED1C24] text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {getNotificationCount("wishlist")}
                      </span>
                    )}
                  </Button>

                  <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 shadow-none border-0 flex items-center justify-center" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={18} className="text-slate-700" />
                    {getNotificationCount("cart") > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#ED1C24] text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {getNotificationCount("cart")}
                      </span>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="h-9 px-4 text-xs font-semibold shadow-none rounded-full text-slate-700 hover:bg-slate-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="h-9 px-4 text-xs font-semibold shadow-none rounded-full bg-primary text-white hover:bg-primary/95 transition-all"
                    >
                      Register Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Logo Row */}
      <div className="md:hidden bg-white border-b border-slate-150 shadow-none py-2.5 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4">
          {/* Left: Burger Drawer Trigger & Logo */}
          <div className="flex items-center gap-3">
            <CategoryMegaMenu
              customTrigger={
                <button aria-label="Menu" className="p-1 hover:bg-slate-100 rounded-lg focus:outline-none transition bg-transparent border-0 cursor-pointer flex items-center justify-center">
                  <Menu size={22} className="text-slate-800" />
                </button>
              }
            />
            <Link href="/" className="flex-shrink-0 flex items-center gap-1.5">
              <img
                src="/miniLogo.png"
                alt="Mobiking B2B"
                className="h-8 object-contain"
              />
              <span className="font-bold text-xl tracking-tighter text-slate-800">Mobiking B2B</span>
            </Link>
          </div>

          {/* Right Controls: Search, Profile, Cart */}
          <div className="flex items-center gap-2.5">
            {/* Search Toggle Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="h-9 w-9 p-0 bg-slate-100 hover:bg-slate-200 border-0 rounded-full flex items-center justify-center cursor-pointer transition focus:outline-none"
              aria-label="Search"
            >
              <Search size={18} className="text-slate-700" />
            </button>

            {/* Profile Icon */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" aria-label="Account" className="h-9 w-9 p-0 bg-slate-100 hover:bg-slate-200 border-0 rounded-full flex items-center justify-center focus:outline-none shadow-none">
                    <User size={18} className="text-slate-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-sm border border-slate-250 shadow-none">
                  {accountMenuItems.map((item, i) => item.auth && !isAuthenticated ? null : item.type === "separator" ? <DropdownMenuSeparator key={i} className="bg-slate-100" /> : (
                    <DropdownMenuItem key={item.label} onClick={item.onClick ? actionHandlers[item.onClick] : undefined} asChild={!!item.href} className="font-semibold rounded-sm text-xs py-2">
                      {item.href ? <Link href={item.href} className="flex items-center gap-2 w-full"><item.icon size={14} /><span>{item.label}</span></Link> : <div className="flex items-center gap-2 w-full"><item.icon size={14} /><span>{item.label}</span></div>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" aria-label="Login">
                <Button variant="ghost" className="h-9 w-9 p-0 bg-slate-100 hover:bg-slate-200 border-0 rounded-full flex items-center justify-center shadow-none">
                  <User size={18} className="text-slate-700" />
                </Button>
              </Link>
            )}

            {/* Cart Icon (with Auth / Login check) */}
            {isAuthenticated ? (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative h-9 w-9 p-0 bg-slate-100 hover:bg-slate-200 border-0 rounded-full flex items-center justify-center cursor-pointer transition focus:outline-none"
                aria-label="Cart"
              >
                <ShoppingCart size={18} className="text-slate-700" />
                {getNotificationCount("cart") > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ED1C24] text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {getNotificationCount("cart")}
                  </span>
                )}
              </button>
            ) : (
              <Link href="/login" aria-label="Login to see Cart">
                <Button variant="ghost" className="relative h-9 w-9 p-0 bg-slate-100 hover:bg-slate-200 border-0 rounded-full flex items-center justify-center shadow-none">
                  <ShoppingCart size={18} className="text-slate-700" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Search Row */}
        {isMobileSearchOpen && (
          <div className="px-4 pb-2 pt-1 border-t border-slate-100 flex justify-center bg-white transition-all">
            <Suspense fallback={<div className="h-9 w-full bg-slate-50 border border-slate-200 rounded-full animate-pulse" />}>
              <div className="w-full max-w-full">
                <SearchBar />
              </div>
            </Suspense>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md rounded-full md:hidden z-[50] max-w-[500px] mx-auto overflow-hidden">
        <div className="flex justify-around items-center h-14 px-2">
          {visibleMobileNavItems.map(item => {
            const isActive = item.href ? pathname === item.href : false;
            return item.href ? (
              <Link key={item.label} href={item.href} className="flex-1 text-center py-1">
                <div className={clsx(
                  "relative flex flex-col items-center gap-0.5 transition-all duration-200",
                  isActive ? "text-slate-900 scale-105" : "text-slate-500 hover:text-slate-800"
                )}>
                  <item.icon size={18} />
                  <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
                  {item.notification && getNotificationCount(item.notification) > 0 && (
                    <span className="absolute -top-1 right-4 bg-[#ED1C24] text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {getNotificationCount(item.notification)}
                    </span>
                  )}
                  {isActive && <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-slate-900" />}
                </div>
              </Link>
            ) : (
              <button key={item.label} onClick={actionHandlers[item.onClick]} className="flex-1 text-center py-1 bg-transparent border-0 focus:outline-none">
                <div className="relative flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-800 transition-all duration-200">
                  <item.icon size={18} />
                  <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
                  {item.notification && getNotificationCount(item.notification) > 0 && (
                    <span className="absolute -top-1 right-4 bg-[#ED1C24] text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {getNotificationCount(item.notification)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
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
