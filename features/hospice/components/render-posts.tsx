import { SmallLoader } from '@/features/shared/components/small-loader';

import { useHospice } from '@/components/context/hospice-context';
import { Title } from '@/components/title/Title';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { Wrapper } from '@/features/shared/components/wrapper';
import type BottomSheet from '@gorhom/bottom-sheet';
import { useQuery } from 'convex/react';
import { type FunctionReturnType } from 'convex/server';
import { router } from 'expo-router';
import { Fragment, useCallback, useRef } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useGetScheduleId } from '../hooks/use-get-schedule-id';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { AssignmentSchedule } from './assignment-schedule';
import { CancelSchedule } from './cancel-schedule';
import { EditSchedule } from './edit-schedule';
import { Post } from './post';
import { RateNurse } from './rate-nurse';
import { ReopenCase } from './reopen-case';

type Props = {
  posts: FunctionReturnType<typeof api.posts.getOurPosts>['page'];
  loadMore: () => void;
  loadingMore: boolean;
};

export const RenderPosts = ({ posts, loadMore, loadingMore }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefCancelSchedule = useRef<BottomSheet>(null);
  const bottomSheetRefEditSchedule = useRef<BottomSheet>(null);
  const bottomSheetRefRateNurse = useRef<BottomSheet>(null);
  const bottomSheetRefReOpenAssignment = useRef<BottomSheet>(null);
  const scheduleId = useGetScheduleId((state) => state.id);

  const initialValues = useQuery(
    api.schedules.getSchedule,
    scheduleId
      ? {
          scheduleId,
        }
      : 'skip',
  );
  const { hospice } = useHospice();
  const clearSelected = useSelectAssignment((state) => state.clear);
  const onViewSchedule = () => {
    bottomSheetRef.current?.expand();
  };

  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
    clearSelected();
  };
  const onCloseSheetRateNurse = () => {
    bottomSheetRefRateNurse.current?.close();
  };
  const onCloseSheetCancelSchedule = () => {
    bottomSheetRefCancelSchedule.current?.close();
  };
  const onCloseSheetEditSchedule = () => {
    bottomSheetRefEditSchedule.current?.close();
  };
  const onCancelSchedule = useCallback(() => {
    bottomSheetRef.current?.close();
    bottomSheetRefCancelSchedule.current?.expand();
  }, []);
  const onEditSchedule = useCallback(() => {
    bottomSheetRef.current?.close();
    bottomSheetRefEditSchedule.current?.expand();
  }, []);
  const onRateNurse = useCallback(() => {
    bottomSheetRef.current?.close();
    bottomSheetRefRateNurse.current?.expand();
  }, []);
  const onViewRouteSheet = useCallback(
    (assignmentId: Id<'assignments'>, nurseId: Id<'nurses'>) => {
      router.push(
        `/route-sheet-preview?assignmentId=${assignmentId}&nurseId=${nurseId}`,
      );
      console.log({ assignmentId, nurseId });

      bottomSheetRef.current?.close();
    },
    [],
  );
  const onReOpenAssignment = useCallback(() => {
    bottomSheetRefReOpenAssignment.current?.expand();
  }, []);
  const onCloseReOpenAssignment = useCallback(() => {
    bottomSheetRefReOpenAssignment.current?.close();
  }, []);
  return (
    <Fragment>
      <Wrapper>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <Post
              post={item}
              onView={onViewSchedule}
              hospiceId={hospice?._id!}
              onOpenReOpenAssignment={onReOpenAssignment}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <SmallLoader /> : null}
          style={{ flex: 1 }}
          ListEmptyComponent={
            <View gap="md">
              <Title size={30} textAlign="center" style={{ marginTop: 100 }}>
                No assignments yet
              </Title>
              <TouchableOpacity
                onPress={() => router.push('/create')}
                style={{
                  marginTop: 20,
                  alignSelf: 'center',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: '#007AFF',
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}
                >
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </Wrapper>
      <CustomSheet
        ref={bottomSheetRef}
        onClose={onCloseSheet}
        title="View Schedule"
        customSnapPoints={['25%', '60%']}
      >
        <AssignmentSchedule
          onCancelSchedule={onCancelSchedule}
          onEditSchedule={onEditSchedule}
          onRateNurse={onRateNurse}
          onViewRouteSheet={onViewRouteSheet}
        />
      </CustomSheet>
      <CustomSheet
        ref={bottomSheetRefRateNurse}
        onClose={onCloseSheetRateNurse}
        title="Rate Nurse"
        customSnapPoints={['25%', '50%']}
      >
        <RateNurse onClose={onCloseSheetRateNurse} />
      </CustomSheet>
      <CustomSheet
        ref={bottomSheetRefCancelSchedule}
        onClose={onCloseSheetCancelSchedule}
        title="Cancel Schedule?"
        customSnapPoints={['25%', '30%']}
      >
        <CancelSchedule onClose={onCloseSheetCancelSchedule} />
      </CustomSheet>
      <CustomSheet
        ref={bottomSheetRefReOpenAssignment}
        onClose={onCloseReOpenAssignment}
        title="Reopen case"
        customSnapPoints={['25%', '80%']}
      >
        <ReopenCase onClose={onCloseReOpenAssignment} />
      </CustomSheet>
      <CustomSheet
        ref={bottomSheetRefEditSchedule}
        onClose={onCloseSheetEditSchedule}
        title="Edit Schedule"
        customSnapPoints={['25%', '70%']}
      >
        {initialValues === undefined || initialValues === null ? (
          <SmallLoader size={50} />
        ) : (
          <EditSchedule
            onClose={onCloseSheetEditSchedule}
            initialValues={initialValues}
          />
        )}
      </CustomSheet>
    </Fragment>
  );
};
