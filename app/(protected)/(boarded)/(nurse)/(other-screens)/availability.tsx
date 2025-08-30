import { Availability } from '@/features/nurse/components/availability';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';

const AvailabilityScreen = () => {
  return (
    <Wrapper>
      <BackButton marginTop={0} title="Availability" />
      <Availability />
    </Wrapper>
  );
};

export default AvailabilityScreen;
