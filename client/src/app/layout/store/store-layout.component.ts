import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreHeaderComponent } from './header/store-header.component';
import { CartToastComponent } from '../../shared/components/cart-toast/cart-toast.component';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [RouterOutlet, StoreHeaderComponent, CartToastComponent],
  template: `
    <app-store-header />
    <app-cart-toast />
    <div class="min-h-screen flex flex-col">
      <main class="flex-grow">
        <router-outlet />
      </main>
      
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <p class="text-sm text-neutral-500 font-medium text-center">
            Designed & Developed by
          </p>
          <p class="mt-2 text-base font-bold text-neutral-900 text-center tracking-wide">
            Zo Ismael HARIJHON <span class="text-neutral-300 mx-2">|</span> Safidinomenjanahary HERIMAMPIANINA
          </p>
          <div class="mt-4 flex gap-2 justify-center">
             <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
             <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
             <span class="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StoreLayoutComponent { }