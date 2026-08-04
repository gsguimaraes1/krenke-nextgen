import React from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  description: string;
  images?: string[];
  specs?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface NavItem {
  id?: string;
  label: string;
  path: string;
  isExternal?: boolean;
  subItems?: NavItem[];
}

export interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published: boolean;
  created_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: string;
  message: string;
  products: string[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  created_at: string;
}

export interface AppScript {
  id: string;
  title: string;
  content: string;
  placement: 'head' | 'body';
  is_active: boolean;
  created_at?: string;
}

export interface ResellerFolder {
  id: string;
  name: string;
  parent_id: string | null;
  allowed_roles: string[] | null;
  created_at: string;
}

export interface ResellerFile {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  folder_id: string | null;
  size: number;
  created_at: string;
  storage_path?: string | null;
  allowed_roles: string[] | null;
}

export interface Profile {
  id: string;
  email: string;
  role: 'super' | 'restricted' | 'reseller' | 'hr';
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  invited_at: string | null;
}

export interface JobOpening {
  id: string;
  title: string;
  contract_types: string[];
  department: string | null;
  location: string | null;
  description: string | null;
  requirements: string | null;
  is_active: boolean;
  application_count: number;
  created_at: string;
  updated_at: string;
}

export interface CalculatorProduct {
  id: string;
  code: string;
  description: string;
  unit_price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Item de orçamento persistido — snapshot textual, sem imagens. */
export interface QuoteItem {
  code: string;
  description: string;
  unit_price: number;
  qty: number;
}

/**
 * Orçamento salvo pela calculadora do revendedor (`orcamento_revendas`).
 * Imagens do parque NÃO são persistidas — seguem sendo anexo local da sessão.
 */
export interface ResellerQuote {
  id: string;
  quote_number: string;
  user_id: string;
  reseller_name: string | null;
  associated_reseller_name: string | null;
  model_name: string | null;
  client_name: string | null;
  client_cnpj: string | null;
  client_number: string | null;
  margin: number;
  payment_term: 'avista' | 'entrada' | null;
  items: QuoteItem[];
  total_bruto: number;
  total_ipi: number;
  total_com_ipi: number;
  use_full_disclaimer: boolean;
  disclaimer_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  opening_id: string | null;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  application_type: string;
  experience: string | null;
  education: string | null;
  salary_expectation: string | null;
  motivation: string | null;
  message: string | null;
  cv_url: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  submitted_at: string;
}