/**
 * Upload file to S3/MinIO using POST policy (multipart/form-data).
 * POST policy enforces exact file size at the storage level, preventing
 * attackers from uploading files larger than requested.
 */
export async function postToS3(
  uploadUrl: string,
  formDataFields: Record<string, string>,
  file: File
) {
  const formData = new FormData();

  // Add all policy fields BEFORE the file (order matters for S3!)
  Object.entries(formDataFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // File must be the LAST field
  formData.append('file', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${text}`);
  }
}
