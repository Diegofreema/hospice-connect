import { BackButton } from '@/features/shared/components/back-button';
import { ViewRouteSheet } from '@/features/shared/components/view-route-sheet';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const RouteSheetPreviewScreen = () => {
  return (
    <Wrapper>
      <BackButton marginTop={0} title="View Route Sheet" />
      <ViewRouteSheet />
    </Wrapper>
  );
};

export default RouteSheetPreviewScreen;
