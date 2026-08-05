import { banner1 } from "@/data/dummyData";
import Image from "next/image";
import Link from "next/link";

export default function Banner1() {
  return (
    <div className="lg:flex w-full hidden mx-auto px-4 py-6 justify-center items-center">
      <div className="flex flex-row w-full mx-auto gap-4">
        {banner1.map((item, index) => (
          <Link key={index} href={item.link} className="flex-1">
            <Image
              src={item.image}
              alt={item.alt || "Promotional banner"}
              width={1000}
              height={1000}
              className="w-full h-auto object-cover rounded-lg shadow-md "
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
