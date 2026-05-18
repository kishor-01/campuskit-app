// src/hooks/use-username-availability.ts

'use client';

import { useState, useCallback, useRef } from 'react';

interface UsernameAvailability {
  available: boolean | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to check username availability in real-time
 */
export function useUsernameAvailability() {
  const [availability, setAvailability] = useState<UsernameAvailability>({
    available: null,
    loading: false,
    error: null
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setAvailability({ available: null, loading: false, error: null });
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      setAvailability({ available: null, loading: true, error: null });

      try {
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check username');
        }

        setAvailability({
          available: data.available,
          loading: false,
          error: null
        });
      } catch (error) {
        setAvailability({
          available: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to check username'
        });
      }
    }, 500); // 500ms debounce
  }, []);

  const resetAvailability = useCallback(() => {
    setAvailability({ available: null, loading: false, error: null });
  }, []);

  return {
    availability,
    checkUsername,
    resetAvailability
  };
}