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
  store?: any;
}

export interface Variant {
  _id?: string;
  sku: string;
  attributes: { [key: string]: string };
  price: number;
  stock: number;
}