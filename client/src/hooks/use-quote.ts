import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Quote } from "@shared/schema";

export function useRandomQuote() {
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["/api/quotes"],
    queryFn: async () => {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return res.json() as Promise<Quote[]>;
    },
  });

  const quote = useMemo(() => {
    if (quotes.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, [quotes]);

  return { quote, isLoading };
}
