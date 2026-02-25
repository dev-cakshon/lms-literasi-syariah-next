"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

export const SignupForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            return;
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        setLoading(true);

        try {
            await signUp(name || email.split("@")[0], email, password);
            router.push("/dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal mendaftar. Coba lagi.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Daftar</h1>
                    <p className="text-slate-600 mt-2">
                        Mulai perjalanan belajar ekonomi syariah Anda
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                            Nama Lengkap
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Nama Anda"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Minimal 6 karakter"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                            Konfirmasi Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Ketik ulang password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? "Memproses..." : "Daftar"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Masuk
                    </Link>
                </p>

                <p className="mt-4 text-center text-sm text-slate-600">
                    <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        ← Kembali ke Beranda
                    </Link>
                </p>
            </div>
        </div>
    );
};
