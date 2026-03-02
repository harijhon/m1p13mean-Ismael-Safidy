export interface Store {
    _id?: string;
    name: string;
    logo?: string;
    description?: string;
    status?: 'CREATED' | 'VALIDATED' | 'PRE_NOTICE' | 'WITHDRAWN';
    statusHistory?: { status: string; date: string }[];
    rentContract?: {
        boxId?: any;
        requestedBoxId?: any;
        monthlyAmount?: number;
        paymentDueDate?: number;
    };
    evictionReason?: string;
    evictionDate?: string;
    createdAt?: string;
    owner?: {
        _id: string;
        name: string;
        email: string;
    };
}
