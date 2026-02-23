import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion } from '../../models/promotion.model';

@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    private apiUrl = 'http://localhost:3000/api/promotions';

    constructor(private http: HttpClient) { }

    getPromotionsByStore(storeId: string): Observable<Promotion[]> {
        return this.http.get<Promotion[]>(`${this.apiUrl}/store/${storeId}`);
    }

    createPromotion(promotion: Partial<Promotion>): Observable<{ message: string, promo: Promotion }> {
        return this.http.post<{ message: string, promo: Promotion }>(this.apiUrl, promotion);
    }

    stopPromotion(promotionId: string): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/${promotionId}/stop`, {});
    }
}
