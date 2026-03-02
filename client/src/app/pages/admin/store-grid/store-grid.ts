import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../core/services/store.service';
import { Store } from '../../../models/store.model';
import { RentService, RentInvoice } from '../../../core/services/rent.service';
import { TagModule } from 'primeng/tag';

export interface GridBox {
  boxNumber: number;
  floor: number;
  store: Store | null;
  status: 'LIBRE' | 'OCCUPE' | 'PRE_AVIS';
  rentStatus: 'PAID' | 'UNPAID' | 'NONE';
}

@Component({
  selector: 'app-store-grid',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './store-grid.html',
  styleUrls: ['./store-grid.scss']
})
export class StoreGrid implements OnInit {
  private storeService = inject(StoreService);
  private rentService = inject(RentService);

  stores = signal<Store[]>([]);
  invoices = signal<RentInvoice[]>([]);

  // Total 5 floors, 20 boxes per floor
  floors = [1, 2, 3, 4, 5];
  boxesPerFloor = 20;

  // Derived signal: builds the 100-box grid based on stores data
  grid = computed(() => {
    const currentStores = this.stores();
    const currentInvoices = this.invoices();

    const map = new Map<number, Store>();
    const invoiceMap = new Map<string, RentInvoice>();

    // Map stores to their box numbers
    currentStores.forEach(s => {
      if (s.rentContract?.boxId?.boxNumber) {
        map.set(s.rentContract.boxId.boxNumber, s);
      }
    });

    // Map invoices to their Store ID
    currentInvoices.forEach(inv => {
      if (inv.store?._id) {
        invoiceMap.set(inv.store._id, inv);
      }
    });

    const result: { floor: number, boxes: GridBox[] }[] = [];

    for (let floor of this.floors) {
      const floorBoxes: GridBox[] = [];
      for (let num = 1; num <= this.boxesPerFloor; num++) {
        const boxNumber = (floor * 100) + num;
        const occupyingStore = map.get(boxNumber) || null;

        let status: 'LIBRE' | 'OCCUPE' | 'PRE_AVIS' = 'LIBRE';
        let rentStatus: 'PAID' | 'UNPAID' | 'NONE' = 'NONE';

        if (occupyingStore) {
          status = occupyingStore.status === 'PRE_NOTICE' ? 'PRE_AVIS' : 'OCCUPE';

          if (occupyingStore._id) {
            const invoice = invoiceMap.get(occupyingStore._id);
            if (invoice) {
              rentStatus = (invoice.status === 'PAID') ? 'PAID' : 'UNPAID';
            }
          }
        }

        floorBoxes.push({
          boxNumber,
          floor,
          store: occupyingStore,
          status,
          rentStatus
        });
      }
      result.push({ floor, boxes: floorBoxes });
    }

    return result;
  });

  ngOnInit() {
    this.storeService.getStores().subscribe({
      next: (data) => this.stores.set(data),
      error: (err) => console.error('Failed to fetch stores for grid:', err)
    });

    // Fetch invoices for current month
    const currentDate = new Date();
    this.rentService.getInvoices(currentDate.getMonth() + 1, currentDate.getFullYear()).subscribe({
      next: (data) => this.invoices.set(data),
      error: (err) => console.error('Failed to fetch invoices for grid:', err)
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'LIBRE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'OCCUPE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PRE_AVIS': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
