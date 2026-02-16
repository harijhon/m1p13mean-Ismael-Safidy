import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-800 text-white py-8">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">ShopEasy</h3>
            <p class="text-gray-400">Votre boutique en ligne pour tous vos besoins.</p>
          </div>
          
          <div>
            <h4 class="text-md font-semibold mb-4">Liens Rapides</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Produits</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-md font-semibold mb-4">Catégories</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Vêtements</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Accessoires</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Électronique</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Maison</a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-md font-semibold mb-4">Contact</h4>
            <address class="text-gray-400 not-italic">
              <p>123 Rue Commerciale</p>
              <p>Ville, Pays 12345</p>
              <p class="mt-2">contact@shopeasy.com</p>
              <p>+1 (555) 123-4567</p>
            </address>
          </div>
        </div>
        
        <div class="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2026 ShopEasy. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FooterComponent {}