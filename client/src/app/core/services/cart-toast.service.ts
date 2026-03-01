import { Injectable, signal } from '@angular/core';

export interface ToastData {
    isVisible: boolean;
    productName: string;
    productImage: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartToastService {
    toastState = signal<ToastData>({
        isVisible: false,
        productName: '',
        productImage: ''
    });

    private timeoutId: any;

    showToast(name: string, image: string) {
        // Clear any existing timeout to restart the 3s counter if spam-clicked
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Show the toast with new data
        this.toastState.set({
            isVisible: true,
            productName: name,
            productImage: (image && image.trim() !== '') ? image : 'assets/images/placeholder.png' // Fallback image
        });

        // Hide after 3 seconds
        this.timeoutId = setTimeout(() => {
            this.hideToast();
        }, 3000);
    }

    hideToast() {
        this.toastState.update(state => ({ ...state, isVisible: false }));
    }
}
