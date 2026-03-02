import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../models/product.model';
import { StockService, MouvementStock } from '../../../core/services/stock.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    DialogModule
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService]
})
export class Stock implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private stockService = inject(StockService);
  private messageService = inject(MessageService);

  products: Product[] = [];
  selectedProduct: Product | null = null;
  mouvements: MouvementStock[] = [];
  isLoading = false;

  mouvementDialog = false;
  mouvementForm: FormGroup;

  mouvementTypes = [
    { label: 'Entrée (Ajout)', value: 'entree' },
    { label: 'Sortie (Retrait)', value: 'sortie' }
  ];

  constructor() {
    this.mouvementForm = this.fb.group({
      product_id: [null, Validators.required],
      type: ['entree', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      pu: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts() {
    this.isLoading = true;
    try {
      this.productService.getProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits', life: 3000 });
          this.isLoading = false;
        }
      });
    } catch (e) {
      this.isLoading = false;
    }
  }

  onProductChange(event: any) {
    if (event.value) {
      this.selectedProduct = event.value;
      if (this.selectedProduct && this.selectedProduct._id) {
        this.loadMouvements(this.selectedProduct._id);
      }
    } else {
      this.selectedProduct = null;
      this.mouvements = [];
    }
  }

  loadMouvements(productId: string) {
    this.isLoading = true;
    this.stockService.getMouvementsByProduct(productId).subscribe({
      next: (data) => {
        this.mouvements = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les mouvements', life: 3000 });
        this.isLoading = false;
      }
    });
  }

  openNewMouvement() {
    this.mouvementForm.reset();
    this.mouvementForm.patchValue({
      type: 'entree',
      quantite: 1,
      pu: 0
    });

    if (this.selectedProduct) {
      this.mouvementForm.patchValue({ product_id: this.selectedProduct._id });
    }
    this.mouvementDialog = true;
  }

  hideDialog() {
    this.mouvementDialog = false;
  }

  saveMouvement() {
    if (this.mouvementForm.valid) {
      this.stockService.createMouvement(this.mouvementForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Mouvement enregistré avec succès', life: 3000 });
          this.mouvementDialog = false;

          const savedProductId = this.mouvementForm.value.product_id;
          if (this.selectedProduct && this.selectedProduct._id === savedProductId) {
            this.loadMouvements(savedProductId);
          }
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error?.message || 'Erreur lors de l\'enregistrement';
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 3000 });
        }
      });
    } else {
      this.mouvementForm.markAllAsTouched();
    }
  }

  getSeverity(type: string) {
    return type === 'entree' ? 'success' : 'danger';
  }
}
