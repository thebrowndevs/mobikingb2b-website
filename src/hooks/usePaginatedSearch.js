// hooks/usePaginatedSearch.js
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSearchResultsPaginated, getBrands } from "@/lib/services/operations/HomeApi";

export function usePaginatedSearch({
    initialQuery = "",
    initialSearchKey = "",
    initialLimit = 12,
    nextLimit = 6,
    priceFrom,
    priceTo,
    priceSort,
    selectedBrands,
    debounceMs = 150,
}) {
    const [query, setQuery] = useState(initialQuery);
    const [searchKey, setSearchKey] = useState(initialSearchKey);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [lastIndex, setLastIndex] = useState(null);
    const [error, setError] = useState(null);

    // to know if next fetch should use initialLimit or nextLimit
    const isFirstLoadRef = useRef(true);
    // debounce timer
    const debounceRef = useRef(null);
    // cache latest filters to use inside callbacks
    const filtersRef = useRef({ priceFrom, priceTo, priceSort, selectedBrands });

    useEffect(() => {
        filtersRef.current = { priceFrom, priceTo, priceSort, selectedBrands };
    }, [priceFrom, priceTo, priceSort, selectedBrands]);

    const resetAndFetch = useCallback(
        (q = query, sk = searchKey) => {
            // cancel pending
            if (debounceRef.current) clearTimeout(debounceRef.current);
            isFirstLoadRef.current = true;
            setResults([]);
            setLastIndex(null);
            setHasMore(false);
            setError(null);

            debounceRef.current = setTimeout(async () => {
                setIsLoading(true);
                try {
                    const { data, lastIndex: li, hasMore: hm } = await getSearchResultsPaginated({
                        query: q,
                        searchKey: sk,
                        limit: initialLimit,
                        lastIndex: null,
                        ...filtersRef.current,
                    });
                    setResults(data || []);
                    setLastIndex(li ?? null);
                    setHasMore(Boolean(hm));
                } catch (err) {
                    console.error(err);
                    setError(err);
                } finally {
                    setIsLoading(false);
                }
            }, debounceMs);
        },
        [initialLimit, debounceMs, query, searchKey]
    );

    // trigger reset when searchKey or filters change
    useEffect(() => {
        resetAndFetch(query, searchKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchKey, priceFrom, priceTo, priceSort, JSON.stringify(selectedBrands)]);

    // to be called externally when typing query
    useEffect(() => {
        resetAndFetch(query, searchKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const loadMore = useCallback(async () => {
        if (!hasMore || isFetchingMore) return;
        setIsFetchingMore(true);
        try {
            const { data, lastIndex: li, hasMore: hm } = await getSearchResultsPaginated({
                query,
                searchKey,
                limit: isFirstLoadRef.current ? initialLimit : nextLimit,
                lastIndex,
                ...filtersRef.current,
            });

            // after first load, guarantee next loads use nextLimit
            isFirstLoadRef.current = false;

            setResults((prev) => [...prev, ...(data || [])]);
            setLastIndex(li ?? null);
            setHasMore(Boolean(hm));
        } catch (err) {
            console.error("loadMore error", err);
            setError(err);
        } finally {
            setIsFetchingMore(false);
        }
    }, [hasMore, isFetchingMore, query, searchKey, lastIndex, initialLimit, nextLimit]);

    const clearAll = useCallback(() => {
        setQuery("");
        setResults([]);
        setLastIndex(null);
        setHasMore(false);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        searchKey,
        setSearchKey,
        results,
        isLoading,
        isFetchingMore,
        hasMore,
        lastIndex,
        loadMore,
        clearAll,
        setResults,
        error,
    };
}
