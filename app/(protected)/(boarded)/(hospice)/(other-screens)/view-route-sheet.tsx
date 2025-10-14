import { RouteSheetById } from '@/features/hospice/components/route-sheet-by-id';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const ViewRouteSheet = () => {
  return (
    <Wrapper>
      <BackButton marginTop={0} title="Route Sheet" />
      <RouteSheetById />
    </Wrapper>
  );
};

export default ViewRouteSheet;
