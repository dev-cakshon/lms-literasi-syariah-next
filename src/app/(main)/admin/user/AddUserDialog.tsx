'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError, batchRegisterStudents } from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const addUserFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

type AddUserFormValues = z.infer<typeof addUserFormSchema>;

const emptyValues: AddUserFormValues = { name: '', email: '', password: '' };

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

// Single-user create — reuses the PRD14 batch-register endpoint with a
// one-element array. There is no dedicated single-user admin-create route;
// batchRegisterStudents runs entirely server-side (Admin SDK), so — unlike
// `authRegister` — it never touches the admin's own Firebase session.
// New users are always created with role "student"; promote via the role
// dropdown in the table afterward if needed.
export function AddUserDialog({
  open,
  onOpenChange,
  onCreated,
}: AddUserDialogProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) form.reset(emptyValues);
  }, [open, form]);

  const onSubmit = async (values: AddUserFormValues) => {
    setSaving(true);
    try {
      const res = await batchRegisterStudents([values], undefined);
      const row = res.results[0];

      if (row?.status === 'created') {
        toast.success('Pengguna berhasil dibuat.');
        onCreated();
        onOpenChange(false);
      } else if (row?.status === 'skipped') {
        form.setError('email', {
          message: row.reason || 'Email sudah terdaftar.',
        });
      } else {
        toast.error(row?.reason || 'Gagal membuat pengguna.');
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal membuat pengguna.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md bg-white'>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nama lengkap'
                      disabled={saving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='nama@email.com'
                      disabled={saving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Sandi</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Minimal 6 karakter'
                      disabled={saving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type='submit' disabled={saving}>
                {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
