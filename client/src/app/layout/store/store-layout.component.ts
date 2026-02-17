import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreHeaderComponent } from './header/store-header.component';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [RouterOutlet, StoreHeaderComponent],
  template: `
    <app-store-header />
    <main class="pt-16 pb-4">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StoreLayoutComponent {}