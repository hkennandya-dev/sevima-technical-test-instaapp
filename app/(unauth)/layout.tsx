"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnauthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("auth-token");
        if (token) {
            router.replace("/");
        }
    }, [router]);

    return children;
}
