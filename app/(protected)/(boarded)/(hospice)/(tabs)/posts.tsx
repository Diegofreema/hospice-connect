import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { RenderPosts } from '@/features/hospice/components/render-posts';
import { Wrapper } from '@/features/shared/components/wrapper';
import { usePaginatedQuery } from 'convex/react';
import { useCallback } from 'react';

export default function TabTwoScreen() {
  const { hospice } = useHospice();
  const { loadMore, results, status } = usePaginatedQuery(
    api.posts.getOurPosts,
    { hospiceId: hospice?._id! },
    { initialNumItems: 25 }
  );
  const handleFetchMore = useCallback(() => {
    if (status === 'CanLoadMore') {
      loadMore(25);
    }
  }, [status, loadMore]);
  return (
    <Wrapper>
      {/* <BackButton title="Posts" marginTop={0} /> */}
      <RenderPosts
        posts={results}
        loadMore={handleFetchMore}
        loadingMore={status === 'LoadingMore'}
      />
    </Wrapper>
  );
}
