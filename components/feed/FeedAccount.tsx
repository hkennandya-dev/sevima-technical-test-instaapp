"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useUserStore } from "@/stores/user";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { parseErrorMessage } from "@/lib/error";

export function FeedAccount() {
    const { user, setUser } = useUserStore();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    if (!user) return null;

    const handleLogout = async () => {
        try {
            setSubmitting(true);
            const res = await api.post("/logout");
            toast.success(res.data.message || "Logout successfully.");
            localStorage.removeItem("auth-token");
            setUser(null);
            router.push("/login");
        } catch (error) {
            toast.error(parseErrorMessage(error, "Failed to logout."));
        } finally {
            setSubmitting(false);
            setLogoutOpen(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg flex flex-col justify-between gap-4">
            <div className="flex justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Hello, {user.name}</h2>
                    <p className="text-muted-foreground text-sm">@{user.username}</p>
                </div>
                <div className="flex gap-4">
                    <ThemeToggle />
                </div>
            </div>

            <p className="text-muted-foreground text-sm">
                This is a clone project named <span className="font-semibold">InstaApp</span>, created as part of a technical test by{" "}
                <Link
                    href="https://hkennandya.yuivastudio.com"
                    target="_blank"
                    className="hover:text-foreground"
                >
                    @hkennandya
                </Link>.{" "}
                <button
                    onClick={() => setLogoutOpen(true)}
                    className="cursor-pointer hover:text-foreground"
                >
                    Want to logout?
                </button>
            </p>

            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm action</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to logout?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            disabled={submitting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
