"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const clearUser = useUserStore((state) => state.clearUser);

    useEffect(() => {
        const token = localStorage.getItem("auth-token");

        if (!token) {
            router.replace("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await api.get("/me");

                if (res.data.status === 200) {
                    setUser(res.data.data);
                } else {
                    throw new Error("Unauthorized");
                }
            } catch (err: any) {
                const message = err?.response?.data?.message || err?.message || "Unauthorized.";

                toast.error(message);
                localStorage.removeItem("auth-token");
                clearUser();
                router.replace("/login");
            }
        };

        fetchUser();
    }, [router, setUser, clearUser]);

    return <>{children}</>;
}
