import { VerifyEmailForm } from '@/features/authentication/components/form/verify-email-form';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Text } from '@/features/shared/components/text';
import { Wrapper } from '@/features/shared/components/wrapper';

import { useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const Verify = () => {
  const { email, isForgotPassword } = useLocalSearchParams<{
    email: string;
    isForgotPassword: 'true' | 'false';
  }>();
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <MyTitle title="Enter Code" />
        <Text size="medium">
          We have sent code to {email || 'example@example.com'} check your email
          including spam/junk folder.
        </Text>
        <Spacer height={50} />
        <VerifyEmailForm email={email} isForgotPassword={isForgotPassword} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default Verify;
