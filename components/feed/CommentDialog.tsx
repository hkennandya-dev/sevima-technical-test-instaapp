"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroll-component";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import { parseErrorMessage } from "@/lib/error";
import { Comment } from "@/types/comment";
import { CommentCard } from "./CommentCard";
import { useUserStore } from "@/stores/user";

const commentSchema = z.object({
    content: z.string().min(1, "Comment is required"),
});

type CommentForm = z.infer<typeof commentSchema>;

export function CommentDialog({ postId, count }: { postId: number; count: number }) {
    const [open, setOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [commentCount, setCommentCount] = useState(count);
    const isFetchingRef = useRef(false);
    const { user } = useUserStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm<CommentForm>({
        resolver: zodResolver(commentSchema),
        mode: "onChange",
    });

    const fetchComments = async (pageToFetch: number) => {
        try {
            isFetchingRef.current = true;
            const res = await api.get(`/posts/${postId}/comments?page=${pageToFetch}&paginate=5`);
            const data = res.data.data;
            setComments((prev) =>
                pageToFetch === 1 ? data : [...prev, ...data]
            );
            setHasMore(res.data.paginate.is_next);
            setPage(pageToFetch + 1);
        } catch (e) {
            toast.error(parseErrorMessage(e, "Failed to load comments."));
        } finally {
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        if (open) {
            setComments([]);
            setPage(1);
            setHasMore(true);
            fetchComments(1);
        }
    }, [open]);

    const onSubmit = async (data: CommentForm) => {
        try {
            const res = await api.post(`/posts/${postId}/comment`, data);
            toast.success(res.data.message);
            reset();
            const newComment: Comment = { ...res.data.data, user };
            setComments((prev) => [newComment, ...prev]);
            setCommentCount((prev) => prev + 1);
        } catch (e) {
            toast.error(parseErrorMessage(e, "Failed to post comment."));
        }
    };

    const onUpdate = (updated: Comment) => {
        setComments((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
        );
    };

    const onDelete = (id: number) => {
        setComments((prev) => prev.filter((c) => c.id !== id));
        setCommentCount((prev) => Math.max(prev - 1, 0));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <button
                onClick={() => setOpen(true)}
                className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
            >
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount}</span>
            </button>
            <DialogContent className="lg:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogTitle>Comments</DialogTitle>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mt-4">
                    <Textarea
                        placeholder="Write a comment..."
                        {...register("content")}
                        disabled={isSubmitting}
                    />
                    {errors.content && (
                        <p className="text-sm text-destructive">{errors.content.message}</p>
                    )}
                    <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Comment"}
                    </Button>
                </form>

                <div className="mt-6">
                    <InfiniteScroll
                        dataLength={comments.length}
                        next={() => fetchComments(page)}
                        hasMore={hasMore}
                        loader={
                            <div className="flex justify-center py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        }
                        scrollableTarget="scrollableDiv"
                        className="space-y-3"
                    >
                        {comments.map((comment) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                postId={postId}
                                onUpdated={onUpdate}
                                onDeleted={onDelete}
                            />
                        ))}
                    </InfiniteScroll>

                    {comments.length === 0 && !hasMore && (
                        <p className="text-center text-muted-foreground text-sm py-4">
                            No comments yet.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}