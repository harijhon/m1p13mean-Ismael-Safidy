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
  sale?: {
    isActive: boolean;
    discountPercent: number;
    salePrice: number;
    promoId?: string;
  };
}

export interface Variant {
  _id?: string;
  sku: string;
  attributes: { [key: string]: string };
  price: number;
  stock: number;
  image?: string;
}