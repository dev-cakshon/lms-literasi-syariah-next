"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { user, userProfile, loading, isAdmin } = useAuth();

    // Redirect after auth & profile loaded
    useEffect(() => {
        if (!loading && user && userProfile) {
            router.replace(isAdmin ? "/admin/course" : "/dashboard");
        }
    }, [loading, user, userProfile, isAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-slate-600">Memuat...</p>
            </div>
        );
    }

    // Show login form only if not authenticated
    if (!user) {
        return <LoginForm />;
    }

    // While redirecting (user exists but profile might not yet), show placeholder
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-slate-600">Mengalihkan...</p>
        </div>
    );
}
