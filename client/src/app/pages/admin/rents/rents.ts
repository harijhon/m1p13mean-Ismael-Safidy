import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentService, RentInvoice } from '../../../core/services/rent.service';
import { AuthService } from '../../../core/services/auth.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-rents',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule],
  templateUrl: './rents.html',
  styleUrls: ['./rents.scss']
})
export class RentsComponent implements OnInit {
  private rentService = inject(RentService);
  public authService = inject(AuthService);

  invoices = signal<RentInvoice[]>([]);
  loading = signal<boolean>(true);
  isAdmin = signal<boolean>(false);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.role === 'admin') {
      this.isAdmin.set(true);
      this.loadAllInvoices();
    } else {
      this.loadMyInvoices();
    }
  }

  loadAllInvoices() {
    this.loading.set(true);
    this.rentService.getAllInvoices().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  loadMyInvoices() {
    this.loading.set(true);
    this.rentService.getMyInvoices().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIAL': return 'warning';
      case 'LATE': return 'danger';
      case 'PENDING': return 'info';
      default: return 'info';
    }
  }

  translateStatus(status: string) {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PARTIAL': return 'Partiel';
      case 'LATE': return 'En Retard';
      case 'PENDING': return 'En Attente';
      default: return status;
    }
  }
}
