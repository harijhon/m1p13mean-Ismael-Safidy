import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

import { PromotionService } from '../../../core/services/promotion.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Promotion } from '../../../models/promotion.model';
import { Product } from '../../../models/product.model';

@Component({
    selector: 'app-promotions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        ConfirmDialogModule,
        SkeletonModule,
        SelectModule,
        InputTextModule
    ],
    templateUrl: './promotions.component.html',
    providers: [MessageService, ConfirmationService, DatePipe]
})
export class PromotionsComponent implements OnInit {
    promotions: Promotion[] = [];
    products: Product[] = [];
    promoForm: FormGroup;

    submitted = false;
    promoDialog = false;
    isLoading = true;
    storeId: string | undefined;

    constructor(
        private fb: FormBuilder,
        private promotionService: PromotionService,
        private productService: ProductService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.promoForm = this.fb.group({
            product: ['', Validators.required],
            discountPercent: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            usageLimit: [null, [Validators.min(1)]]
        });
    }

    ngOnInit(): void {
        const user = this.authService.currentUser();
        this.storeId = user?.storeId;

        if (this.storeId) {
            this.loadPromotions();
            this.loadProducts();
        } else {
            this.isLoading = false;
        }
    }

    loadPromotions(): void {
        if (!this.storeId) return;
        this.isLoading = true;
        this.promotionService.getPromotionsByStore(this.storeId).subscribe({
            next: (data) => {
                this.promotions = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading promotions', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les promotions', life: 3000 });
                this.isLoading = false;
            }
        });
    }

    loadProducts(): void {
        this.productService.getProducts().subscribe({
            next: (data) => {
                // Filtrer les produits pour n'afficher que ceux sans promo active dans la création
                this.products = data.filter(p => p.isActive);
            },
            error: (err) => {
                console.error('Error loading products', err);
            }
        });
    }

    openNew(): void {
        this.promoForm.reset();
        this.submitted = false;
        this.promoDialog = true;
    }

    hideDialog(): void {
        this.promoDialog = false;
        this.submitted = false;
    }

    savePromotion(): void {
        this.submitted = true;

        if (this.promoForm.valid && this.storeId) {
            const formData = this.promoForm.value;
            const promoToSave: Partial<Promotion> = {
                store: this.storeId,
                product: formData.product,
                discountPercent: formData.discountPercent,
                startDate: formData.startDate,
                endDate: formData.endDate,
                usageLimit: formData.usageLimit ? formData.usageLimit : null
            };

            this.promotionService.createPromotion(promoToSave).subscribe({
                next: () => {
                    this.loadPromotions();
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Promotion créée et appliquée au produit', life: 3000 });
                    this.promoDialog = false;
                    this.promoForm.reset();
                },
                error: (err) => {
                    console.error('Error saving promotion:', err);
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de création', life: 3000 });
                }
            });
        }
    }

    stopPromotion(promo: Promotion): void {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment désactiver cette promotion ? Le prix du produit repassera à la normale immédiatement.',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (promo._id) {
                    this.promotionService.stopPromotion(promo._id).subscribe({
                        next: () => {
                            this.loadPromotions();
                            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Promotion désactivée', life: 3000 });
                        },
                        error: (err) => {
                            console.error('Error stopping promotion', err);
                            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de désactivation', life: 3000 });
                        }
                    });
                }
            }
        });
    }

    getStatusSeverity(isActive: boolean): string {
        return isActive ? 'success' : 'danger';
    }

    getLimitDisplay(limit: number | null | undefined): string {
        return limit ? limit.toString() : 'Illimité';
    }
}
