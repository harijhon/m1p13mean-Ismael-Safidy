import { Product } from './product.model';

export interface Promotion {
    _id?: string;
    store: string;
    product: Product | string;
    discountPercent: number;
    startDate: Date | string;
    endDate: Date | string;
    usageLimit?: number | null;
    usageCount?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
