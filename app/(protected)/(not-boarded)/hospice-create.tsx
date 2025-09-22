import { Subtitle } from '@/components/subtitle/Subtitle';
import { BusinessInformation } from '@/features/hospice/steps/business-information';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const HospiceCreateScreen = () => {
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <MyTitle title="Business Information" />
        <Subtitle style={{ color: 'black' }}>
          Please ensure the accuracy of all Information
        </Subtitle>
        <BusinessInformation />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default HospiceCreateScreen;
