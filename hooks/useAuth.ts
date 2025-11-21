/**
 * Hook for authentication
 */

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: fetchError,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (fetchError) {
          setError(new Error(fetchError.message));
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(new Error(error.message));
      return false;
    }
    setUser(null);
    return true;
  };

  return { user, isLoading, error, signOut };
}
