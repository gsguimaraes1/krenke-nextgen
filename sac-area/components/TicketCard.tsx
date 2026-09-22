import React from 'react';
import { AlertTriangle, User, Paperclip, Clock } from 'lucide-react';
import { Ticket, CATEGORY_LABELS, PRIORITY_LABELS, isOverdue } from '../types';
import { timeAgo } from '../lib/time';

const PRIORITY_COLOR: Record<string, string> = {
  baixa: 'bg-slate-100 text-slate-600',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

interface Props {
  ticket: Ticket;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, ticket: Ticket) => void;
}

const TicketCard: React.FC<Props> = ({ ticket, onClick, onDragStart }) => {
  const overdue = isOverdue(ticket);
  const attachmentCount = ticket.attachments?.[0]?.count || 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      onClick={onClick}
      className={`bg-white rounded-xl border p-3 shadow-sm hover:shadow-md cursor-pointer transition space-y-2 ${overdue ? 'border-red-300' : 'border-slate-200'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[ticket.priority]}`}>
          {PRIORITY_LABELS[ticket.priority]}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-800 line-clamp-2">{ticket.title}</p>
      <p className="text-xs text-slate-500">{ticket.client_name}</p>
      {overdue && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" /> Atrasado
        </span>
      )}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {CATEGORY_LABELS[ticket.category]}
        </span>
        <div className="flex items-center gap-2 text-slate-400">
          {attachmentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]" title={`${attachmentCount} anexo(s)`}>
              <Paperclip className="w-3.5 h-3.5" />{attachmentCount}
            </span>
          )}
          {ticket.source === 'publico' && (
            <span title="Aberto pelo cliente"><AlertTriangle className="w-3.5 h-3.5" /></span>
          )}
          {ticket.assignee ? (
            <span
              className="w-5 h-5 rounded-full bg-krenke-purple text-white text-[10px] font-bold flex items-center justify-center"
              title={ticket.assignee.full_name || ticket.assignee.email || ''}
            >
              {(ticket.assignee.full_name || ticket.assignee.email || '?').slice(0, 1).toUpperCase()}
            </span>
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="text-[11px]">{timeAgo(ticket.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
