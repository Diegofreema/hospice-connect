import { BackButton } from '@/features/shared/components/back-button';
import { DeleteAccount } from '@/features/shared/components/delete-account';
import { Wrapper } from '@/features/shared/components/wrapper';

const DeleteAccountScreen = () => {
  return (
    <Wrapper>
      <BackButton marginTop={0} title="Delete Account" />
      <DeleteAccount />
    </Wrapper>
  );
};

export default DeleteAccountScreen;
