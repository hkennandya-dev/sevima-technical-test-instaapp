"use client";

import Image from "next/image";
import {
    MessageCircle,
    Loader2,
    MoreHorizontal,
    X,
    ZoomIn,
    ZoomOut,
    Pencil,
    Trash2,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/lib/axios";
import { parseErrorMessage } from "@/lib/error";
import dayjs from "@/lib/dayjs";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user";
import { useState } from "react";
import { Post } from "@/types/post";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostEditDialog } from "./PostEditDialog";
import { PostDeleteDialog } from "./PostDeleteDialog";

export function PostCard({
    post: initialPost,
    onRemoved,
}: {
    post: Post;
    onRemoved?: () => void;
}) {
    const [post, setPost] = useState(initialPost);
    const [loading, setLoading] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const user = useUserStore((state) => state.user);

    const handleLike = async () => {
        try {
            setLoading(true);
            if (post.is_liked) {
                await api.delete(`/posts/${post.id}/like`);
            } else {
                await api.post(`/posts/${post.id}/like`);
            }
            setPost((p) => ({
                ...p,
                is_liked: !p.is_liked,
                likes_count: p.is_liked
                    ? p.likes_count - 1
                    : p.likes_count + 1,
            }));
        } catch (err: unknown) {
            toast.error(parseErrorMessage(err, "Failed to update like."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 bg-background">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-semibold">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">@{post.user.username}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {user?.id === post.user_id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => setEditOpen(true)}
                                    className="cursor-pointer flex justify-between"
                                >
                                    <span>Edit</span>
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setDeleteOpen(true)}
                                    className="cursor-pointer flex justify-between"
                                >
                                    <span>Delete</span>
                                    <Trash2 className="w-4 h-4" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground cursor-default">
                                {dayjs(post.created_at).fromNow()}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            {dayjs(post.created_at).format("YYYY-MM-DD HH:mm")}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {post.caption && <p className="mb-2 whitespace-pre-line">{post.caption}</p>}

            {post.image_path && (
                <div className="relative w-full h-auto max-h-[500px] rounded-md overflow-hidden">
                    <Image
                        src={post.image_path}
                        alt="Post image"
                        width={800}
                        height={500}
                        className="rounded-md object-contain cursor-pointer"
                        onClick={() => setIsViewerOpen(true)}
                    />
                    {isViewerOpen && (
                        <Lightbox
                            open={isViewerOpen}
                            close={() => setIsViewerOpen(false)}
                            slides={[{ src: post.image_path }]}
                            plugins={[Zoom]}
                            styles={{
                                container: {
                                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                                    zIndex: 100,
                                },
                            }}
                            controller={{ disableSwipeNavigation: true }}
                            zoom={{
                                maxZoomPixelRatio: 3,
                                zoomInMultiplier: 2,
                                doubleTapDelay: 300,
                            }}
                            render={{
                                iconNext: () => null,
                                iconPrev: () => null,
                                iconZoomIn: () => (
                                    <ZoomIn className="w-6 h-6 text-inherit" />
                                ),
                                iconZoomOut: () => (
                                    <ZoomOut className="w-6 h-6 text-inherit" />
                                ),
                                iconClose: () => <X className="w-6 h-6 text-inherit" />,
                            }}
                        />
                    )}
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

            <PostEditDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                postId={post.id}
                currentCaption={post.caption ?? undefined}
                image={post.image_path}
                onUpdated={(newCaption) =>
                    setPost((prev) => ({ ...prev, caption: newCaption }))
                }
            />

            <PostDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                postId={post.id}
                onDeleted={() => {
                    onRemoved?.();
                }}
            />
        </div>
    );
}