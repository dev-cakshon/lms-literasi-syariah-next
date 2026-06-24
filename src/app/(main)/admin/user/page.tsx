'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  FileUp,
  Search,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

import {
  ApiError,
  authAssignRole,
  deleteUser,
  getUsers,
  updateUser,
} from '@/lib/api';
import { cn, getInitials } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'email' | 'role' | 'points';
type SortDir = 'asc' | 'desc';
type RoleFilter = 'all' | UserRole;

const ROLE_LABELS: Record<RoleFilter, string> = {
  all: 'Semua',
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
};

// ── Local sub-component ───────────────────────────────────────────────────────

function SortableHead({
  label,
  sortKey: key,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = currentKey === key;
  const Icon = isActive
    ? currentDir === 'asc'
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <TableHead
      className={cn(
        'h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500',
        className,
      )}
      aria-sort={
        isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type='button'
        onClick={() => onSort(key)}
        className='flex items-center gap-1 hover:text-slate-700'
      >
        {label}
        <Icon
          className={cn(
            'h-3 w-3',
            isActive ? 'text-primary-600' : 'text-slate-400',
          )}
        />
      </button>
    </TableHead>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  // ── Data fetch ───────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await getUsers({
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
      });
      setUsers(data);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Gagal memuat pengguna.',
      );
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  // useEffectEvent lets the debounce effect depend on [search, roleFilter] only
  // (the real triggers) while always invoking the latest fetchUsers closure.
  const runFetch = useEffectEvent(() => {
    setLoading(true);
    fetchUsers();
  });

  useEffect(() => {
    const timeout = setTimeout(runFetch, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  // ── Sort ──────────────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        const aName = a.name || a.displayName || '';
        const bName = b.name || b.displayName || '';
        cmp = aName.localeCompare(bName);
      } else if (sortKey === 'email') {
        cmp = (a.email || '').localeCompare(b.email || '');
      } else if (sortKey === 'role') {
        cmp = (a.role || '').localeCompare(b.role || '');
      } else if (sortKey === 'points') {
        cmp = (a.totalPoints || 0) - (b.totalPoints || 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [users, sortKey, sortDir]);

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = sortedUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const rangeStart =
    sortedUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, sortedUsers.length);

  // Windowed page buttons: always show first, last, and up to 5 around current
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const range: (number | '…')[] = [];
    let prev = 0;
    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        (p >= safePage - delta && p <= safePage + delta)
      ) {
        if (prev && p - prev > 1) range.push('…');
        range.push(p);
        prev = p;
      }
    }
    return range;
  }, [totalPages, safePage]);

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const handleComingSoon = () => toast.info('Fitur ini segera hadir.');

  const showTableBody = !loading && !loadError && paginatedUsers.length > 0;

  const activeFilterCount = roleFilter !== 'all' ? 1 : 0;

  return (
    <div className='mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
      {/* Page header */}
      <div className='mb-6'>
        <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
          Manajemen Pengguna
        </h1>
        <p className='mt-1 text-sm text-slate-500'>
          Kelola pengguna dan atur peran mereka.
        </p>
      </div>

      {/* Toolbar */}
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        {/* Search */}
        <div className='relative w-full sm:w-72'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <Input
            type='text'
            placeholder='Cari nama atau email…'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className='pl-9'
            aria-label='Cari pengguna'
          />
        </div>

        {/* Role filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className={cn(
                'gap-1.5',
                activeFilterCount > 0 &&
                  'border-primary-300 bg-primary-50 text-primary-700',
              )}
            >
              <SlidersHorizontal className='h-4 w-4' />
              Filter
              {activeFilterCount > 0 && (
                <span className='flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white'>
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-40'>
            <DropdownMenuRadioGroup
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v as RoleFilter);
                setPage(1);
              }}
            >
              {(Object.keys(ROLE_LABELS) as RoleFilter[]).map((role) => (
                <DropdownMenuRadioItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Batch Import — disabled stub */}
        <Button
          variant='outline'
          size='sm'
          className='gap-1.5 cursor-not-allowed opacity-60'
          aria-disabled='true'
          title='Segera hadir'
          onClick={handleComingSoon}
        >
          <FileUp className='h-4 w-4' />
          Import
        </Button>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Add User — disabled stub */}
        <Button
          variant='outline'
          size='sm'
          className='gap-1.5 cursor-not-allowed opacity-60'
          aria-disabled='true'
          title='Segera hadir'
          onClick={handleComingSoon}
        >
          <UserPlus className='h-4 w-4' />
          Tambah User
        </Button>
      </div>

      {/* Table card */}
      <div className='overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[var(--shadow-elevated-1)]'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50 hover:bg-slate-50'>
              <SortableHead
                label='Nama'
                sortKey='name'
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label='Email'
                sortKey='email'
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className='hidden sm:table-cell'
              />
              <SortableHead
                label='Peran'
                sortKey='role'
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                Chatbot
              </TableHead>
              <SortableHead
                label='Poin'
                sortKey='points'
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className='hidden md:table-cell'
              />
              <TableHead className='h-auto px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500'>
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          {loading && <TableSkeleton columns={6} />}

          {showTableBody && (
            <TableBody>
              {paginatedUsers.map((user, idx) => {
                const isBusy = actionLoading === user.uid;
                const displayName = user.name || user.displayName || '-';
                return (
                  <TableRow
                    key={user.uid}
                    className={cn(
                      'group',
                      idx % 2 === 0 ? 'bg-white' : 'bg-ivory',
                      'hover:bg-slate-50',
                    )}
                  >
                    {/* Name cell — avatar + name */}
                    <TableCell className='px-3 py-2'>
                      <div className='flex items-center gap-3'>
                        <span
                          aria-hidden='true'
                          className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700'
                        >
                          {getInitials(user.name || user.displayName)}
                        </span>
                        <span className='font-medium text-slate-800'>
                          {displayName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className='hidden px-3 py-2 text-sm text-slate-600 sm:table-cell'>
                      {user.email}
                    </TableCell>

                    {/* Role select */}
                    <TableCell className='px-3 py-2'>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.uid, e.target.value as UserRole)
                        }
                        disabled={isBusy}
                        aria-label={`Peran untuk ${displayName}`}
                        className='h-8 rounded-md border border-slate-300 bg-white pl-2 pr-6 text-xs font-medium text-slate-700 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <option value='student'>Student</option>
                        <option value='instructor'>Instructor</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </TableCell>

                    {/* Chatbot toggle */}
                    <TableCell className='px-3 py-2'>
                      {user.role === 'student' ? (
                        <Switch
                          checked={user.chatbotEnabled === true}
                          onCheckedChange={(v) =>
                            handleChatbotToggle(user.uid, v)
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

                    {/* Points — read-only */}
                    <TableCell className='hidden px-3 py-2 text-sm text-slate-600 md:table-cell'>
                      {user.totalPoints || 0}
                    </TableCell>

                    {/* Actions — hover-reveal delete */}
                    <TableCell className='px-3 py-2 text-right'>
                      <button
                        type='button'
                        onClick={() => setDeleteTarget(user)}
                        disabled={isBusy}
                        aria-label={`Hapus ${displayName}`}
                        className={cn(
                          'rounded-md p-1.5 transition-all',
                          'text-slate-400 hover:bg-red-50 hover:text-red-600',
                          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                          'disabled:pointer-events-none disabled:opacity-30',
                        )}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>

        {/* Load error */}
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

        {/* Empty states — filter-aware */}
        {!loading && !loadError && sortedUsers.length === 0 && (
          <EmptyState
            icon={UsersRound}
            title={
              roleFilter !== 'all'
                ? `Tidak ada pengguna dengan peran "${ROLE_LABELS[roleFilter]}"`
                : 'Tidak ada pengguna ditemukan'
            }
            description={
              roleFilter !== 'all'
                ? 'Coba pilih peran lain atau reset filter.'
                : search
                  ? 'Coba kata kunci pencarian yang berbeda.'
                  : 'Belum ada pengguna yang terdaftar.'
            }
            action={
              roleFilter !== 'all' ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setRoleFilter('all')}
                >
                  Reset filter
                </Button>
              ) : undefined
            }
          />
        )}

        {/* Pagination footer */}
        {!loading && !loadError && totalPages > 1 && (
          <div className='flex items-center justify-between border-t border-slate-200 px-4 py-3'>
            <p className='text-xs text-slate-500'>
              Menampilkan{' '}
              <span className='font-medium text-slate-700'>
                {rangeStart}–{rangeEnd}
              </span>{' '}
              dari{' '}
              <span className='font-medium text-slate-700'>
                {sortedUsers.length}
              </span>{' '}
              pengguna
            </p>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label='Halaman sebelumnya'
                className='flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>

              {pageNumbers.map((p, i) =>
                p === '…' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className='flex h-7 w-7 items-center justify-center text-xs text-slate-400'
                  >
                    …
                  </span>
                ) : (
                  <button
                    type='button'
                    key={p}
                    onClick={() => setPage(p as number)}
                    aria-label={`Halaman ${p}`}
                    aria-current={safePage === p ? 'page' : undefined}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors',
                      safePage === p
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type='button'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label='Halaman berikutnya'
                className='flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
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
