import { AccountSelector } from '@/features/authentication/components/account-selector';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { BackButton } from '@/features/shared/components/back-button';
import { Button } from '@/features/shared/components/button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';
import { router } from 'expo-router';
import React, { useState } from 'react';

const AccountType = () => {
  const [selected, setSelected] = useState<'nurse' | 'hospice'>('nurse');
  const handleNavigation = () => {
    if (selected === 'nurse') {
      router.push('/nurse-create');
    } else {
      router.push('/hospice-create');
    }
  };
  return (
    <Wrapper>
      <BackButton marginTop={0} />
      <MyTitle title="Select account type" style={{ marginTop: 20 }} />
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
