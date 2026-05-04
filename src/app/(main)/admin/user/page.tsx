'use client';

import { Search, Shield, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, authAssignRole, deleteUser, getUsers } from '@/lib/api';

import type { UserProfile, UserRole } from '@/types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await getUsers(search ? { search } : undefined);
      setUsers(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal memuat pengguna.');
      }
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
      setError(null);
      setSuccessMessage(null);
      await authAssignRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal mengubah role pengguna.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (uid: string) => {
    if (
      !confirm(
        'Yakin ingin menghapus permanen pengguna ini? Tindakan ini tidak dapat dibatalkan.',
      )
    )
      return;
    setActionLoading(uid);
    try {
      setError(null);
      setSuccessMessage(null);
      await deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus pengguna.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='min-h-full bg-linear-to-b from-primary-600 via-primary-50 to-ivory'>
      {/* Header + Search Bar */}
      <div className='bg-primary-600 px-6 py-6'>
        <div className='max-w-4xl mx-auto space-y-3'>
          <div>
            <h1 className='font-display text-3xl font-bold text-white tracking-tight mb-1'>
              Manajemen Pengguna
            </h1>
            <p className='text-primary-100'>
              Kelola pengguna dan atur peran mereka.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex-1 relative'>
              <input
                type='text'
                placeholder='Cari berdasarkan nama atau email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-full px-5 py-3 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300'
              />
            </div>
            <button className='bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-full transition flex items-center gap-2 cursor-pointer'>
              <Search className='w-4 h-4' />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto p-6 lg:p-8 space-y-6'>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        {successMessage && (
          <p className='text-sm text-green-600'>{successMessage}</p>
        )}

        {loading ? (
          <p className='text-sm text-muted-foreground'>Memuat pengguna...</p>
        ) : users.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Tidak ada pengguna ditemukan.
          </p>
        ) : (
          <div className='bg-white rounded-[var(--radius-card)] border shadow-[var(--shadow-elevated-1)] overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-slate-50'>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Nama
                  </th>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Email
                  </th>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Role
                  </th>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Poin
                  </th>
                  <th className='text-right p-4 font-medium text-slate-600'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className='border-b last:border-b-0 hover:bg-slate-50'
                  >
                    <td className='p-4 font-medium text-slate-800'>
                      {user.name || user.displayName || '-'}
                    </td>
                    <td className='p-4 text-slate-600'>{user.email}</td>
                    <td className='p-4'>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.uid, e.target.value as UserRole)
                        }
                        disabled={actionLoading === user.uid}
                        className='px-2 py-1 border border-slate-300 rounded text-xs font-medium'
                      >
                        <option value='student'>Student</option>
                        <option value='instructor'>Instructor</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                    <td className='p-4 text-slate-600'>
                      {user.totalPoints || 0}
                    </td>
                    <td className='p-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => handleRoleChange(user.uid, 'admin')}
                          disabled={
                            actionLoading === user.uid || user.role === 'admin'
                          }
                          className='p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30'
                          title='Set as admin'
                        >
                          <Shield className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          disabled={actionLoading === user.uid}
                          className='p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-30'
                          title='Hapus pengguna'
                        >
                          <Trash2 className='w-4 h-4' />
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
    </div>
  );
}
