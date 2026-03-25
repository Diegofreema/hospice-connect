import { Subtitle } from '@/components/subtitle/Subtitle';
import { VerifyEmailForm } from '@/features/authentication/components/form/verify-email-form';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';

import { useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const Verify = () => {
  const { email } = useLocalSearchParams<{
    email: string;
  }>();
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <MyTitle title="Enter Code" />
        <Subtitle isBlack>
          We have sent code to {email || 'example@example.com'}
        </Subtitle>
        <Spacer height={50} />
        <VerifyEmailForm email={email} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default Verify;
