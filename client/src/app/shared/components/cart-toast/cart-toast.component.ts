import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartToastService } from '../../../core/services/cart-toast.service';

@Component({
    selector: 'app-cart-toast',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart-toast.component.html'
})
export class CartToastComponent {
    public toastService = inject(CartToastService);
}
