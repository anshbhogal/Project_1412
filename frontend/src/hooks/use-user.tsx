import { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth'; // Adjust path as needed

interface UserData {
  id: number;
  email: string;
}

interface UseUserResult {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch user data');
      setUser(null); // Clear user data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, isLoading, error, refetch: fetchUser };
}
