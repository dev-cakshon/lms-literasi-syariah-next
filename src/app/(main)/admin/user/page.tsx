"use client";

import { Search,Shield, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { authAssignRole, deleteUser,getUsers } from "@/lib/api";

import type { UserProfile, UserRole } from "@/types";

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await getUsers(search ? { search } : undefined);
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchUsers]);

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        setActionLoading(uid);
        try {
            await authAssignRole(uid, newRole);
            setUsers((prev) =>
                prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            console.error("Failed to assign role:", err);
            alert("Gagal mengubah role pengguna");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (uid: string) => {
        if (!confirm("Yakin ingin menonaktifkan pengguna ini?")) return;
        setActionLoading(uid);
        try {
            await deleteUser(uid);
            setUsers((prev) => prev.filter((u) => u.uid !== uid));
        } catch (err) {
            console.error("Failed to delete user:", err);
            alert("Gagal menghapus pengguna");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Pengguna</h1>
                <p className="text-gray-600">Kelola pengguna dan atur peran mereka.</p>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground">Memuat pengguna...</p>
            ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada pengguna ditemukan.</p>
            ) : (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="text-left p-4 font-medium text-slate-600">Nama</th>
                                <th className="text-left p-4 font-medium text-slate-600">Email</th>
                                <th className="text-left p-4 font-medium text-slate-600">Role</th>
                                <th className="text-left p-4 font-medium text-slate-600">Poin</th>
                                <th className="text-right p-4 font-medium text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.uid} className="border-b last:border-b-0 hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">
                                        {user.name || user.displayName || "-"}
                                    </td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                                            disabled={actionLoading === user.uid}
                                            className="px-2 py-1 border border-slate-300 rounded text-xs font-medium"
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-slate-600">{user.totalPoints || 0}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleRoleChange(user.uid, "admin")}
                                                disabled={actionLoading === user.uid || user.role === "admin"}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
                                                title="Set as admin"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.uid)}
                                                disabled={actionLoading === user.uid}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                                                title="Hapus pengguna"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}