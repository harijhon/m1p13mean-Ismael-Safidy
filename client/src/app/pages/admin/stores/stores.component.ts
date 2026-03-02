import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { StoreService } from '@/core/services/store.service';
import { AuthService } from '@/core/services/auth.service';
import { Store } from '@/models/store.model';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    FileUploadModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    ConfirmDialogModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService]
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  storeForm: FormGroup;
  selectedStores: Store[] = [];
  submitted = false;
  storeDialog = false;
  isLoading = true;
  emptyBoxes: any[] = [];

  evictionDialog = false;
  evictionReason = '';
  selectedStoreToEvict: Store | null = null;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {
    this.storeForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      description: [''],
      logo: [''],
      requestedBoxId: [null]
    });
  }

  ngOnInit(): void {
    this.loadStores();
    this.loadEmptyBoxes();
  }

  loadEmptyBoxes(): void {
    this.storeService.getEmptyBoxes().subscribe({
      next: (boxes) => {
        this.emptyBoxes = boxes.map(b => ({
          label: `Box ${b.boxNumber} (Étage ${b.floor})`,
          value: b._id
        }));
      },
      error: (err) => console.error('Error loading empty boxes', err)
    });
  }

  isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'admin';
  }

  loadStores(): void {
    const user = this.authService.currentUser();
    const fetchObservable = user?.role === 'admin'
      ? this.storeService.getStores()
      : this.storeService.getMyStores();

    fetchObservable.subscribe({
      next: (data: Store[]) => {
        this.stores = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading stores:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load stores', life: 3000 });
        this.isLoading = false;
      }
    });
  }

  openNew(): void {
    this.storeForm.reset({
      name: '',
      description: '',
      logo: '',
      requestedBoxId: null
    });
    this.submitted = false;
    this.storeDialog = true;
  }

  deleteSelectedStores(): void {
    if (this.selectedStores && this.selectedStores.length > 0) {
      const numSelected = this.selectedStores.length;
      this.confirmationService.confirm({
        message: `Are you sure you want to delete ${numSelected} store(s)?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.performBulkDelete();
        },
        reject: () => {
          // User cancelled the deletion
        }
      });
    }
  }

  private performBulkDelete(): void {
    const deletePromises = this.selectedStores.map(store => {
      if (store._id) {
        return this.storeService.deleteStore(store._id).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(deletePromises).then(() => {
      this.loadStores();
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: `${this.selectedStores.length} stores deleted`,
        life: 3000
      });
      this.selectedStores = [];
    }).catch(error => {
      console.error('Error deleting stores:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete some stores',
        life: 3000
      });
    });
  }

  editStore(store: Store): void {
    this.storeForm.patchValue({
      _id: store._id,
      name: store.name,
      description: store.description,
      logo: store.logo,
      // requestedBoxId shouldn't typically be edited securely if it's already VALIDATED, but if it's CREATED we could show it.
      requestedBoxId: store.rentContract?.requestedBoxId?._id || null
    });
    this.storeDialog = true;
  }

  deleteStore(store: Store): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this store?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (store._id) {
          this.storeService.deleteStore(store._id).subscribe({
            next: () => {
              this.loadStores();
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Store Deleted', life: 3000 });
            },
            error: (error: any) => {
              console.error('Error deleting store:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete store', life: 3000 });
            }
          });
        }
      },
      reject: () => { }
    });
  }

  openEvictionDialog(store: Store): void {
    this.selectedStoreToEvict = store;
    this.evictionReason = '';
    this.evictionDialog = true;
  }

  sendEviction(): void {
    if (!this.selectedStoreToEvict || !this.selectedStoreToEvict._id || !this.evictionReason.trim()) return;

    this.storeService.sendEvictionNotice(this.selectedStoreToEvict._id, this.evictionReason).subscribe({
      next: () => {
        this.loadStores();
        this.messageService.add({ severity: 'success', summary: 'Préavis envoyé', detail: 'Le statut du magasin a été mis à jour', life: 3000 });
        this.evictionDialog = false;
        this.selectedStoreToEvict = null;
      },
      error: (err: any) => {
        console.error('Error evicting store:', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'envoi du préavis', life: 3000 });
      }
    });
  }

  hideDialog(): void {
    this.storeDialog = false;
    this.submitted = false;
  }

  saveStore(): void {
    this.submitted = true;

    if (this.storeForm.valid) {
      const storeData = this.storeForm.value;

      if (storeData._id) {
        // Update
        this.storeService.updateStore(storeData).subscribe({
          next: () => {
            this.loadStores();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Store Updated', life: 3000 });
            this.hideDialog();
          },
          error: (error: any) => {
            console.error('Error updating store:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update store', life: 3000 });
          }
        });
      } else {
        // Create
        // Remove _id if it's empty string to avoid backend issues
        delete storeData._id;
        this.storeService.createStore(storeData).subscribe({
          next: () => {
            this.loadStores();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Store Created', life: 3000 });
            this.hideDialog();
          },
          error: (error: any) => {
            console.error('Error creating store:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Failed to create store', life: 3000 });
          }
        });
      }
    }
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}

