"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Loader2, User, ShoppingCart, MapPin, ShoppingBag, Heart, Building2, LogOut, ShieldCheck, ShieldAlert, FileText, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Profile from "./_components/Profile";
import Address from "./_components/Address";
import Orders from "./_components/Orders";
import Quotations from "./_components/Quotations";
import Wishlist from "./_components/Wishlist";
import Cart from "./_components/Cart";
import BusinessProfile from "./_components/BusinessProfile";
import clsx from "clsx";

function AccountContent() {
  const { isAuthenticated, isLoading, user, logout, fetchFreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { name: "My Profile", value: "profile", Component: <Profile />, icon: User },
    { name: "Business Profile", value: "business", Component: <BusinessProfile />, icon: Building2 },
    { name: "My Cart", value: "cart", Component: <Cart />, icon: ShoppingCart },
    { name: "Shipping Addresses", value: "address", Component: <Address />, icon: MapPin },
    { name: "Order Requests", value: "quotations", Component: <Quotations />, icon: FileText },
    { name: "My Orders", value: "orders", Component: <Orders />, icon: ShoppingBag },
    { name: "My Wishlist", value: "wishlist", Component: <Wishlist />, icon: Heart },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [mobileShowMenu, setMobileShowMenu] = useState(true);

  // Fetch fresh profile data on component mount
  useEffect(() => {
    if (isAuthenticated && fetchFreshProfile) {
      fetchFreshProfile();
    }
  }, [isAuthenticated, fetchFreshProfile]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some((t) => t.value === tabParam)) {
      setActiveTab(tabParam);
      setMobileShowMenu(false); // If opened via URL tab param, open detail directly on mobile
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    router.replace(`/account?tab=${value}`, { scroll: false });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#F6F6F6]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  const isVerified = user?.business?.verified;
  const isBusinessActive = user?.business?.active;
  const userInitials = user?.name ? user.name.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "M";

  return (
    <div className="w-full lg:max-w-[90%] mx-auto px-4 md:px-6 py-10">

      {/* ---------------------------------------------------- */}
      {/* MOBILE ACCOUNT VIEW LAYOUT (Step-by-Step Menu List)  */}
      {/* ---------------------------------------------------- */}
      <div className="block lg:hidden w-full">
        {mobileShowMenu ? (
          <div className="flex flex-col gap-6">
            {/* User Profile Card */}
            <div className="bg-white border border-slate-200 rounded-sm p-6 flex flex-col items-center text-center select-none">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mb-4 relative">
                {userInitials}
                {isVerified ? (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white" title="Verified Business">
                    <ShieldCheck size={16} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white" title="Verification Pending">
                    <ShieldAlert size={16} strokeWidth={2.5} />
                  </div>
                )}
              </div>

              <h4 className="font-bold text-slate-800 text-lg tracking-tight leading-tight">
                {user?.name || "B2B Member"}
              </h4>
              <p className="text-sm text-slate-400 mt-1 font-semibold">
                +91 {user?.phoneNo}
              </p>

              {/* Status Badges */}
              <div className="mt-3.5">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Buyer
                  </span>
                ) : isBusinessActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending Approval
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Profile Incomplete
                  </span>
                )}
              </div>
            </div>

            {/* Menu List Options */}
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      handleTabChange(tab.value);
                      setMobileShowMenu(false);
                    }}
                    className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-3 text-slate-700">
                      <TabIcon size={18} className="text-slate-400" />
                      <span className="text-sm font-semibold">{tab.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                );
              })}

              <button
                onClick={logout}
                className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-sm text-red-600 hover:bg-red-50/50 transition text-left mt-2"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-red-500" />
                  <span className="text-sm font-semibold">Log Out</span>
                </div>
                <ChevronRight size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        ) : (
          /* Show selected tab content details view */
          <div className="w-full">
            <button
              onClick={() => setMobileShowMenu(true)}
              className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs mb-5 px-1 py-1"
            >
              &larr; Back to Dashboard Menu
            </button>

            <div className="w-full bg-white border border-slate-200 rounded-sm p-4 min-h-[450px]">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 tracking-tighter">
                  {tabs.find(t => t.value === activeTab)?.name}
                </h2>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Manage your wholesale dashboard {tabs.find(t => t.value === activeTab)?.name.toLowerCase()}
                </p>
              </div>
              {tabs.find(t => t.value === activeTab)?.Component}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* DESKTOP ACCOUNT VIEW LAYOUT (Sticky Sidebar Panel)   */}
      {/* ---------------------------------------------------- */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="hidden lg:flex flex-col lg:flex-row gap-8 items-start w-full"
      >
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-[300px] bg-white border border-slate-200 rounded-sm p-5 shrink-0 space-y-6">

          {/* User Profile Card */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 select-none">
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mb-4 relative">
              {userInitials}
              {isVerified ? (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white" title="Verified Business">
                  <ShieldCheck size={16} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white" title="Verification Pending">
                  <ShieldAlert size={16} strokeWidth={2.5} />
                </div>
              )}
            </div>

            <h4 className="font-bold text-slate-800 text-lg tracking-tight leading-tight">
              {user?.name || "B2B Member"}
            </h4>
            <p className="text-sm text-slate-400 mt-1 font-semibold">
              +91 {user?.phoneNo}
            </p>

            {/* Status Badges */}
            <div className="mt-3.5">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Buyer
                </span>
              ) : isBusinessActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Approval
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Profile Incomplete
                </span>
              )}
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <TabsList className="flex flex-col w-full gap-1.5 items-start bg-transparent p-0 h-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={clsx(
                    "flex items-center gap-3 px-4.5 py-3 text-sm font-semibold rounded-sm transition-all duration-150 w-full text-left justify-start cursor-pointer border-0 shadow-none outline-none select-none my-0.5 shrink-0 bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    "data-[state=active]:!bg-slate-900 data-[state=active]:!text-white"
                  )}
                >
                  <TabIcon size={18} className={clsx("shrink-0", isActive ? "text-white" : "text-slate-400")} />
                  <span>{tab.name}</span>
                </TabsTrigger>
              );
            })}

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4.5 py-3 text-sm font-semibold rounded-sm text-red-600 hover:bg-red-50 hover:text-red-750 transition-all duration-150 w-full text-left justify-start cursor-pointer border-0 bg-transparent shrink-0 mt-6"
            >
              <LogOut size={18} className="shrink-0 text-red-500" />
              <span>Log Out</span>
            </button>
          </TabsList>

        </div>

        {/* Content Box */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-sm p-6 md:p-8 min-h-[550px]">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="outline-none border-0 p-0 m-0 shadow-none"
              forceMount={activeTab === tab.value}
            >
              <div className="mb-6 border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">{tab.name}</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage your wholesale dashboard {tab.name.toLowerCase()}</p>
                </div>
              </div>
              {tab.Component}
            </TabsContent>
          ))}
        </div>
      </Tabs>

    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex justify-center items-center bg-[#F6F6F6]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
