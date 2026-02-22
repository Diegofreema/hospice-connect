import { useQuery } from '@tanstack/react-query';
import Purchases from 'react-native-purchases';
export const useGetCustomerRC = () => {
  const getCustomerRC = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.log(error);
    }
  };
  return useQuery({
    queryKey: ['customer-info'],
    queryFn: getCustomerRC,
    retry: 3,
  });
};
