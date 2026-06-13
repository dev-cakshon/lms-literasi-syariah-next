'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiError, updateMyDisplayName } from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/contexts/AuthContext';

const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(40, 'Nama maksimal 40 karakter'),
});

type NameFormValues = z.infer<typeof nameSchema>;

export function FirstLoginNamePrompt() {
  const { userProfile, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: '' },
  });

  // Only show for students who haven't confirmed their display name yet.
  // `displayNameConfirmed !== true` intentionally treats a missing flag
  // (provisioned students) the same as an explicit false.
  if (
    !userProfile ||
    userProfile.role !== 'student' ||
    userProfile.displayNameConfirmed === true
  ) {
    return null;
  }

  const onSubmit = async (values: NameFormValues) => {
    try {
      setSubmitting(true);
      await updateMyDisplayName(values.name);
      // Re-fetch profile — flag is now true, this component unmounts itself.
      await refreshProfile();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Gagal menyimpan nama. Coba lagi.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // `open` is always true here (render gate above already controls visibility).
    // No `onOpenChange` ⇒ dialog cannot close itself.
    <Dialog open>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className='fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg'
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className='text-xl'>Siapa namamu?</DialogTitle>
            <DialogDescription>
              Yuk kenalan dulu — tulis namamu supaya kami bisa menyapamu.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder='Tulis namamu di sini...'
                        autoFocus
                        autoComplete='name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='submit' className='w-full' disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
