"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { api } from "@/lib/axios";
import { PostCard } from "@/components/feed/PostCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { parseErrorMessage } from "@/lib/error";
import { Post } from "@/types/post";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

export function FeedList({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mode, setMode] = useState<"explore" | "my-posts">("explore");
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (pageToFetch: number, selectedMode = mode) => {
    try {
      isFetchingRef.current = true;
      const endpoint =
        selectedMode === "my-posts" ? "/posts/me" : "/posts";

      const res = await api.get(`${endpoint}?page=${pageToFetch}&paginate=10`);
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
  }, [mode]);

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
  }, [refreshKey, mode, fetchPosts]);

  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={mode}
        onValueChange={(val) => {
          if (val) setMode(val as "explore" | "my-posts");
        }}
      >
        <ToggleGroupItem value="explore" className="px-4 py-1">
          Explore
        </ToggleGroupItem>
        <ToggleGroupItem value="my-posts" className="px-4 py-1">
          My Posts
        </ToggleGroupItem>
      </ToggleGroup>

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
          <p className="text-center text-sm text-muted-foreground mt-4">
            {posts.length > 0 ? "No more posts." : "No posts available."}
          </p>
        }
      >
        <div className="flex flex-col gap-4 overflow-clip">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onRemoved={() => {
                setPosts([]);
                setPage(1);
                fetchPosts(1);
              }}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
