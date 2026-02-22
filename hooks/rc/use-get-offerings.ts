import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

export const useGetOfferings = () => {
  const getOfferings = async () => {
    try {
      if (Platform.OS === 'ios') {
        return null;
      }
      const offerings = await Purchases.getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length === 0
      ) {
        throw new Error('No offerings available');
      }
      return offerings;
    } catch {
      throw new Error('Failed to load offerings');
    }
  };
  return useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    retry: 3,
  });
};
