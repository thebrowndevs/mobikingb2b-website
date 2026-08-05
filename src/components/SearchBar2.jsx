"use client"
import { Search } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { getSearchSuggestions } from "@/lib/services/operations/HomeApi";
import { useRouter } from "next/navigation";
import { useTypewriter } from "react-simple-typewriter";

export const SearchBar2 = () => {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [animatedPlaceholder] = useTypewriter({
       words: [
         "Search for earphones...",
         "Looking for power bank?",
         "Find your perfect headphones...",
         "Browse our collection...",
       ],
       loop: 100, // 0 or false => infinite loop
       typeSpeed: 50,
       deleteSpeed: 20,
       delaySpeed: 100,
     });
   

    // Debounced Keyword search
    useEffect(() => {
        if (!query) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        const t = setTimeout(() => {
            getSearchSuggestions(query)
                .then((data) => {
                    setResults(data?.suggestions?.productSuggestions?.slice(0, 10) || []);
                    setShowDropdown(true);
                })
                .then(() => {
                    console.log("Results");
                })
                .catch(() => {
                    setResults([]);
                    setShowDropdown(false);
                })
                .finally(() => setIsLoading(false));
        }, 400);

        return () => {
            clearTimeout(t);
            setIsLoading(false);
        };
    }, [query]);

    //Input Query Search
    const handleQuerySubmit = () => {
        if (!query) return;
        if (query.length <= 2) return;
        // console.log(query)
        router.push(`/s?q=${query}`)
        setShowDropdown(false);
    }

    return (
        <div className="relative flex-1 mb-6 px-1 md:hidden">
            {/* Search Box */}
            <div className="flex items-center gap-2 py-1.5 bg-white p-4 border border-blue-900 mx-2 rounded-sm px-5">
                <input
                    className="text-sm text-gray-700 w-full outline-none py-2"
                    placeholder={animatedPlaceholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key == "Enter") {
                            handleQuerySubmit();
                        }
                    }}
                    onBlur={() => {
                        setTimeout(() =>
                            setShowDropdown(false)
                            , 300);
                    }}
                    onFocus={() => {
                        if (query && results.length > 0) setShowDropdown(true);
                    }}
                />

                <button
                    type="button"
                    onClick={handleQuerySubmit}
                    className="cursor-pointer text-gray-500 hover:text-gray-800"
                >
                    <Search size={18} className="" />
                </button>
            </div>

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-sm shadow-lg max-h-64 overflow-y-auto z-50">
                    {results.map((item, idx) => (
                        <Link
                            key={idx}
                            href={`/s?searchKey=${item}`} // adjust route as per your backend
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition"
                        >
                            <span className="text-sm text-gray-700">{item}</span>
                        </Link>
                    ))}
                    {isLoading && (
                        <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
                    )}
                </div>
            )}
        </div>
    );
};


export default SearchBar2;