"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { parseErrorMessage } from "@/lib/error";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export function PostDeleteDialog({
    open,
    onOpenChange,
    postId,
    onDeleted,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: number;
    onDeleted: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.delete(`/posts/${postId}`);
            toast.success(res.data.message);
            onDeleted();
            onOpenChange(false);
        } catch (err: unknown) {
            toast.error(parseErrorMessage(err, "Failed to delete post."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogTitle>Confirm delete</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                </AlertDialogDescription>
                <div className="mt-4 flex justify-end gap-2">
                    <AlertDialogCancel asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            type="submit"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}