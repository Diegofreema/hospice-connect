import { useNurse } from '@/components/context/nurse-context';
import { FetchNurseNotification } from '@/features/nurse/components/nurse-notifications';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const NurseNotification = () => {
  const { nurse } = useNurse();

  return (
    <Wrapper>
      <BackButton title="Notification" marginTop={0} marginLeft={-20} />
      <FetchNurseNotification nurseId={nurse?._id!} />
    </Wrapper>
  );
};

export default NurseNotification;
