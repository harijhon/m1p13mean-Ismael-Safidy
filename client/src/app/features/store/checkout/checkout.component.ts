import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService, OrderPayload } from '../../../core/services/order.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
    private fb = inject(FormBuilder);
    public cartService = inject(CartService);
    public orderService = inject(OrderService);
    private router = inject(Router);

    checkoutForm!: FormGroup;
    isProcessing = false;

    // Signals du panier
    cartItems = this.cartService.cartItems;
    cartTotal = this.cartService.totalAmount;

    ngOnInit(): void {
        // Si le panier est vide, on redirige vers le store
        if (this.cartItems().length === 0) {
            this.router.navigate(['/store']);
            return;
        }

        this.checkoutForm = this.fb.group({
            contact: this.fb.group({
                email: ['test@shopeasy.com', [Validators.required, Validators.email]],
                phone: ['+261340201524', [Validators.required, Validators.pattern(/^[0-9+ ]{8,15}$/)]]
            }),
            shipping: this.fb.group({
                firstName: ['Jean', Validators.required],
                lastName: ['Dupont', Validators.required],
                address: ['123 Rue de la République', Validators.required],
                city: ['Antananarivo', Validators.required],
                zipCode: ['101', Validators.required]
            }),
            paymentMethod: ['card', Validators.required],

            // Champs factices pour la carte bancaire (requis uniquement si paymentMethod === 'card')
            cardDetails: this.fb.group({
                cardNumber: ['4242 4242 4242 4242'],
                expiryDate: ['12/26'],
                cvv: ['123']
            }),

            // Champ factice pour Mobile Money
            mobileMoneyNumber: ['034 00 000 00']
        });

        // Mettre à jour dynamiquement la validation selon la méthode de paiement choisie
        this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
            const cardDetails = this.checkoutForm.get('cardDetails');
            const mobileMoneyNumber = this.checkoutForm.get('mobileMoneyNumber');

            if (method === 'card') {
                cardDetails?.get('cardNumber')?.setValidators([Validators.required]);
                cardDetails?.get('expiryDate')?.setValidators([Validators.required]);
                cardDetails?.get('cvv')?.setValidators([Validators.required, Validators.minLength(3)]);
                mobileMoneyNumber?.clearValidators();
            } else {
                cardDetails?.get('cardNumber')?.clearValidators();
                cardDetails?.get('expiryDate')?.clearValidators();
                cardDetails?.get('cvv')?.clearValidators();
                mobileMoneyNumber?.setValidators([Validators.required]);
            }

            cardDetails?.get('cardNumber')?.updateValueAndValidity();
            cardDetails?.get('expiryDate')?.updateValueAndValidity();
            cardDetails?.get('cvv')?.updateValueAndValidity();
            mobileMoneyNumber?.updateValueAndValidity();
        });

        // Forcer la validation initiale
        this.checkoutForm.get('paymentMethod')?.setValue('card');
    }

    // Getters pour faciliter l'accès dans le template HTML
    get contactForm() { return this.checkoutForm.get('contact') as FormGroup; }
    get shippingForm() { return this.checkoutForm.get('shipping') as FormGroup; }
    get cardForm() { return this.checkoutForm.get('cardDetails') as FormGroup; }
    get paymentMethod() { return this.checkoutForm.get('paymentMethod')?.value; }

    // Vérification si un champ a été touché et est invalide (pour afficher les bordures rouges)
    isFieldInvalid(formGroup: FormGroup, field: string): boolean {
        const control = formGroup.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit(): void {
        if (this.checkoutForm.invalid) {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            this.checkoutForm.markAllAsTouched();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        this.isProcessing = true;

        // Préparation du payload pour le backend
        const orderPayload: OrderPayload = {
            items: this.cartItems().map(item => ({
                product: item.productId,
                variantSku: item.variantSku || undefined,
                quantity: item.quantity,
                priceAtMoment: item.price
            })),
            totalAmount: this.cartTotal(),
            customerInfo: this.checkoutForm.value.contact,
            shippingInfo: this.checkoutForm.value.shipping,
            paymentMethod: this.checkoutForm.value.paymentMethod
        };

        // Appel API de création de commande
        this.orderService.createOrder(orderPayload).subscribe({
            next: (response) => {
                this.isProcessing = false;
                console.log('Commande soumise avec succès au Backend !', response);
                this.cartService.clearCart();
                alert('Paiement réussi ! La commande a été enregistrée en base de données. Redirection vers l\'accueil.');
                this.router.navigate(['/store']);
            },
            error: (err) => {
                this.isProcessing = false;
                console.error('Erreur lors de la création de la commande:', err);
                alert('Une erreur est survenue lors de la communication avec le serveur (Vérifiez la console).');
            }
        });
    }
}
