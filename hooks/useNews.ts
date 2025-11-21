/**
 * Hook for fetching news data
 */

import { useEffect, useState } from "react";
import { newsService } from "../services/supabaseService";
import type { News } from "../types";

export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchNews() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await newsService.getAll();

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError);
        setNews([]);
      } else {
        setNews(data);
      }

      setIsLoading(false);
    }

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await newsService.getAll();

    if (fetchError) {
      setError(fetchError);
      setNews([]);
    } else {
      setNews(data);
    }

    setIsLoading(false);
  };

  return { news, isLoading, error, refetch };
}
