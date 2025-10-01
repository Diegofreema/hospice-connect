import { SmallLoader } from '@/features/shared/components/small-loader';

import { useHospice } from '@/components/context/hospice-context';
import { Title } from '@/components/title/Title';
import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { Wrapper } from '@/features/shared/components/wrapper';
import BottomSheet from '@gorhom/bottom-sheet';
import { Fragment, useRef } from 'react';
import { FlatList } from 'react-native';
import { useSelectAssignment } from '../hooks/use-select-assignment';
import { PostType } from '../types';
import { AssignmentSchedule } from './assignment-schedule';
import { Post } from './post';

type Props = {
  posts: PostType[];
  loadMore: () => void;
  loadingMore: boolean;
};

export const RenderPosts = ({ posts, loadMore, loadingMore }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { hospice } = useHospice();
  const clearSelected = useSelectAssignment((state) => state.clear);
  const onViewSchedule = () => {
    bottomSheetRef.current?.expand();
  };

  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
    clearSelected();
  };
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
            <Title size={30} textAlign="center" style={{ marginTop: 100 }}>
              No assignments
            </Title>
          }
        />
      </Wrapper>
      <CustomSheet
        ref={bottomSheetRef}
        onClose={onCloseSheet}
        title="View Schedule"
        customSnapPoints={['25%', '60%']}
      >
        <AssignmentSchedule />
      </CustomSheet>
    </Fragment>
  );
};
