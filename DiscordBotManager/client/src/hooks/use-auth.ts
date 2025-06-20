
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const login = () => {
    window.location.href = "/auth/discord";
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
