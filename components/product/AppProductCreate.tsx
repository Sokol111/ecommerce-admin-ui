'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  confirmUploadAction,
  createProductAction,
  getDeliveryUrlAction,
  presignImageAction,
} from '@/lib/actions';
import { putToS3 } from '@/lib/client/s3-client';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

export const productSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters',
  }),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  enabled: z.boolean(),
});

export default function AppProductCreate() {
  const router = useRouter();
  const [draftId] = useState<string>(crypto.randomUUID());

  const [imageId, setImageId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      quantity: 0,
      enabled: false,
    },
  });

  async function onSubmit(value: z.infer<typeof productSchema>) {
    await createProductAction(value);
    router.push('/product/list');
  }

  async function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setUploading(true);
    try {
      // Перевірка MIME типу (додатково до accept="image/*" у інпуті)
      if (!file.type.startsWith('image/')) {
        setError('Дозволені лише файли зображень');
        setUploading(false);
        return;
      }
      // (Опціонально) Перевірка розміру файлу, напр. <= 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Розмір зображення не повинен перевищувати 5MB');
        setUploading(false);
        return;
      }
      const presignResponse = await presignImageAction({
        ownerId: draftId,
        filename: file.name,
        size: file.size,
      });
      alert('Presigned URL: ' + presignResponse.uploadUrl);
      console.log('Presign response:', presignResponse);
      await putToS3(presignResponse.uploadUrl, presignResponse.requiredHeaders, file);
      alert('Uploaded to S3');
      const image = await confirmUploadAction({ ownerId: draftId, key: presignResponse.key });
      console.log('Confirm response:', image);
      alert('Confirmed upload, image ID: ' + image.id);
      setImageId(image.id);
      const url = await getDeliveryUrlAction(image.id, 480);
      console.log('Delivery URL:', url);
      alert('Delivery URL: ' + url);
      setPreviewUrl(url);
    } catch (e) {
      console.error(e);
      setError('Upload failed');
      setImageId(null);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'price'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product price</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'quantity'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product quantity</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'enabled'}
          render={({ field }) => (
            <FormItem className="space-x-3">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>Enabled</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label>Product image</Label>
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => handleFileChange(e.target.files)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {previewUrl && (
            <>
              <div>
                ImageId: <div>{imageId}</div>
              </div>
              <div className="mt-2">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={480}
                  height={360}
                  className="rounded border"
                />
              </div>
            </>
          )}
        </div>
        <Button type="submit" disabled={uploading}>
          Save
        </Button>
      </form>
    </Form>
  );
}
