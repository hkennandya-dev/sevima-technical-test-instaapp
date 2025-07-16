"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Pencil, Trash, MoreHorizontal, Loader2 } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { useUserStore } from "@/stores/user";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { parseErrorMessage } from "@/lib/error";
import { Comment } from "@/types/comment";

export function CommentCard({
    comment,
    postId,
    onUpdated,
    onDeleted,
}: {
    comment: Comment;
    postId: number;
    onUpdated: (c: Comment) => void;
    onDeleted: (id: number) => void;
}) {
    const user = useUserStore((s) => s.user);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [submitting, setSubmitting] = useState(false);

    const handleEdit = async () => {
        try {
            setSubmitting(true);
            const res = await api.put(`/posts/${postId}/comment/${comment.id}`, {
                content: editContent,
            });
            toast.success(res.data.message);
            onUpdated({ ...comment, content: editContent });
            setEditOpen(false);
        } catch (e) {
            toast.error(parseErrorMessage(e, "Failed to update comment."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSubmitting(true);
            const res = await api.delete(`/posts/${postId}/comment/${comment.id}`);
            toast.success(res.data.message ?? "Comment deleted successfully.");
            onDeleted(comment.id);
            setDeleteOpen(false);
        } catch (e) {
            toast.error(parseErrorMessage(e, "Failed to delete comment."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border rounded-md p-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold">{comment.user.name}</p>
                    <p className="text-xs text-muted-foreground">@{comment.user.username}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {user?.id === comment.user_id && (
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
                                    <Trash className="w-4 h-4" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground cursor-default">
                                {dayjs(comment.created_at).fromNow()}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            {dayjs(comment.created_at).format("YYYY-MM-DD HH:mm")}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <p className="text-sm mt-2 whitespace-pre-line">{comment.content}</p>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Comment</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        disabled={submitting}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={submitting || !editContent.trim()}>
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Edit"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm action</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this comment? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
