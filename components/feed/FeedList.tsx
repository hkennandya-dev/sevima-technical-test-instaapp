"use client";

import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { api } from "@/lib/axios";
import { PostCard } from "@/components/feed/PostCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { parseErrorMessage } from "@/lib/error";
import { Post } from "@/types/post";

export function FeedList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get(`/posts?page=${page}&paginate=10`);
      const newPosts: Post[] = res.data.data;
      const isNext = res.data.paginate.is_next;
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
      setHasMore(isNext);
    } catch (error: unknown) {
      const message = parseErrorMessage(error, "Failed to load posts.");
      toast.error(message);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <InfiniteScroll
      className="flex flex-col gap-4"
      dataLength={posts.length}
      next={fetchPosts}
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
