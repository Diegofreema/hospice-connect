import { useNurse } from '@/components/context/nurse-context';
import { Billings } from '@/features/nurse/components/billings';
import { SmallLoader } from '@/features/shared/components/small-loader';
import React from 'react';
import { View } from 'react-native';

const BillingScreen = () => {
  const { nurse } = useNurse();

  if (nurse === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <SmallLoader size={30} />
      </View>
    );
  }

  if (!nurse) {
    return null;
  }

  return <Billings nurseId={nurse._id} />;
};

export default BillingScreen;
