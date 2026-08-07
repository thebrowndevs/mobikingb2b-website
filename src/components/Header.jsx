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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
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
        <div className="container mx-auto px-4 py-2 flex items-center justify-between max-w-[1400px]">
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
                      <Button variant="ghost" className="flex items-center gap-1 shadow-none font-semibold h-9 w-9 p-0 rounded-full hover:bg-slate-50">
                        <User size={18} className="text-slate-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-200 shadow-none">
                      {accountMenuItems.map((item, i) => item.auth && !isAuthenticated ? null : item.type === "separator" ? (
                        <DropdownMenuSeparator key={i} className="bg-slate-100" />
                      ) : (
                        <DropdownMenuItem key={item.label} onClick={item.onClick ? actionHandlers[item.onClick] : undefined} asChild={!!item.href} className={clsx("rounded-lg font-semibold text-xs py-2", item.isDestructive ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-50")}>
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

                  <Button variant="ghost" className="relative p-0 h-9 w-9 rounded-full hover:bg-slate-50 shadow-none flex items-center justify-center" onClick={() => setIsWishlistOpen(true)}>
                    <Heart size={18} className="text-slate-700" />
                    {getNotificationCount("wishlist") > 0 && (
                      <span className="absolute top-0 right-0 bg-primary text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                        {getNotificationCount("wishlist")}
                      </span>
                    )}
                  </Button>

                  <Button variant="ghost" className="relative p-0 h-9 w-9 rounded-full hover:bg-slate-50 shadow-none flex items-center justify-center" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={18} className="text-slate-700" />
                    {getNotificationCount("cart") > 0 && (
                      <span className="absolute top-0 right-0 bg-primary text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
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
      <div className="md:hidden bg-white border-b border-slate-150 shadow-none py-1.5">
        <div className="flex items-center justify-between px-4 py-1.5">
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <img
                src="/miniLogo.png"
                alt="Mobiking B2B"
                className="h-9 w-9 object-contain"
              />
              <div>
                <h1 className="font-bold text-sm tracking-tighter text-slate-800">Mobiking B2B</h1>
                <p className="text-[9px] text-gray-500 font-medium">B2B Electronics</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="md:hidden flex items-center">
              <CategoryMegaMenu />
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Account" className="h-8 w-8 border-slate-200 shadow-none rounded-lg">
                    <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-200 shadow-none">
                  {accountMenuItems.map((item, i) => item.auth && !isAuthenticated ? null : item.type === "separator" ? <DropdownMenuSeparator key={i} className="bg-slate-100" /> : (
                    <DropdownMenuItem key={item.label} onClick={item.onClick ? actionHandlers[item.onClick] : undefined} asChild={!!item.href} className="font-semibold rounded-lg text-xs py-2">
                      {item.href ? <Link href={item.href} className="flex items-center gap-2 w-full"><item.icon size={14} /><span>{item.label}</span></Link> : <div className="flex items-center gap-2 w-full"><item.icon size={14} /><span>{item.label}</span></div>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" aria-label="Login">
                <Button className="h-8 w-8 p-0 shadow-none rounded-lg bg-primary text-white">
                  <User size={18} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-none md:hidden z-[50]">
        <div className="flex justify-around items-center h-16">
          {visibleMobileNavItems.map(item => (
            item.href ? (
              <Link key={item.label} href={item.href} className="flex-1 text-center py-2">
                <div className="relative flex flex-col items-center gap-1 text-gray-500 hover:text-primary">
                  <item.icon size={20} />
                  <span className="text-[10px] font-bold">{item.label}</span>
                  {item.notification && getNotificationCount(item.notification) > 0 && <span className="absolute top-0 right-3 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{getNotificationCount(item.notification)}</span>}
                </div>
              </Link>
            ) : (
              <button key={item.label} onClick={actionHandlers[item.onClick]} className="flex-1 text-center py-2 bg-transparent border-0 focus:outline-none">
                <div className="relative flex flex-col items-center gap-1 text-gray-500 hover:text-primary">
                  <item.icon size={20} />
                  <span className="text-[10px] font-bold">{item.label}</span>
                  {item.notification && getNotificationCount(item.notification) > 0 && <span className="absolute top-0 right-3 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{getNotificationCount(item.notification)}</span>}
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
