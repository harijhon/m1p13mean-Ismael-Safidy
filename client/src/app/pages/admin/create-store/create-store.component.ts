import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card'; // Import CardModule
import { MessageService } from 'primeng/api';
import { StoreService } from '../../../core/services/store.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-store',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule], // Add CardModule here
  template: `
    <div class="flex justify-center items-center">
        <p-card header="Créez votre magasin pour commencer">
            <p class="text-gray-500 mb-6">Pour commencer à vendre et à gérer vos produits, vous devez d'abord créer un magasin.</p>
            <form #storeForm="ngForm" (ngSubmit)="createStore(storeForm.value.storeName)" class="p-fluid">
                <div class="field">
                    <label for="storeName" class="block font-bold mb-3">Nom du magasin</label>
                    <input 
                        id="storeName" 
                        name="storeName" 
                        pInputText 
                        ngModel 
                        required 
                        class="w-full"
                        #storeName="ngModel"
                        [ngClass]="{'ng-invalid ng-dirty': storeForm.submitted && storeName.invalid}"
                    />
                     <small *ngIf="storeForm.submitted && storeName.invalid" class="p-error">Le nom du magasin est requis.</small>
                </div>
                <button 
                    pButton 
                    type="submit" 
                    label="Créer et Continuer" 
                    icon="pi pi-check"
                    class="w-full mt-4"
                    [loading]="isSubmitting"
                    [disabled]="storeForm.invalid && storeForm.submitted"
                ></button>
            </form>
        </p-card>
    </div>
  `
})
export class CreateStoreComponent {
  private storeService = inject(StoreService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  
  isSubmitting = false;

  createStore(name: string): void {
    if (!name || name.trim() === '') {
      return;
    }
    this.isSubmitting = true;

    this.storeService.createStore({ name }).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Succès', 
          detail: 'Magasin créé ! Veuillez vous reconnecter pour continuer.' 
        });
        // Log out the user so they can log back in and get the new JWT with storeId
        setTimeout(() => this.authService.logout(), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: err.error?.message || 'Impossible de créer le magasin.' 
        });
      }
    });
  }
}
