import { SmallLoader } from '@/features/shared/components/small-loader';

import { CustomSheet } from '@/features/shared/components/custom-bottom-sheet';
import { Wrapper } from '@/features/shared/components/wrapper';
import BottomSheet from '@gorhom/bottom-sheet';
import { Fragment, useRef } from 'react';
import { FlatList } from 'react-native';
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
  const onViewSchedule = () => {
    bottomSheetRef.current?.expand();
  };

  const onCloseSheet = () => {
    bottomSheetRef.current?.close();
  };
  return (
    <Fragment>
      <Wrapper>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <Post post={item} onView={onViewSchedule} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ gap: 20, paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <SmallLoader /> : null}
          style={{ flex: 1 }}
        />
      </Wrapper>
      <CustomSheet
        ref={bottomSheetRef}
        onClose={onCloseSheet}
        title="View Schedule"
        customSnapPoints={['25%', '70%']}
      >
        <AssignmentSchedule />
      </CustomSheet>
    </Fragment>
  );
};
