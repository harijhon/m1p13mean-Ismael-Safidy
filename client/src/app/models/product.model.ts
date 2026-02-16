export interface Product {
  _id?: string;
  name: string;
  price: number;
  costPrice: number;
  currentStock: number;
  type: 'PRODUCT' | 'SERVICE';
  isActive: boolean;
  hasVariants: boolean;
  variants?: Variant[];
  images: string[];
}

export interface Variant {
  _id?: string;
  sku: string;
  attributes: Map<string, string>;
  price: number;
  stock: number;
}