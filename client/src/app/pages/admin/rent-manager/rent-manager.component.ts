import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RentService, RentInvoice, RentStats } from '@/core/services/rent.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-rent-manager',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputNumberModule,
        InputTextModule,
        DialogModule,
        TagModule,
        ToastModule
    ],
    templateUrl: './rent-manager.component.html',
    styleUrls: [],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class RentManagerComponent implements OnInit {
    stats: RentStats = { totalExpected: 0, totalCollected: 0, lateCount: 0 };
    invoices: RentInvoice[] = [];
    isLoading = true;

    // Dialog state
    paymentDialog = false;
    selectedInvoice: RentInvoice | null = null;
    paymentAmount: number = 0;
    paymentNote: string = '';

    // Filters
    filterMonth: number = new Date().getMonth() + 1;
    filterYear: number = new Date().getFullYear();

    constructor(private rentService: RentService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.loadStats();
        this.loadInvoices();
    }

    loadStats() {
        this.rentService.getStats().subscribe({
            next: (data) => this.stats = data,
            error: (err) => console.error('Error loading stats:', err)
        });
    }

    loadInvoices() {
        this.isLoading = true;
        this.rentService.getInvoices(this.filterMonth, this.filterYear).subscribe({
            next: (data) => {
                this.invoices = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading invoices:', err);
                this.isLoading = false;
            }
        });
    }

    generateMonthly() {
        this.rentService.generateInvoices(this.filterMonth, this.filterYear).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Généré', detail: `${res.created} factures créées.` });
                this.loadStats();
                this.loadInvoices();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de générer les factures.' });
            }
        });
    }

    openPaymentDialog(invoice: RentInvoice) {
        this.selectedInvoice = invoice;
        this.paymentAmount = invoice.balance > 0 ? invoice.balance : 0;
        this.paymentNote = '';
        this.paymentDialog = true;
    }

    savePayment() {
        if (!this.selectedInvoice) return;
        this.rentService.recordPayment(this.selectedInvoice._id, this.paymentAmount, this.paymentNote).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Paiement enregistré' });
                this.paymentDialog = false;
                this.loadStats();
                this.loadInvoices();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du paiement' });
            }
        });
    }

    getSeverity(status: string): any {
        switch (status) {
            case 'PAID': return 'success';
            case 'LATE': return 'danger';
            case 'PARTIAL': return 'warning';
            case 'PENDING': return 'info';
            default: return 'info';
        }
    }

    isLate(invoice: RentInvoice): boolean {
        if (invoice.status === 'PAID') return false;
        const dueDate = invoice.store?.rentContract?.paymentDueDate || 5;
        const invoiceDate = new Date(invoice.month);
        // Rough check if we are past the due date of that month
        const currentDate = new Date();
        // If current year/month is greater than invoice year/month, it's late.
        // If same month/year, check if day > dueDate
        if (currentDate.getFullYear() > invoiceDate.getFullYear()) return true;
        if (currentDate.getFullYear() === invoiceDate.getFullYear() && currentDate.getMonth() > invoiceDate.getMonth()) return true;
        if (currentDate.getFullYear() === invoiceDate.getFullYear() && currentDate.getMonth() === invoiceDate.getMonth() && currentDate.getDate() > dueDate) return true;

        return false;
    }
}
