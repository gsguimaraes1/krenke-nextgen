import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, X, Loader2, ImageOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadAttachment, UploadedFile } from '../lib/upload';
import { TicketAttachment } from '../types';

const MAX_FILES = 5;

// Dois modos: 'pending' — form público, chamado ainda não existe, upload some
// pro R2 na hora mas a linha em sac_ticket_attachments só é gravada junto do
// chamado (api/submit-ticket.js). 'attached' — modal do Kanban, chamado já
// existe, upload + insert direto (RLS libera pra staff via is_sac_staff()).
interface Props {
  mode: 'pending' | 'attached';
  ticketId?: string;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
}

const AttachmentField: React.FC<Props> = ({ mode, ticketId, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<UploadedFile[]>(value || []);
  const [attached, setAttached] = useState<TicketAttachment[]>([]);
  const [loadingList, setLoadingList] = useState(mode === 'attached');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttached = async () => {
    if (mode !== 'attached' || !ticketId || !supabase) return;
    setLoadingList(true);
    const { data } = await supabase
      .from('sac_ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setAttached((data || []) as TicketAttachment[]);
    setLoadingList(false);
  };

  useEffect(() => { loadAttached(); }, [mode, ticketId]);

  const count = mode === 'pending' ? pending.length : attached.length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    setError(null);
    const files = Array.from(fileList).slice(0, MAX_FILES - count);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = await uploadAttachment(file, { authed: mode === 'attached' });
        if (mode === 'pending') {
          setPending((prev) => {
            const next = [...prev, uploaded];
            onChange?.(next);
            return next;
          });
        } else if (ticketId && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('sac_ticket_attachments').insert([{
            ticket_id: ticketId,
            file_url: uploaded.file_url,
            file_name: uploaded.file_name,
            file_size: uploaded.file_size,
            content_type: uploaded.content_type,
            uploaded_by: user?.id,
          }]);
          await loadAttached();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePending = (idx: number) => {
    setPending((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      onChange?.(next);
      return next;
    });
  };

  const removeAttached = async (id: string) => {
    if (!supabase) return;
    await supabase.from('sac_ticket_attachments').delete().eq('id', id);
    setAttached((prev) => prev.filter((a) => a.id !== id));
  };

  const items = mode === 'pending'
    ? pending.map((p, i) => ({ key: String(i), name: p.file_name, url: p.file_url, onRemove: () => removePending(i) }))
    : attached.map((a) => ({ key: a.id, name: a.file_name, url: a.file_url, onRemove: () => removeAttached(a.id) }));

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">Fotos (opcional)</label>
      {loadingList ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      ) : (
        <div className="space-y-1.5">
          {items.map((it) => (
            <div key={it.key} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs">
              <a href={it.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 font-semibold truncate flex-1 hover:text-krenke-orange">
                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{it.name}</span>
              </a>
              <button type="button" onClick={it.onRemove} className="text-slate-400 hover:text-red-500 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5"><ImageOff className="w-3.5 h-3.5" /> Nenhuma foto anexada.</p>
          )}
        </div>
      )}

      {count < MAX_FILES && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs font-bold text-krenke-orange flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
          {uploading ? 'Enviando...' : 'Anexar foto'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default AttachmentField;
