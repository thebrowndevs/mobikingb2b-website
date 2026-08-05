"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Profile from "./_components/Profile";
import Address from "./_components/Address";
import Orders from "./_components/Orders";
import Wishlist from "./_components/Wishlist";
import Cart from "./_components/Cart";

function AccountContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { name: "My Profile", value: "profile", Component: <Profile /> },
    { name: "My Cart", value: "cart", Component: <Cart /> },
    { name: "My Address", value: "address", Component: <Address /> },
    { name: "My Orders", value: "orders", Component: <Orders /> },
    { name: "My Wishlist", value: "wishlist", Component: <Wishlist /> },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].value);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some((t) => t.value === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    router.replace(`/account?tab=${value}`, { scroll: false });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex mx-auto w-full py-4 lg:px-4">
      <div className="w-full rounded-lg p-4">
        <Breadcrumb />
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full flex md:flex-row flex-col gap-6"
        >
          <TabsList className="flex md:flex-col flex-row overflow-x-auto gap-4 items-start justify-center bg-gray-100 h-full md:w-auto w-full p-2">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-4 py-2 text-base rounded-md hover:bg-white data-[state=active]:bg-white"
              >
                <span className="hidden md:inline">{tab.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="bg-gray-100 border h-full border-gray-200 rounded-lg p-4 sm:p-6"
                forceMount={activeTab === tab.value}
              >
                <h2 className="text-xl font-semibold mb-2">{tab.name}</h2>
                {tab.Component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
