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
    <main class="">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StoreLayoutComponent { }