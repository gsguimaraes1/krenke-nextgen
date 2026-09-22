export type TicketCategory = 'instalacao' | 'manutencao' | 'garantia' | 'duvida' | 'reclamacao' | 'outro';
export type TicketStatus = 'novo' | 'em_andamento' | 'aguardando_cliente' | 'resolvido' | 'fechado';
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export const TICKET_STATUSES: TicketStatus[] = ['novo', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  novo: 'Novo',
  em_andamento: 'Em Andamento',
  aguardando_cliente: 'Aguardando Cliente',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  garantia: 'Garantia',
  duvida: 'Dúvida',
  reclamacao: 'Reclamação',
  outro: 'Outro',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_city: string | null;
  client_state: string | null;
  product_name: string | null;
  order_reference: string | null;
  assigned_to: string | null;
  assignee?: StaffProfile | null;
  created_by: string | null;
  source: 'publico' | 'interno';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  due_at: string | null;
  attachments?: { count: number }[];
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  content_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export function isOverdue(ticket: Pick<Ticket, 'due_at' | 'status'>): boolean {
  if (!ticket.due_at) return false;
  if (ticket.status === 'resolvido' || ticket.status === 'fechado') return false;
  return new Date(ticket.due_at).getTime() < Date.now();
}

export type TicketEventType = 'comment' | 'note' | 'status_change';

export interface TicketEvent {
  id: string;
  ticket_id: string;
  author_id: string | null;
  author_name: string | null;
  type: TicketEventType;
  body: string | null;
  meta: Record<string, any> | null;
  created_at: string;
}
