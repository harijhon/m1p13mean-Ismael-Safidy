export interface Store {
    _id?: string;
    name: string;
    logo?: string;
    description?: string;
    createdAt?: string;
    owner?: {
        _id: string;
        name: string;
        email: string;
    };
}
