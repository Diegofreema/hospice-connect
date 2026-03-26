import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

export const useGetAccount = () => {
  const { data: session } = authClient.useSession();
  return useQuery({
    queryKey: ['account-info', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts({
        query: {
          userId: session?.user?.id,
        },
      });
      if (error) {
        throw new Error(error.message || 'Failed to fetch account info');
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });
};
