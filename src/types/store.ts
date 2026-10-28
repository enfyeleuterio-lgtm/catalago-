export type ProductCategory =
  | 'Blusa'
  | 'Short'
  | 'Calça'
  | 'Saias'
  | 'Vestido longo'
  | 'Vestido curto'
  | 'Macaquinho'
  | 'Conjunto';

export const CATEGORIES: ProductCategory[] = [
  'Blusa',
  'Short',
  'Calça',
  'Saias',
  'Vestido longo',
  'Vestido curto',
  'Macaquinho',
  'Conjunto',
];

export type ProductStatus = 'disponivel' | 'vendida' | 'reservada';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  sizes: string[];
  colors?: string[];
  description: string;
  imageUrl: string;
  status: ProductStatus;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BagItem {
  productId: string;
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
}

export type BagStatus = 'nova' | 'separada' | 'em_prova' | 'finalizada';

export interface BagRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  customerImage?: string;
  items: BagItem[];
  totalAmount: number;
  status: BagStatus;
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  aboutText: string;
  instagramHandle: string;
  instagramUrl: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  logoUrl: string;
  passwordHash?: string;
  adminPasswordHash?: string;
}

export interface PublicStoreSettings {
  brandName: string;
  tagline: string;
  aboutText: string;
  instagramHandle: string;
  instagramUrl: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  logoUrl: string;
}
