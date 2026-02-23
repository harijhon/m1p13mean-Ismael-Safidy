export interface CartItem {
  productId: string;
  variantSku: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
