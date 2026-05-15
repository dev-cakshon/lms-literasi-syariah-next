'use client';

import { ImageIcon, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, getUploadUrl } from '@/lib/api';
import { buildMediaViewUrl } from '@/lib/media';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    value ? buildMediaViewUrl(value) : null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(buildMediaViewUrl(value));
    setError(null);
  }, [value]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB.');
        return;
      }

      try {
        setUploading(true);

        // Get signed upload URL
        const { uploadUrl, filePath } = await getUploadUrl({
          fileName: file.name,
          contentType: file.type,
          folder: 'thumbnails',
        });

        // Upload file to signed URL
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        onChange(filePath);

        // Display through backend resolver while keeping filePath in DB.
        setPreviewUrl(buildMediaViewUrl(filePath));
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Gagal mengupload gambar.');
        }
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
  };

  return (
    <div className='space-y-2'>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      {value ? (
        <div className='relative w-full max-w-md aspect-video rounded-md overflow-hidden border bg-slate-100'>
          <Image
            src={previewUrl || value}
            alt='Thumbnail'
            fill
            className='object-cover'
          />
          <button
            type='button'
            onClick={handleRemove}
            className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition'
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className='flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed rounded-md cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition'>
          {uploading ? (
            <div className='flex flex-col items-center gap-2 text-slate-500'>
              <Loader2 className='w-8 h-8 animate-spin' />
              <span className='text-sm'>Mengupload...</span>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 text-slate-500'>
              <ImageIcon className='w-8 h-8' />
              <span className='text-sm'>Klik untuk upload gambar</span>
              <span className='text-xs text-slate-400'>
                PNG, JPG, WEBP (max 5MB)
              </span>
            </div>
          )}
          <input
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};
