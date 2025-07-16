"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { parseErrorMessage } from "@/lib/error";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const buildSchema = (hasImage: boolean) =>
    z.object({
        caption: hasImage ? z.string().optional() : z.string().min(1, "Caption is required."),
    });

type Form = {
    caption: string | undefined;
};

export function PostEditDialog({
    open,
    onOpenChange,
    postId,
    currentCaption,
    image,
    onUpdated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: number;
    currentCaption?: string;
    image?: string | null;
    onUpdated: (newCaption: string) => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const schema = buildSchema(!!image);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: { caption: currentCaption },
    });

    const onSubmit = async (data: Form) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(`/posts/${postId}`, { caption: data.caption });
            toast.success(res.data.message);
            onUpdated(data.caption ?? "");
            reset({ caption: data.caption });
            onOpenChange(false);
        } catch (err: unknown) {
            toast.error(parseErrorMessage(err, "Failed to update post."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="lg:max-w-xl">
                <DialogTitle>Edit Post</DialogTitle>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-4">
                        <Label htmlFor="caption">Caption</Label>
                        <Textarea id="caption" {...register("caption")} className="resize-none mt-1" />
                        {errors.caption && (
                            <p className="text-sm text-destructive mt-1">{errors.caption.message}</p>
                        )}
                    </div>

                    {image && (
                        <div className="mt-2">
                            <Image
                                src={image}
                                alt="Preview"
                                width={300}
                                height={200}
                                className="rounded-md object-cover"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset({ caption: currentCaption });
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Edit"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
