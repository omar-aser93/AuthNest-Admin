import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { runGlobalSearch } from "./api";
import type { SearchResult } from "./types";

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 150);     // Reuse the app-wide custom debounce hook 
  const trimmed = debouncedQuery.trim();              // Trim whitespace
  const shouldSearch = trimmed.length >= 2;           // Minimum search length

  const [results, setResults] = useState<SearchResult[]>([]);      // Search results
  const [completedQuery, setCompletedQuery] = useState("");        // Last completed query

  useEffect(() => {
    if (!shouldSearch) return;   // no state writes — no warning

    let cancelled = false;

    runGlobalSearch(trimmed)
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setCompletedQuery(trimmed);  // inside async callback — allowed
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setCompletedQuery(trimmed);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed, shouldSearch]);

  // Derive the "searching" flag: the current query doesn't match the last
  // completed one yet. No setState, no cascading renders.
  const isStale = shouldSearch && trimmed !== completedQuery;

  return {
    results: shouldSearch ? results : [],
    isSearching: isStale,
  };
}