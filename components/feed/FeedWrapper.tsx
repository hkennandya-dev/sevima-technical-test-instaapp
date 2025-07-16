"use client";
import { FeedList } from "@/components/feed/FeedList";

export function FeedWrapper() {
    return (
        <main className="max-w-xl w-full mx-auto py-8 px-4">
            <FeedList />
        </main>
    );
}