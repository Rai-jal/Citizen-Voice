/**
 * Hook for fetching opportunities data
 */

import { useEffect, useState } from "react";
import { opportunitiesService } from "../services/supabaseService";
import type { Opportunity } from "../types";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOpportunities() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await opportunitiesService.getAll();

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError);
        setOpportunities([]);
      } else {
        setOpportunities(data);
      }

      setIsLoading(false);
    }

    fetchOpportunities();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await opportunitiesService.getAll();

    if (fetchError) {
      setError(fetchError);
      setOpportunities([]);
    } else {
      setOpportunities(data);
    }

    setIsLoading(false);
  };

  return { opportunities, isLoading, error, refetch };
}
