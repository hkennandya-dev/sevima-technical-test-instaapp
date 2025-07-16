"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { api } from "@/lib/axios";
import { PostCard } from "@/components/feed/PostCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { parseErrorMessage } from "@/lib/error";
import { Post } from "@/types/post";

export function FeedList({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchPosts = async (pageToFetch: number) => {
    try {
      isFetchingRef.current = true;
      const res = await api.get(`/posts?page=${pageToFetch}&paginate=10`);
      const newPosts: Post[] = res.data.data;
      const isNext = res.data.paginate.is_next;

      setPosts((prev) =>
        pageToFetch === 1 ? newPosts : [...prev, ...newPosts]
      );
      setHasMore(isNext);
      setPage(pageToFetch + 1);
    } catch (error: unknown) {
      const message = parseErrorMessage(error, "Failed to load posts.");
      toast.error(message);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const fetchNext = () => {
    if (!isFetchingRef.current && hasMore) {
      fetchPosts(page);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1);
  }, [refreshKey]);

  return (
    <InfiniteScroll
      className="flex flex-col gap-4"
      dataLength={posts.length}
      next={fetchNext}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
      endMessage={
        <p className="text-center text-sm text-muted-foreground">
          No more posts.
        </p>
      }
    >
      <div className="flex flex-col gap-4 overflow-clip">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
