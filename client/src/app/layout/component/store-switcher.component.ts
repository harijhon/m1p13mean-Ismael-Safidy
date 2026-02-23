import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { StoreService } from '../../core/services/store.service';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '../../models/store.model';

@Component({
    selector: 'app-store-switcher',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule],
    template: `
    <div class="store-switcher ml-4" *ngIf="isManager && stores.length > 0">
      <p-select 
        [options]="stores" 
        [ngModel]="activeStore" 
        (ngModelChange)="onStoreChange($event)"
        optionLabel="name" 
        placeholder="Sélectionnez un magasin" 
        styleClass="w-full md:w-14rem"
      >
        <ng-template pTemplate="selectedItem" let-selectedOption>
            <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                <i class="pi pi-shop text-primary"></i>
                <div>{{ selectedOption.name }}</div>
            </div>
        </ng-template>
        <ng-template pTemplate="item" let-store>
            <div class="flex align-items-center gap-2">
                <i class="pi pi-shop"></i>
                <div>{{ store.name }}</div>
            </div>
        </ng-template>
      </p-select>
    </div>
  `
})
export class StoreSwitcherComponent implements OnInit {
    storeService = inject(StoreService);
    authService = inject(AuthService);

    stores: Store[] = [];
    isManager = false;

    get activeStore(): Store | null {
        return this.storeService.activeStore();
    }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.isManager = user?.role === 'manager';
            if (this.isManager) {
                this.storeService.loadUserStores().subscribe(stores => {
                    this.stores = stores;
                });
            }
        });
    }

    onStoreChange(store: Store) {
        if (store) {
            this.storeService.activeStore.set(store);
        }
    }
}
