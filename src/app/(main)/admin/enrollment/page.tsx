'use client';

import { CheckCircle2, Inbox, UserMinus, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  ApiError,
  approveEnrollmentRequest,
  declineEnrollmentRequest,
  getCourses,
  getUsers,
  listEnrollmentRequests,
  revokeEnrollmentRequest,
} from '@/lib/api';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { Textarea } from '@/components/ui/textarea';

import type { EnrollmentRequest } from '@/types';

interface EnrichedRequest extends EnrollmentRequest {
  studentName: string;
  courseTitle: string;
}

export default function AdminEnrollmentPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'enrolled'>('pending');

  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [enrolled, setEnrolled] = useState<EnrichedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  // Approve confirm dialog
  const [approveTarget, setApproveTarget] = useState<EnrichedRequest | null>(
    null,
  );

  // Decline dialog with reason
  const [declineTarget, setDeclineTarget] = useState<EnrichedRequest | null>(
    null,
  );
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);

  // Revoke dialog with optional reason
  const [revokeTarget, setRevokeTarget] = useState<EnrichedRequest | null>(
    null,
  );
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      // Parallel fetch: both request lists + user/course lookups for name enrichment
      const [rawPending, rawEnrolled, users, courses] = await Promise.all([
        listEnrollmentRequests('pending'),
        listEnrollmentRequests('approved'),
        getUsers(),
        getCourses(),
      ]);

      const userMap = new Map(users.map((u) => [u.uid, u.name || u.email]));
      const courseMap = new Map(courses.map((c) => [c.id, c.title]));

      const enrich = (r: EnrollmentRequest): EnrichedRequest => ({
        ...r,
        studentName: userMap.get(r.userId) ?? r.userId,
        courseTitle: courseMap.get(r.courseId) ?? r.courseId,
      });

      setRequests(rawPending.map(enrich));
      setEnrolled(rawEnrolled.map(enrich));
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Gagal memuat permintaan.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (req: EnrichedRequest) => {
    setActionLoading((prev) => new Set(prev).add(req.id));
    try {
      await approveEnrollmentRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.success(`Akses disetujui untuk ${req.studentName}.`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal menyetujui permintaan.',
      );
      throw err; // Keep ConfirmDialog open on error
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev);
        next.delete(req.id);
        return next;
      });
    }
  };

  const handleDeclineSubmit = async () => {
    if (!declineTarget) return;
    setDeclining(true);
    try {
      await declineEnrollmentRequest(
        declineTarget.id,
        declineReason.trim() || undefined,
      );
      setRequests((prev) => prev.filter((r) => r.id !== declineTarget.id));
      toast.success(`Permintaan ${declineTarget.studentName} ditolak.`);
      setDeclineTarget(null);
      setDeclineReason('');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal menolak permintaan.',
      );
    } finally {
      setDeclining(false);
    }
  };

  const handleRevokeSubmit = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await revokeEnrollmentRequest(
        revokeTarget.id,
        revokeReason.trim() || undefined,
      );
      setEnrolled((prev) => prev.filter((r) => r.id !== revokeTarget.id));
      toast.success(`Akses ${revokeTarget.studentName} dicabut.`);
      setRevokeTarget(null);
      setRevokeReason('');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal mencabut akses.',
      );
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className='mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
      {/* Page header */}
      <div className='mb-6'>
        <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
          Pendaftaran Premium
        </h1>
        <p className='mt-1 text-sm text-slate-500'>
          Tinjau permintaan akses dan kelola siswa yang sudah terdaftar.
        </p>
      </div>

      {/* Segmented control tabs */}
      <div className='mb-6 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1'>
        <button
          onClick={() => setActiveTab('pending')}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'pending'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          Menunggu Persetujuan
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'enrolled'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          Terdaftar
        </button>
      </div>

      {loadError && (
        <div className='mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {loadError}{' '}
          <button
            onClick={() => void fetchRequests()}
            className='font-semibold underline hover:no-underline'
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Pending tab */}
      {activeTab === 'pending' && (
        <div className='overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[var(--shadow-elevated-1)]'>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50'>
                <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Siswa
                </TableHead>
                <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Kursus
                </TableHead>
                <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Tanggal Permintaan
                </TableHead>
                <TableHead className='h-auto px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Tindakan
                </TableHead>
              </TableRow>
            </TableHeader>

            {loading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : requests.length === 0 && !loadError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className='p-0'>
                    <EmptyState
                      icon={Inbox}
                      title='Tidak ada permintaan pending'
                      description='Semua permintaan akses premium telah ditangani.'
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {requests.map((req, idx) => {
                  const busy = actionLoading.has(req.id);
                  return (
                    <TableRow
                      key={req.id}
                      className={[
                        idx % 2 === 0 ? 'bg-white' : 'bg-ivory',
                        'group hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <TableCell className='px-3 py-3'>
                        <span className='font-medium text-slate-800'>
                          {req.studentName}
                        </span>
                        <br />
                        <span className='text-xs text-slate-400'>
                          {req.userId}
                        </span>
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700'>
                          Premium
                        </span>{' '}
                        <span className='text-sm text-slate-700'>
                          {req.courseTitle}
                        </span>
                      </TableCell>
                      <TableCell className='px-3 py-3 text-sm text-slate-600'>
                        {new Date(req.requestedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            size='sm'
                            variant='default'
                            disabled={busy}
                            onClick={() => setApproveTarget(req)}
                            className='gap-1.5'
                          >
                            <CheckCircle2 size={14} />
                            Setujui
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={busy}
                            onClick={() => {
                              setDeclineReason('');
                              setDeclineTarget(req);
                            }}
                            className='gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                          >
                            <XCircle size={14} />
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </div>
      )}

      {/* Enrolled tab */}
      {activeTab === 'enrolled' && (
        <div className='overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[var(--shadow-elevated-1)]'>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50'>
                <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Siswa
                </TableHead>
                <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Kursus
                </TableHead>
                <TableHead className='h-auto px-3 py-3 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Tanggal Disetujui
                </TableHead>
                <TableHead className='h-auto px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Tindakan
                </TableHead>
              </TableRow>
            </TableHeader>

            {loading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : enrolled.length === 0 && !loadError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className='p-0'>
                    <EmptyState
                      icon={UserMinus}
                      title='Belum ada siswa dengan akses premium'
                      description='Siswa yang sudah disetujui akan muncul di sini.'
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {enrolled.map((req, idx) => {
                  const busy = actionLoading.has(req.id);
                  return (
                    <TableRow
                      key={req.id}
                      className={[
                        idx % 2 === 0 ? 'bg-white' : 'bg-ivory',
                        'group hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <TableCell className='px-3 py-3'>
                        <span className='font-medium text-slate-800'>
                          {req.studentName}
                        </span>
                        <br />
                        <span className='text-xs text-slate-400'>
                          {req.userId}
                        </span>
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700'>
                          Premium
                        </span>{' '}
                        <span className='text-sm text-slate-700'>
                          {req.courseTitle}
                        </span>
                      </TableCell>
                      <TableCell className='px-3 py-3 text-sm text-slate-600'>
                        {req.decidedAt
                          ? new Date(req.decidedAt).toLocaleDateString(
                              'id-ID',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )
                          : '—'}
                      </TableCell>
                      <TableCell className='px-3 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={busy}
                            onClick={() => {
                              setRevokeReason('');
                              setRevokeTarget(req);
                            }}
                            className='gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                          >
                            <UserMinus size={14} />
                            Cabut Akses
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </div>
      )}

      {/* Approve confirm dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title='Setujui permintaan akses?'
        description={
          approveTarget
            ? `${approveTarget.studentName} akan mendapat akses ke "${approveTarget.courseTitle}".`
            : undefined
        }
        confirmLabel='Setujui'
        onConfirm={async () => {
          if (approveTarget) await handleApprove(approveTarget);
          setApproveTarget(null);
        }}
      />

      {/* Decline dialog with optional reason */}
      <Dialog
        open={!!declineTarget}
        onOpenChange={(open) => !open && setDeclineTarget(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Tolak permintaan akses</DialogTitle>
          </DialogHeader>
          {declineTarget && (
            <p className='text-sm text-slate-600'>
              Permintaan dari{' '}
              <span className='font-semibold'>{declineTarget.studentName}</span>{' '}
              untuk &ldquo;{declineTarget.courseTitle}&rdquo; akan ditolak.
            </p>
          )}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-700'>
              Alasan penolakan{' '}
              <span className='font-normal text-slate-400'>(opsional)</span>
            </label>
            <Textarea
              placeholder='Contoh: Pendaftaran untuk semester ini telah penuh.'
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              disabled={declining}
              onClick={() => setDeclineTarget(null)}
            >
              Batal
            </Button>
            <Button
              variant='destructive'
              disabled={declining}
              onClick={handleDeclineSubmit}
            >
              {declining ? 'Menolak...' : 'Tolak Permintaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke dialog with optional reason */}
      <Dialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Cabut akses premium</DialogTitle>
          </DialogHeader>
          {revokeTarget && (
            <p className='text-sm text-slate-600'>
              Akses{' '}
              <span className='font-semibold'>{revokeTarget.studentName}</span>{' '}
              ke &ldquo;{revokeTarget.courseTitle}&rdquo; akan dicabut. Siswa
              tidak bisa lagi membaca konten kursus ini.
            </p>
          )}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-700'>
              Alasan pencabutan{' '}
              <span className='font-normal text-slate-400'>(opsional)</span>
            </label>
            <Textarea
              placeholder='Contoh: Pembayaran tidak diterima.'
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              disabled={revoking}
              onClick={() => setRevokeTarget(null)}
            >
              Batal
            </Button>
            <Button
              variant='destructive'
              disabled={revoking}
              onClick={handleRevokeSubmit}
            >
              {revoking ? 'Mencabut...' : 'Cabut Akses'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
