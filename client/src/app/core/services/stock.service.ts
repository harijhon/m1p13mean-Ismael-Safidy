import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

export interface MouvementStock {
    _id?: string;
    product_id: string | Product;
    type: 'entree' | 'sortie';
    quantite: number;
    pu: number;
    date?: string;
    reste?: number;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private http = inject(HttpClient);
    private apiUrl = '/api/stock';

    getMouvementsByProduct(productId: string): Observable<MouvementStock[]> {
        return this.http.get<MouvementStock[]>(`${this.apiUrl}/product/${productId}`);
    }

    createMouvement(mouvement: Partial<MouvementStock>): Observable<MouvementStock> {
        return this.http.post<MouvementStock>(this.apiUrl, mouvement);
    }
}
