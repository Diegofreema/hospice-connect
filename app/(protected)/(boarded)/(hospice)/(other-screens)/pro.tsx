import { Paywall } from '@/features/hospice/components/paywall';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';

const Pro = () => {
  return (
    <Wrapper>
      <BackButton marginTop={0} />
      <Paywall />
    </Wrapper>
  );
};

export default Pro;
