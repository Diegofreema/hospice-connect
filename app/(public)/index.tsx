import { AccountSelector } from '@/features/authentication/components/account-selector';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const AccountType = () => {
  return (
    <Wrapper>
      <MyTitle title="Select account type" style={{ marginTop: 20 }} />
      <AccountSelector />
      <PrivacyTermsLink />
    </Wrapper>
  );
};

export default AccountType;
