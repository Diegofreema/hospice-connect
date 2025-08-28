import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Button } from '@/features/shared/components/button';
import { Input } from '@/features/shared/components/input';
import { Spacer } from '@/features/shared/components/spacer';
import View from '@/features/shared/components/view';
import { palette } from '@/theme';
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
} from '@tabler/icons-react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
export const LoginForm = () => {
  const [secured, setSecured] = useState(true);
  const toggleSecure = () => {
    setSecured(!secured);
  };
  return (
    <View gap={'m'}>
      <Input
        label="Email Address"
        placeholder="Johndoe@gmail.com"
        leftIcon={<IconMail color={palette.iconGrey} />}
      />
      <Input
        label="Password"
        placeholder="Enter password"
        leftIcon={<IconLock color={palette.iconGrey} />}
        rightIcon={
          <TouchableOpacity onPress={toggleSecure}>
            {secured ? (
              <IconEyeOff color={palette.iconGrey} />
            ) : (
              <IconEye color={palette.iconGrey} />
            )}
          </TouchableOpacity>
        }
        secureTextEntry={secured}
      />
      <PrivacyNoticeLink style={{ alignSelf: 'flex-end' }}>
        Forgot Password?
      </PrivacyNoticeLink>
      <Spacer />
      <Button label="Login" onPress={() => {}} />
    </View>
  );
};
