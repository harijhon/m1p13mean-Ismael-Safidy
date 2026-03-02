import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../core/services/store.service';
import { Store } from '../../../models/store.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-store-validation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './store-validation.html',
  styleUrls: ['./store-validation.scss']
})
export class StoreValidationComponent implements OnInit {
  private storeService = inject(StoreService);
  private messageService = inject(MessageService);

  pendingStores = signal<Store[]>([]);
  emptyBoxes = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Dialog State
  validationDialog = false;
  selectedStore: Store | null = null;
  selectedBox: any = null;
  monthlyRent: number = 0;

  ngOnInit() {
    this.loadPendingStores();
    this.loadEmptyBoxes();
  }

  loadPendingStores() {
    this.loading.set(true);
    this.storeService.getStores().subscribe({
      next: (stores) => {
        const pending = stores.filter(s => s.status === 'CREATED');
        this.pendingStores.set(pending);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  loadEmptyBoxes() {
    this.storeService.getEmptyBoxes().subscribe({
      next: (boxes) => {
        const mappedBoxes = boxes.map(b => ({
          label: `Box ${b.boxNumber} (Étage ${b.floor})`,
          value: b._id,
          floor: b.floor
        }));
        this.emptyBoxes.set(mappedBoxes);
      },
      error: (err) => console.error(err)
    });
  }

  openValidationDialog(store: Store) {
    this.selectedStore = store;
    this.selectedBox = store.rentContract?.requestedBoxId?._id || null;
    this.monthlyRent = 1000; // Default or suggested amount
    this.validationDialog = true;
  }

  confirmValidation() {
    if (!this.selectedStore || !this.selectedStore._id || !this.selectedBox) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner un box valide.' });
      return;
    }

    this.storeService.validateStore(this.selectedStore._id, this.selectedBox, this.monthlyRent).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Magasin validé et box assigné avec succès.' });
        this.validationDialog = false;
        this.loadPendingStores(); // Refresh list
        this.loadEmptyBoxes();    // Refresh available boxes
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la validation du magasin.' });
      }
    });
  }
}
