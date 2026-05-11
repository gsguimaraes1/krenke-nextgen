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
}

export interface Profile {
  id: string;
  email: string;
  role: 'super' | 'restricted' | 'reseller';
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}