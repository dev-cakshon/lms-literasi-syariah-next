'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { ApiError, batchRegisterStudents } from '@/lib/api';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
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

import type { BatchRegisterResponse, BatchRegisterRow } from '@/types';

// PRD14 — max rows per upload, mirrors the backend's MAX_BATCH_ROWS cap.
const MAX_BATCH_ROWS = 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PreviewRow extends BatchRegisterRow {
  rowError?: string;
}

// Accepts loosely-cased/spaced headers (Name, E-mail, etc.) from admin-authored files.
function normalizeHeader(key: string): 'name' | 'email' | 'password' | null {
  const k = key.trim().toLowerCase();
  if (k === 'name' || k === 'nama') return 'name';
  if (k === 'email' || k === 'e-mail') return 'email';
  if (k === 'password' || k === 'sandi' || k === 'kata sandi')
    return 'password';
  return null;
}

function normalizeRawRows(raw: Record<string, unknown>[]): BatchRegisterRow[] {
  return raw.map((rawRow) => {
    const row: BatchRegisterRow = { email: '' };
    for (const [key, value] of Object.entries(rawRow)) {
      const field = normalizeHeader(key);
      if (!field) continue;
      const strValue =
        value === undefined || value === null ? '' : String(value).trim();
      row[field] = strValue;
    }
    return row;
  });
}

function validateRows(
  rows: BatchRegisterRow[],
  defaultPassword: string,
): PreviewRow[] {
  const seen = new Set<string>();
  return rows.map((row) => {
    const email = row.email.trim().toLowerCase();
    let rowError: string | undefined;

    if (!email || !EMAIL_RE.test(email)) {
      rowError = 'Email tidak valid';
    } else if (seen.has(email)) {
      rowError = 'Email duplikat dalam file';
    } else if (!row.password?.trim() && !defaultPassword.trim()) {
      rowError = 'Password kosong (isi kolom atau default password)';
    }

    seen.add(email);
    return { ...row, email: row.email.trim(), rowError };
  });
}

function downloadCsv(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const STATUS_CONFIG = {
  created: {
    label: 'Dibuat',
    icon: CheckCircle2,
    className: 'text-primary-600',
  },
  skipped: {
    label: 'Dilewati',
    icon: AlertTriangle,
    className: 'text-amber-600',
  },
  failed: { label: 'Gagal', icon: XCircle, className: 'text-red-600' },
} as const;

export default function BatchRegisterPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BatchRegisterResponse | null>(null);

  const reparse = useCallback(
    (normalized: BatchRegisterRow[], password: string) => {
      if (normalized.length === 0) {
        setParseError('File tidak berisi baris data.');
        setRows([]);
        return;
      }
      if (normalized.length > MAX_BATCH_ROWS) {
        setParseError(
          `File berisi ${normalized.length} baris — maksimal ${MAX_BATCH_ROWS} per upload.`,
        );
        setRows([]);
        return;
      }
      setParseError(null);
      setRows(validateRows(normalized, password));
    },
    [],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setResult(null);
      setParseError(null);
      setFileName(file.name);

      try {
        const isCsv = /\.csv$/i.test(file.name);
        const isExcel = /\.xlsx?$/i.test(file.name);

        if (!isCsv && !isExcel) {
          setParseError('Format file tidak didukung. Gunakan .csv atau .xlsx.');
          setRows([]);
          return;
        }

        let raw: Record<string, unknown>[] = [];

        if (isCsv) {
          const text = await file.text();
          const parsed = Papa.parse<Record<string, unknown>>(text, {
            header: true,
            skipEmptyLines: true,
          });
          raw = parsed.data;
        } else {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(
            workbook.Sheets[firstSheet],
          );
        }

        reparse(normalizeRawRows(raw), defaultPassword);
      } catch {
        setParseError('Gagal membaca file. Pastikan formatnya benar.');
        setRows([]);
      }
    },
    [defaultPassword, reparse],
  );

  const handleDefaultPasswordChange = (value: string) => {
    setDefaultPassword(value);
    if (rows.length > 0) {
      setRows(validateRows(rows, value));
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsv(
      'template-batch-register.csv',
      'name,email,password\nBudi Santoso,budi@example.com,abc123\n',
    );
  };

  const handleReset = () => {
    setFileName(null);
    setRows([]);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validRows = rows.filter((r) => !r.rowError);
  const invalidCount = rows.length - validRows.length;
  const canSubmit = rows.length > 0 && validRows.length > 0 && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const payload: BatchRegisterRow[] = validRows.map(
        ({ rowError: _rowError, ...r }) => r,
      );
      const response = await batchRegisterStudents(
        payload,
        defaultPassword.trim() || undefined,
      );
      setResult(response);
      toast.success(
        `${response.summary.created} akun dibuat, ${response.summary.skipped} dilewati, ${response.summary.failed} gagal.`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Gagal memproses batch register.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
      {/* Page header */}
      <div className='mb-6'>
        <Link
          href='/admin/user'
          className='mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700'
        >
          <ArrowLeft className='h-4 w-4' />
          Kembali ke Manajemen Pengguna
        </Link>
        <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
          Batch Register Siswa
        </h1>
        <p className='mt-1 text-sm text-slate-500'>
          Upload file CSV atau Excel untuk membuat banyak akun siswa sekaligus.
        </p>
      </div>

      {/* Toolbar: template download */}
      <div className='mb-4 flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          className='gap-1.5'
          onClick={handleDownloadTemplate}
        >
          <Download className='h-4 w-4' />
          Unduh Template
        </Button>
      </div>

      {/* Dropzone */}
      <div className='mb-6 rounded-[var(--radius-card)] border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated-1)]'>
        <label className='flex flex-col items-center justify-center w-full rounded-md border-2 border-dashed py-10 cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition'>
          <div className='flex flex-col items-center gap-2 text-slate-500'>
            <UploadCloud className='w-8 h-8' />
            <span className='text-sm font-medium'>
              {fileName ? fileName : 'Klik untuk upload file'}
            </span>
            <span className='text-xs text-slate-400'>
              CSV atau Excel (.xlsx), maks {MAX_BATCH_ROWS} baris
            </span>
          </div>
          <input
            ref={fileInputRef}
            type='file'
            accept='.csv,.xlsx'
            className='hidden'
            onChange={handleFileChange}
          />
        </label>

        {parseError && (
          <p className='mt-3 text-sm text-red-600'>{parseError}</p>
        )}

        <div className='mt-4 max-w-xs'>
          <label className='mb-1 block text-xs font-medium text-slate-600'>
            Default password (untuk baris tanpa password)
          </label>
          <Input
            type='text'
            placeholder='mis. sekolah2026'
            value={defaultPassword}
            onChange={(e) => handleDefaultPasswordChange(e.target.value)}
          />
        </div>
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <div className='mb-6 overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[var(--shadow-elevated-1)]'>
          <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
            <p className='text-sm font-medium text-slate-700'>
              Pratinjau — {rows.length} baris
              {invalidCount > 0 && (
                <span className='ml-2 text-red-600'>
                  ({invalidCount} tidak valid)
                </span>
              )}
            </p>
            <Button variant='ghost' size='sm' onClick={handleReset}>
              Reset
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50 hover:bg-slate-50'>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow
                  key={`${row.email}-${idx}`}
                  className={cn(row.rowError && 'bg-red-50')}
                >
                  <TableCell className='px-3 py-2'>{row.name || '-'}</TableCell>
                  <TableCell className='px-3 py-2'>
                    {row.email || '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2 text-slate-500'>
                    {row.password
                      ? '••••••'
                      : defaultPassword
                        ? '(default)'
                        : '-'}
                  </TableCell>
                  <TableCell className='px-3 py-2'>
                    {row.rowError ? (
                      <span className='text-xs text-red-600'>
                        {row.rowError}
                      </span>
                    ) : (
                      <span className='text-xs text-primary-600'>Valid</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex justify-end border-t border-slate-200 px-4 py-3'>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className='gap-1.5'
            >
              {submitting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <FileUp className='h-4 w-4' />
              )}
              Daftarkan {validRows.length} Siswa
            </Button>
          </div>
        </div>
      )}

      {/* Empty state (no file yet) */}
      {rows.length === 0 && !parseError && (
        <EmptyState
          icon={FileUp}
          title='Belum ada file diunggah'
          description='Unggah file CSV atau Excel berisi kolom name, email, dan password untuk memulai.'
        />
      )}

      {/* Results */}
      {result && (
        <div className='overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-white shadow-[var(--shadow-elevated-1)]'>
          <div className='border-b border-slate-200 px-4 py-3'>
            <p className='text-sm font-medium text-slate-700'>
              Hasil: {result.summary.created} dibuat, {result.summary.skipped}{' '}
              dilewati, {result.summary.failed} gagal (dari{' '}
              {result.summary.total})
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50 hover:bg-slate-50'>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.results.map((r, idx) => {
                const config = STATUS_CONFIG[r.status];
                const Icon = config.icon;
                return (
                  <TableRow key={`${r.email}-${idx}`}>
                    <TableCell className='px-3 py-2'>{r.email}</TableCell>
                    <TableCell className='px-3 py-2'>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          config.className,
                        )}
                      >
                        <Icon className='h-3.5 w-3.5' />
                        {config.label}
                      </span>
                    </TableCell>
                    <TableCell className='px-3 py-2 text-sm text-slate-500'>
                      {r.reason || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
