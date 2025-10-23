import { confirmUploadAction, getDeliveryUrlAction, presignImageAction } from '@/lib/actions';
import { putToS3 } from '@/lib/client/s3-client';
import { useState } from 'react';
import { toast } from 'sonner';

export interface UseImageUploadState {
  previewUrl: string | null;
  error: string | null; // TODO: replace with structured error type later
  imageUploading: boolean;
}

export interface UseImageUploadApi extends UseImageUploadState {
  handleFileChange: (files: FileList | null) => Promise<void>;
  resetImage: () => void;
}

// Form shape minimal requirements for this hook
export type DraftFormValues = { draftId: string; imageId?: string | undefined };

// Minimal adapter instead of full UseFormReturn to reduce coupling
export interface DraftFormAdapter {
  getValues: () => DraftFormValues;
  setValue: (name: 'imageId', value: DraftFormValues['imageId']) => void;
}

export function useImageUpload(
  form: DraftFormAdapter,
  previewWidth: number = 480
): UseImageUploadApi {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  async function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setImageUploading(true);
    try {
      const draftId = form.getValues().draftId;
      const presignResponse = await presignImageAction({
        ownerId: draftId,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      });

      if (!presignResponse.success) {
        const errorMsg = presignResponse.error.detail || presignResponse.error.title;
        setError(errorMsg);
        toast.error(presignResponse.error.title, {
          description: presignResponse.error.detail,
        });
        return;
      }

      await putToS3(presignResponse.data.uploadUrl, presignResponse.data.requiredHeaders, file);

      const imageResult = await confirmUploadAction({
        ownerId: draftId,
        key: presignResponse.data.key,
        mime: file.type,
      });

      if (!imageResult.success) {
        const errorMsg = imageResult.error.detail || imageResult.error.title;
        setError(errorMsg);
        toast.error(imageResult.error.title, {
          description: imageResult.error.detail,
        });
        return;
      }

      const urlResult = await getDeliveryUrlAction(imageResult.data.id, previewWidth);

      if (!urlResult.success) {
        const errorMsg = urlResult.error.detail || urlResult.error.title;
        setError(errorMsg);
        toast.error(urlResult.error.title, {
          description: urlResult.error.detail,
        });
        return;
      }

      form.setValue('imageId', imageResult.data.id);
      setPreviewUrl(urlResult.data);
      toast.success('Image uploaded successfully');
    } catch (e) {
      console.error(e);
      const errorMessage = 'Upload failed';
      setError(errorMessage);
      toast.error('Upload failed', {
        description: 'An unexpected error occurred while uploading the image',
      });
      form.setValue('imageId', undefined);
      setPreviewUrl(null);
    } finally {
      setImageUploading(false);
    }
  }
  function resetImage() {
    form.setValue('imageId', undefined);
    setPreviewUrl(null);
    setError(null);
  }

  return { previewUrl, error, imageUploading, handleFileChange, resetImage };
}
