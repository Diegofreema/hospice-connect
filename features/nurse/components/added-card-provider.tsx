import { useNurse } from '@/components/context/nurse-context';
import { api } from '@/convex/_generated/api';
import { UnderReview } from '@/features/shared/components/under-review';
import { useQuery } from 'convex/react';
import React, { PropsWithChildren } from 'react';

export const AddedCardProvider = ({ children }: PropsWithChildren) => {
  const { nurse } = useNurse();
  const hasAddedCard = useQuery(
    api.nurses.hasAddedCard,
    nurse
      ? {
          nurseId: nurse?._id,
        }
      : 'skip',
  );

  if (!hasAddedCard) {
    return (
      <UnderReview
        title="You haven't added your card yet"
        description="Please add your card to continue"
        type="card"
      />
    );
  }

  return <>{children}</>;
};
