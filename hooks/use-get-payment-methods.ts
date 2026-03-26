import { useNurse } from '@/components/context/nurse-context';
import { api } from '@/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { useAction } from 'convex/react';

export const useGetPaymentMethods = () => {
  const { nurse } = useNurse();
  const nurseId = nurse?._id;
  const getPaymentMethods = useAction(
    api.nursePaymentsActions.getPaymentMethods,
  );

  return useQuery({
    queryKey: ['payment-methods', nurseId],
    queryFn: async () => {
      if (!nurseId) return [];
      return await getPaymentMethods({ nurseId });
    },
    enabled: !!nurseId,
  });
};
