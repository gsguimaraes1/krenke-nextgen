import { supabase } from '../../lib/supabase';

export interface UploadedFile {
  file_url: string;
  file_name: string;
  file_size: number;
  content_type: string;
}

export async function uploadAttachment(file: File, opts?: { authed?: boolean }): Promise<UploadedFile> {
  const form = new FormData();
  form.append('file', file);

  const headers: Record<string, string> = {};
  if (opts?.authed && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch('/api/upload-attachment', {
    method: 'POST',
    headers,
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao enviar arquivo.');
  return json;
}
