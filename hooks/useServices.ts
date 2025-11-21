/**
 * Hook for fetching services data
 */

import { useEffect, useState } from "react";
import { servicesService } from "../services/supabaseService";
import type { Service } from "../types";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchServices() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await servicesService.getAll();

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError);
        setServices([]);
      } else {
        setServices(data);
      }

      setIsLoading(false);
    }

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await servicesService.getAll();

    if (fetchError) {
      setError(fetchError);
      setServices([]);
    } else {
      setServices(data);
    }

    setIsLoading(false);
  };

  return { services, isLoading, error, refetch };
}
