/* eslint-disable prettier/prettier */

import { ErrorComponent } from '@/features/shared/components/error';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useGetOfferings } from '@/hooks/rc/use-get-offerings';

export const Paywall = () => {
  const {
    data: offerings,
    isPending,
    isError,
    refetch,
    error,
  } = useGetOfferings();
  console.log({ error });

  if (isPending) {
    return <SmallLoader size={50} />;
  }
  if (isError) {
    return <ErrorComponent refetch={refetch} text="Something went wrong" />;
  }

  console.log({ offerings });
  return <Wrapper></Wrapper>;
};
