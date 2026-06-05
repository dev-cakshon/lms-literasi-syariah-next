'use client';

import { Search, Trash2, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  ApiError,
  authAssignRole,
  deleteUser,
  getUsers,
  updateUser,
} from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';

import type { UserProfile, UserRole } from '@/types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await getUsers(search ? { search } : undefined);
      setUsers(data);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Gagal memuat pengguna.',
      );
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
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
      toast.success('Peran pengguna diperbarui.');
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Gagal mengubah peran pengguna.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleChatbotToggle = async (uid: string, next: boolean) => {
    setActionLoading(uid);
    try {
      await updateUser(uid, { chatbotEnabled: next });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, chatbotEnabled: next } : u)),
      );
      toast.success(
        next ? 'Akses chatbot diaktifkan.' : 'Akses chatbot dinonaktifkan.',
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal mengubah akses chatbot.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (uid: string) => {
    setActionLoading(uid);
    try {
      await deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      toast.success('Pengguna dihapus.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal menghapus pengguna.',
      );
      throw err; // keep the confirm dialog open so the user can retry
    } finally {
      setActionLoading(null);
    }
  };

  const showTableBody = !loading && !loadError && users.length > 0;

  return (
    <div className='mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
      {/* Page header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
            Manajemen Pengguna
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Kelola pengguna dan atur peran mereka.
          </p>
        </div>
        <div className='relative w-full sm:w-72'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <Input
            type='text'
            placeholder='Cari nama atau email…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
            aria-label='Cari pengguna'
          />
        </div>
      </div>

      {/* Table card */}
      <div className='overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[var(--shadow-elevated-1)]'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50 hover:bg-slate-50'>
              <TableHead className='text-slate-600'>Nama</TableHead>
              <TableHead className='text-slate-600'>Email</TableHead>
              <TableHead className='text-slate-600'>Peran</TableHead>
              <TableHead className='text-slate-600'>Chatbot</TableHead>
              <TableHead className='text-slate-600'>Poin</TableHead>
              <TableHead className='text-right text-slate-600'>Aksi</TableHead>
            </TableRow>
          </TableHeader>

          {loading && <TableSkeleton columns={6} />}

          {showTableBody && (
            <TableBody>
              {users.map((user) => {
                const isBusy = actionLoading === user.uid;
                return (
                  <TableRow key={user.uid} className='hover:bg-slate-50'>
                    <TableCell className='font-medium text-slate-800'>
                      {user.name || user.displayName || '-'}
                    </TableCell>
                    <TableCell className='text-slate-600'>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.uid, e.target.value as UserRole)
                        }
                        disabled={isBusy}
                        aria-label={`Peran untuk ${user.name || user.email}`}
                        className='h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <option value='student'>Student</option>
                        <option value='instructor'>Instructor</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {user.role === 'student' ? (
                        <Checkbox
                          checked={user.chatbotEnabled === true}
                          onCheckedChange={(v) =>
                            handleChatbotToggle(user.uid, v === true)
                          }
                          disabled={isBusy}
                          aria-label='Akses chatbot'
                        />
                      ) : (
                        <span className='text-xs text-slate-400'>
                          Selalu aktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-slate-600'>
                      {user.totalPoints || 0}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setDeleteTarget(user)}
                        disabled={isBusy}
                        className='text-red-600 hover:bg-red-50 hover:text-red-700'
                      >
                        <Trash2 className='mr-1.5 h-4 w-4' />
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>

        {!loading && loadError && (
          <EmptyState
            icon={UsersRound}
            title='Gagal memuat pengguna'
            description={loadError}
            action={
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setLoading(true);
                  fetchUsers();
                }}
              >
                Coba lagi
              </Button>
            }
          />
        )}

        {!loading && !loadError && users.length === 0 && (
          <EmptyState
            icon={UsersRound}
            title='Tidak ada pengguna ditemukan'
            description={
              search
                ? 'Coba kata kunci pencarian yang berbeda.'
                : 'Belum ada pengguna yang terdaftar.'
            }
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title='Hapus pengguna?'
        description={
          deleteTarget
            ? `Yakin ingin menghapus permanen ${
                deleteTarget.name || deleteTarget.email
              }? Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        confirmLabel='Hapus'
        destructive
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget.uid);
        }}
      />
    </div>
  );
}
