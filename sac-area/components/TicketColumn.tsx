import React, { useState } from 'react';
import { Ticket, TicketStatus, STATUS_LABELS } from '../types';
import TicketCard from './TicketCard';

const STATUS_ACCENT: Record<TicketStatus, string> = {
  novo: 'border-t-blue-500',
  em_andamento: 'border-t-amber-500',
  aguardando_cliente: 'border-t-purple-500',
  resolvido: 'border-t-green-500',
  fechado: 'border-t-slate-400',
};

interface Props {
  status: TicketStatus;
  tickets: Ticket[];
  onCardClick: (ticket: Ticket) => void;
  onDrop: (status: TicketStatus, ticketId: string) => void;
}

const TicketColumn: React.FC<Props> = ({ status, tickets, onCardClick, onDrop }) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const ticketId = e.dataTransfer.getData('text/plain');
        if (ticketId) onDrop(status, ticketId);
      }}
      className={`flex-shrink-0 w-72 bg-slate-50 rounded-xl border-t-4 ${STATUS_ACCENT[status]} ${dragOver ? 'ring-2 ring-krenke-orange' : ''} flex flex-col max-h-full`}
    >
      <div className="px-3 py-2.5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">{STATUS_LABELS[status]}</h3>
        <span className="text-xs font-semibold bg-white text-slate-500 rounded-full w-6 h-6 flex items-center justify-center border border-slate-200">
          {tickets.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-2">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} onClick={() => onCardClick(t)} onDragStart={(e, ticket) => {
            e.dataTransfer.setData('text/plain', ticket.id);
          }} />
        ))}
        {tickets.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">Sem chamados</p>
        )}
      </div>
    </div>
  );
};

export default TicketColumn;
