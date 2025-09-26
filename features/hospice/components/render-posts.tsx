import { SmallLoader } from '@/features/shared/components/small-loader';
import View from '@/features/shared/components/view';
import { LegendList } from '@legendapp/list';
import { PostType } from '../types';
import { Post } from './post';

type Props = {
  posts: PostType[];
  loadMore: () => void;
  loadingMore: boolean;
};

export const RenderPosts = ({ posts, loadMore, loadingMore }: Props) => {
  return (
    <View flex={1}>
      <LegendList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 20 }}
        recycleItems
        columnWrapperStyle={{ gap: 20 }}
        showsVerticalScrollIndicator={false}
        // onEndReached={loadMore}
        // onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <SmallLoader /> : null}
      />
    </View>
  );
};
