import React from "react";
import Banner from "@/components/layout/Banner";
import HomeCategory from "@/components/layout/HomeCategories";
// import Group from "@/components/layout/Group";
import QrModal from "@/components/QrModal";
import Group2 from "@/components/layout/Group2";
import { SearchBar2 } from "@/components/SearchBar2";

export default function Home() {
  return (
    <div className="flex flex-col gap-1 bg-[#F6F6F6]">
      <QrModal />
      <Banner />
      <HomeCategory />
      <SearchBar2/>
      {/* <Group /> */}
      <Group2 />
    </div>
  );
}
