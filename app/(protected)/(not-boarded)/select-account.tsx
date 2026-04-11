import { Subtitle } from '@/components/subtitle/Subtitle';
import { AccountSelector } from '@/features/authentication/components/account-selector';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { BackButton } from '@/features/shared/components/back-button';
import { Button } from '@/features/shared/components/button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';
import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import React, { useState } from 'react';

const AccountType = () => {
  const [selected, setSelected] = useState<'nurse' | 'hospice'>('nurse');
  const handleNavigation = async () => {
    if (selected === 'nurse') {
      router.push('/nurse-create');
    } else {
      router.push('/hospice-create');
    }
  };
  const onPress = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Wrapper gap="lg">
      <BackButton marginTop={0} onPress={onPress} />
      <MyTitle title="Complete your profile" style={{ marginTop: 20 }} />
      <Subtitle style={{ marginTop: 20, textAlign: 'center' }}>
        Select account type
      </Subtitle>
      <AccountSelector selected={selected} setSelected={setSelected} />
      <Button
        title="Next"
        onPress={handleNavigation}
        style={{ marginTop: 20 }}
      />
      <PrivacyTermsLink />
    </Wrapper>
  );
};

export default AccountType;
