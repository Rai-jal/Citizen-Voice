/**
 * Hook for fetching reports data
 */

import { useEffect, useState } from "react";
import { reportsService } from "../services/supabaseService";
import type { ReportWithAttachments } from "../types";

export function useReports() {
  const [reports, setReports] = useState<ReportWithAttachments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchReports() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await reportsService.getAllApproved();

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError);
        setReports([]);
      } else {
        setReports(data);
      }

      setIsLoading(false);
    }

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await reportsService.getAllApproved();

    if (fetchError) {
      setError(fetchError);
      setReports([]);
    } else {
      setReports(data);
    }

    setIsLoading(false);
  };

  return { reports, isLoading, error, refetch };
}
