import { confirmUploadAction, getDeliveryUrlAction, presignImageAction } from '@/lib/actions';
import { putToS3 } from '@/lib/client/s3-client';
import { actionErrorToDescription } from '@/lib/utils/toast-helpers';
import { useEffect, useState } from 'react';
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
export type DraftFormValues = { ownerId: string; imageId?: string | undefined };

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

  // Load existing image URL on mount if imageId is present
  useEffect(() => {
    const existingImageId = form.getValues().imageId;
    if (existingImageId) {
      getDeliveryUrlAction(existingImageId, previewWidth).then((urlResult) => {
        if (urlResult.success) {
          setPreviewUrl(urlResult.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setImageUploading(true);
    try {
      const ownerId = form.getValues().ownerId;
      const presignResponse = await presignImageAction({
        ownerId: ownerId,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      });

      if (!presignResponse.success) {
        const errorMsg = presignResponse.error.detail || presignResponse.error.title;
        setError(errorMsg);
        toast.error(presignResponse.error.title, {
          description: actionErrorToDescription(presignResponse.error),
        });
        return;
      }

      await putToS3(presignResponse.data.uploadUrl, presignResponse.data.requiredHeaders, file);

      const imageResult = await confirmUploadAction({
        ownerId: ownerId,
        key: presignResponse.data.key,
        mime: file.type,
      });

      if (!imageResult.success) {
        const errorMsg = imageResult.error.detail || imageResult.error.title;
        setError(errorMsg);
        toast.error(imageResult.error.title, {
          description: actionErrorToDescription(imageResult.error),
        });
        return;
      }

      const urlResult = await getDeliveryUrlAction(imageResult.data.id, previewWidth);

      if (!urlResult.success) {
        const errorMsg = urlResult.error.detail || urlResult.error.title;
        setError(errorMsg);
        toast.error(urlResult.error.title, {
          description: actionErrorToDescription(urlResult.error),
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
      const errorDetail =
        e instanceof Error ? e.message : 'An unexpected error occurred while uploading the image';
      toast.error('Upload failed', {
        description: errorDetail,
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
