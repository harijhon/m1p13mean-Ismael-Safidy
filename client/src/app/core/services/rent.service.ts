import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RentStats {
    totalExpected: number;
    totalCollected: number;
    lateCount: number;
}

export interface RentInvoice {
    _id: string;
    store: {
        _id: string;
        name: string;
        owner?: { name: string; email: string };
        rentContract?: { paymentDueDate?: number };
    };
    month: string;
    amountDue: number;
    amountPaid: number;
    balance: number;
    status: 'PENDING' | 'PAID' | 'PARTIAL' | 'LATE';
    history: any[];
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class RentService {
    private http = inject(HttpClient);
    private apiUrl = '/api/rent'; // Assuming you have a rent.routes.js in backend

    // For Managers: Get their own store invoices
    getMyInvoices(): Observable<RentInvoice[]> {
        return this.http.get<RentInvoice[]>(`${this.apiUrl}/my-invoices`);
    }

    // For Admins: Get all invoices
    getAllInvoices(): Observable<RentInvoice[]> {
        return this.http.get<RentInvoice[]>(this.apiUrl);
    }

    // New methods for Rent Manager
    getStats(): Observable<RentStats> {
        return this.http.get<RentStats>(`${this.apiUrl}/stats`);
    }

    getInvoices(month: number, year: number): Observable<RentInvoice[]> {
        return this.http.get<RentInvoice[]>(`${this.apiUrl}?month=${month}&year=${year}`);
    }

    generateInvoices(month: number, year: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/generate`, { month, year });
    }

    recordPayment(invoiceId: string, amount: number, note?: string): Observable<RentInvoice> {
        return this.http.post<RentInvoice>(`${this.apiUrl}/${invoiceId}/pay`, { amount, note });
    }
}
