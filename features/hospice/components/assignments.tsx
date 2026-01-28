import { useHospice } from '@/components/context/hospice-context';
import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Wrapper } from '@/features/shared/components/wrapper';
import type BottomSheet from '@gorhom/bottom-sheet';
import { LegendList } from '@legendapp/list';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import React, { Fragment, useRef } from 'react';
import { View } from 'react-native';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { AssignmentPost } from './assignment-post';
import { SelectSchedule } from './select-schedule';

export const Assignments = () => {
  const { hospice } = useHospice();
  const { discipline } = useLocalSearchParams<{ discipline: string }>();
  const assignmentId = useSelectAssignment((state) => state.id);
  const data = useQuery(api.posts.getOurAvailablePosts, {
    hospiceId: hospice?._id!,
    discipline: discipline as 'RN' | 'LVN' | 'HHA',
  });
  const bottomSheetRef = useRef<BottomSheet>(null);
  if (data === undefined) {
    return <SmallLoader size={50} />;
  }
  if (!hospice) return null;

  const onOpen = () => {
    bottomSheetRef.current?.expand();
  };

  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
  };
  return (
    <Fragment>
      <Wrapper>
        <LegendList
          data={data}
          renderItem={({ item }) => (
            <AssignmentPost post={item} onOpen={onOpen} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          ListEmptyComponent={
            <Title size={30} textAlign="center" style={{ marginTop: 100 }}>
              No available assignments found
            </Title>
          }
        />
      </Wrapper>
      <CustomSheet
        ref={bottomSheetRef}
        onClose={onCloseSheet}
        title="View Schedule"
        customSnapPoints={['25%', '80%']}
      >
        {assignmentId ? (
          <SelectSchedule
            id={assignmentId}
            hospiceId={hospice._id!}
            name={hospice.businessName!}
            onClose={onCloseSheet}
          />
        ) : (
          <View />
        )}
      </CustomSheet>
    </Fragment>
  );
};
