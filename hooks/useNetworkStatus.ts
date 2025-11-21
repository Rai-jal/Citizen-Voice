/**
 * Hook for network status detection
 * Uses fetch to check connectivity (graceful degradation)
 */

import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkNetworkStatus() {
      if (isChecking) return;

      setIsChecking(true);
      try {
        // Simple connectivity check using fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("https://www.google.com", {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (isMounted) {
          setIsConnected(true);
        }
      } catch (error) {
        // Network error - assume offline
        if (isMounted) {
          setIsConnected(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    // Initial check
    checkNetworkStatus();

    // Check network status periodically (every 10 seconds)
    const interval = setInterval(() => {
      checkNetworkStatus();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isChecking]);

  return {
    isConnected,
    isInternetReachable: isConnected,
    isOffline: !isConnected,
  };
}
