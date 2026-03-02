import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RentInvoice {
    _id: string;
    store: any; // Populated store object
    month: string | Date;
    amountDue: number;
    amountPaid: number;
    balance: number;
    status: 'PENDING' | 'PAID' | 'PARTIAL' | 'LATE';
    history: any[];
    createdAt?: string;
}

export interface RentStats {
    totalExpected: number;
    totalCollected: number;
    lateCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class RentService {
    private http = inject(HttpClient);
    // Remove hardcoded localhost in favor of proper proxy or interceptor if configured, but we will use standard:
    private apiUrl = '/api/rent';

    getStats(): Observable<RentStats> {
        return this.http.get<RentStats>(`${this.apiUrl}/stats`);
    }

    getInvoices(month?: number, year?: number, status?: string): Observable<RentInvoice[]> {
        let params = new HttpParams();
        if (month && year) {
            params = params.set('month', month.toString()).set('year', year.toString());
        }
        if (status) {
            params = params.set('status', status);
        }
        return this.http.get<RentInvoice[]>(this.apiUrl, { params });
    }

    generateInvoices(month: number, year: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/generate`, { month, year });
    }

    recordPayment(invoiceId: string, amount: number, note: string = ''): Observable<any> {
        return this.http.post(`${this.apiUrl}/payment`, { invoiceId, amount, note });
    }
}
