import { ErrorComponent } from '@/features/shared/components/error';
import { useGetPaymentMethods } from '@/hooks/use-get-payment-methods';
import React, { PropsWithChildren } from 'react';

export const AddedCardProvider = ({ children }: PropsWithChildren) => {
  const {
    data: paymentMethods = [],
    isLoading: loading,
    refetch: loadPaymentMethods,
    isError,
  } = useGetPaymentMethods();

  if (isError && !loading) {
    return (
      <ErrorComponent
        text="Failed to load payment methods"
        refetch={loadPaymentMethods}
      />
    );
  }

  // if (!paymentMethods?.length && !loading) {
  //   return (
  //     <UnderReview
  //       title="You haven't added your card yet"
  //       description="Please add your card to continue"
  //       type="card"
  //     />
  //   );
  // }

  return <>{children}</>;
};
