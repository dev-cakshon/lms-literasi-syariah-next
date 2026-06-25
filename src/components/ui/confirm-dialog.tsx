'use client';

import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button-variants';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm action as a destructive (red) button. */
  destructive?: boolean;
  /**
   * Called when the user confirms. May be async — the dialog shows a busy
   * state while it resolves, closes on success, and stays open if it throws
   * (so the caller can surface an error and let the user retry).
   */
  onConfirm: () => void | Promise<void>;
}

/**
 * A controlled confirmation dialog built on the AlertDialog primitive.
 * Replaces native window.confirm() for destructive admin actions.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);

  const handleConfirm = async (event: React.MouseEvent) => {
    // Prevent Radix from auto-closing so we control timing around onConfirm.
    event.preventDefault();
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Leave the dialog open; the caller is responsible for surfacing the error.
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={busy}
            className='border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100'
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={busy}
            className={
              destructive
                ? buttonVariants({ variant: 'destructive' })
                : undefined
            }
          >
            {busy ? 'Memproses…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
