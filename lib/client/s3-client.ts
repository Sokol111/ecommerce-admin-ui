export async function putToS3(uploadUrl: string, headers: Record<string, string>, file: File) {
  const r = await fetch(uploadUrl, { method: 'PUT', headers, body: file });
  if (!r.ok) throw new Error(`PUT failed: ${r.status}`);
}
