"use client";

import Image from "next/image";
import { MessageCircle, Loader2 } from "lucide-react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import dayjs from "@/lib/dayjs";
import { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Post } from "@/types/post";
import { parseErrorMessage } from "@/lib/error";

export function PostCard({ post: initialPost }: { post: Post }) {
    const [post, setPost] = useState(initialPost);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        try {
            setLoading(true);
            if (post.is_liked) {
                await api.delete(`/posts/${post.id}/like`);
            } else {
                await api.post(`/posts/${post.id}/like`);
            }
            setPost((prev: Post) => ({
                ...prev,
                is_liked: !prev.is_liked,
                likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
            }));
        } catch (error: unknown) {
            const message = parseErrorMessage(error, "Failed to update like.");
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 bg-background">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <p className="font-semibold">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">@{post.user.username}</p>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground cursor-default">
                            {dayjs(post.created_at).fromNow()}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        {dayjs(post.created_at).format("YYYY-MM-DD HH:mm")}
                    </TooltipContent>
                </Tooltip>
            </div>

            {post.caption && <p className="mb-2 whitespace-pre-line">{post.caption}</p>}

            {post.image_path && (
                <div className="relative w-full h-auto max-h-[500px] rounded-md overflow-hidden">
                    <Image
                        src={post.image_path}
                        alt="Post image"
                        width={800}
                        height={500}
                        className="rounded-md object-contain"
                    />
                </div>
            )}

            <div className="flex items-center gap-4 mt-4">
                <button
                    className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
                    onClick={handleLike}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : post.is_liked ? (
                        <AiFillHeart className="h-4 w-4 text-destructive" />
                    ) : (
                        <AiOutlineHeart className="h-4 w-4" />
                    )}
                    <span>{post.likes_count}</span>
                </button>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                </div>
            </div>
        </div>
    );
}
