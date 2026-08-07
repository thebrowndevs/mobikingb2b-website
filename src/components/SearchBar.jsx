"use client"
import { Search } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { getSearchSuggestions } from "@/lib/services/operations/HomeApi";
import { useRouter, useSearchParams } from "next/navigation";
import { Cursor, useTypewriter } from "react-simple-typewriter";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.get("searchKey");
  const searchQuery = searchParams.get("q");

  const [animatedPlaceholder] = useTypewriter({
    words: [
      "Search for earphones...",
      "Looking for power bank?",
      "Find your perfect headphones...",
      "Browse our collection...",
    ],
    loop: 100,
    typeSpeed: 50,
    deleteSpeed: 20,
    delaySpeed: 100,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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
          setResults(
            data?.suggestions?.productSuggestions?.slice(0, 10) || []
          );
          setShowDropdown(true);
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

  const handleQuerySubmit = () => {
    if (!query) return;
    if (query.length <= 2) return;
    router.push(`/s?q=${encodeURIComponent(query)}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative flex-1 max-w-[400px] mx-2">
      {/* Search Box */}
      <div className="flex items-center gap-2 border border-slate-200 rounded-full px-4 py-2 bg-slate-50/50 focus-within:border-slate-350 focus-within:bg-white transition-all shadow-none">
        <button
          type="button"
          onClick={handleQuerySubmit}
          className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Search size={16} />
        </button>
        
        <input
          className="text-xs text-slate-700 w-full outline-none bg-transparent"
          placeholder={query ? "" : animatedPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuerySubmit();
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 300);
          }}
          onFocus={() => {
            if (query && results.length > 0) setShowDropdown(true);
          }}
        />
        {!query && (
          <span className="select-none text-xs text-slate-400 -ml-1">
            <Cursor cursorStyle="|" />
          </span>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-none max-h-64 overflow-y-auto z-50 p-1">
          {results.map((item, idx) => (
            <Link
              key={idx}
              href={`/s?searchKey=${encodeURIComponent(item)}`}
              className="flex items-center gap-2 px-3.5 py-2.5 hover:bg-slate-50 rounded-lg transition text-slate-700 text-xs font-semibold"
            >
              <span>{item}</span>
            </Link>
          ))}
          {isLoading && (
            <div className="px-3 py-2 text-xs text-slate-400 font-semibold">Loading suggestions...</div>
          )}
        </div>
      )}
    </div>
  );
}
