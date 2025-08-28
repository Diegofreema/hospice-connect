import { AccountSelector } from '@/features/authentication/components/account-selector';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { Button } from '@/features/shared/components/button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';
import React, { useState } from 'react';

const AccountType = () => {
  const [selected, setSelected] = useState<'nurse' | 'hospice'>('nurse');
  return (
    <Wrapper>
      <MyTitle title="Select account type" style={{ marginTop: 20 }} />
      <AccountSelector selected={selected} setSelected={setSelected} />
      <Button label="Next" onPress={() => {}} marginTop={'xl'} />
      <PrivacyTermsLink />
    </Wrapper>
  );
};

export default AccountType;
