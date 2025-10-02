import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { RenderPosts } from '@/features/hospice/components/render-posts';
import { SmallLoader } from '@/features/shared/components/small-loader';
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
  if (status === 'LoadingFirstPage') {
    return <SmallLoader size={30} />;
  }
  return (
    <RenderPosts
      posts={results}
      loadMore={handleFetchMore}
      loadingMore={status === 'LoadingMore'}
    />
  );
}
