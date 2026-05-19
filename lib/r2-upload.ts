export async function uploadToR2(file: File, folder?: string): Promise<{ publicUrl: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  const res = await fetch('/api/upload-to-r2', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return { publicUrl: data.publicUrl, key: data.key };
}

export async function deleteFromR2(key: string): Promise<void> {
  // deletion handled server-side if needed; no-op for now
}
