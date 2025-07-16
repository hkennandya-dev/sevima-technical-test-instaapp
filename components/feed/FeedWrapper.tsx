"use client";

import { FeedList } from "@/components/feed/FeedList";
import { PostForm } from "@/components/feed/PostForm";
import { useCallback, useState } from "react";
import { FeedAccount } from "./FeedAccount";

export default function FeedWrapper() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <main className="max-w-xl w-full mx-auto py-8 px-4 space-y-10">
      <FeedAccount />
      <PostForm onSuccess={handleSuccess} />
      <FeedList refreshKey={refreshKey} />
    </main>
  );
}
