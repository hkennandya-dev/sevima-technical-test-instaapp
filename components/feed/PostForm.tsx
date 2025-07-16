"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import * as z from "zod";
import { useRef, useState } from "react";
import { parseErrorMessage } from "@/lib/error";
import Image from "next/image";
import { ZoomIn, ZoomOut, X, Loader2 } from "lucide-react";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const MAX_IMAGE_SIZE_MB = 1;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const postSchema = z
    .object({
        caption: z.string().optional(),
        image: z
            .custom<File>()
            .refine(
                (file) => {
                    if (!file) return true;
                    return (
                        file instanceof File &&
                        ACCEPTED_IMAGE_TYPES.includes(file.type) &&
                        file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024
                    );
                },
                {
                    message: `Image must be JPG/PNG/WebP and less than ${MAX_IMAGE_SIZE_MB}MB.`,
                }
            )
            .optional(),
    })
    .refine((data) => data.caption?.trim() || data.image, {
        message: "Either caption or image is required.",
        path: ["caption"],
    });

type PostFormData = z.infer<typeof postSchema>;

export function PostForm({ onSuccess }: { onSuccess: () => void }) {
    const {
        register,
        control,
        watch,
        handleSubmit,
        reset,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting, isValid },
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        mode: "onChange",
    });

    const formRef = useRef<HTMLFormElement>(null);
    const inputFileRef = useRef<HTMLInputElement | null>(null);

    const image = watch("image");

    const [preview, setPreview] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const handleImageChange = (file?: File) => {
        if (
            file &&
            ACCEPTED_IMAGE_TYPES.includes(file.type) &&
            file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024
        ) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(null);
        }
    };

    const onClearImage = () => {
        setValue("image", undefined);
        clearErrors("image");
        setPreview(null);
        if (inputFileRef.current) {
            inputFileRef.current.value = "";
        }
    };

    const onSubmit = async (data: PostFormData) => {
        const formData = new FormData();
        if (data.caption) formData.append("caption", data.caption);
        if (data.image instanceof File) formData.append("image", data.image);

        try {
            const res = await api.post("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(res.data?.message || "Post created successfully.");
            reset();
            setPreview(null);
            formRef.current?.reset();
            setValue("image", undefined);
            onSuccess();
        } catch (error: unknown) {
            const message = parseErrorMessage(error, "Failed to post.");
            toast.error(message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border p-4 rounded-md bg-background"
            ref={formRef}
        >
            <Textarea
                placeholder="What's on your mind?"
                {...register("caption")}
                className="resize-none"
            />
            {errors.caption && (
                <p className="text-sm text-destructive">{errors.caption.message}</p>
            )}

            <div className="relative w-full">
                <Controller
                    control={control}
                    name="image"
                    render={({ field }) => (
                        <Input
                            type="file"
                            accept="image/*"
                            className="file:cursor-pointer cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleImageChange(file);
                                field.onChange(file);
                            }}
                            ref={(el) => {
                                field.ref(el);
                                inputFileRef.current = el;
                            }}
                        />
                    )}
                />
                {image && (
                    <button
                        type="button"
                        onClick={onClearImage}
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
            )}

            {preview && (
                <div className="mt-2">
                    <Image
                        src={preview}
                        alt="Image Preview"
                        width={300}
                        height={200}
                        className="rounded-md object-cover cursor-pointer"
                        onClick={() => setIsViewerOpen(true)}
                    />
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Accepted format: JPG/PNG/WebP. Max size: {MAX_IMAGE_SIZE_MB}MB.
            </p>

            <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="w-full"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
            </Button>

            {isViewerOpen && preview && (
                <Lightbox
                    open={isViewerOpen}
                    close={() => setIsViewerOpen(false)}
                    slides={[{ src: preview }]}
                    plugins={[Zoom]}
                    styles={{
                        container: {
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            zIndex: 100,
                        },
                        button: { filter: "none" }
                    }}
                    controller={{
                        closeOnBackdropClick: true,
                        closeOnPullDown: true,
                        disableSwipeNavigation: true,
                    }}
                    zoom={{
                        maxZoomPixelRatio: 3,
                        zoomInMultiplier: 2,
                        doubleTapDelay: 300,
                    }}
                    render={{
                        iconNext: () => null,
                        iconPrev: () => null,
                        buttonNext: () => null,
                        buttonPrev: () => null,
                        iconZoomIn: () => <ZoomIn className="w-6 h-6 text-inherit opacity-75 hover:opacity-100" />,
                        iconZoomOut: () => <ZoomOut className="w-6 h-6 text-inherit opacity-75 hover:opacity-100" />,
                        iconClose: () => <X className="w-6 h-6 text-inherit opacity-75 hover:opacity-100" />,
                    }}
                />
            )}
        </form>
    );
}
