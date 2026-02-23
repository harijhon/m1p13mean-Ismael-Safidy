import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProductService } from '@/core/services/product.service';
import { Product } from '@/models/product.model';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
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
    InputIconModule,
    ToggleSwitchModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  selectedProducts: Product[] = [];
  submitted = false;
  productDialog = false;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.productForm = this.createProductForm();
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      price: [0, Validators.min(0)],
      costPrice: [0, Validators.min(0)],
      currentStock: [0, Validators.min(0)],
      type: ['PRODUCT', Validators.required],
      isActive: [true],
      hasVariants: [false],
      variants: this.fb.array([])
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  addVariant() {
    const variantGroup = this.fb.group({
      sku: ['', Validators.required],
      couleur: [''],
      taille: [''],
      price: [0, Validators.min(0)],
      stock: [0, Validators.min(0)],
      image: ['']
    });
    this.variants.push(variantGroup);
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  onUpload(event: any) {
    // Pour l'instant, on va juste simuler l'URL de l'image téléchargée
    // Dans une implémentation réelle, vous devriez envoyer le fichier au serveur
    // et recevoir l'URL de l'image stockée

    // Pour la démo, on va juste créer une URL blob temporaire ou utiliser une URL simulée
    if (event.files && event.files.length > 0) {
      // Dans une implémentation réelle, vous enverriez le fichier au serveur
      // et récupéreriez l'URL de l'image stockée
      const uploadedFile = event.files[0];

      // Pour l'instant, on va juste stocker le nom du fichier ou une URL temporaire
      // dans une implémentation réelle, vous devriez envoyer le fichier au serveur
      // et stocker l'URL retournée
      const imagesControl = this.productForm.get('images');
      if (!imagesControl) {
        this.productForm.addControl('images', this.fb.control(['']));
      }
      const images = this.productForm.get('images')?.value || [''];
      // Pour l'instant, on va juste simuler une URL
      images[0] = URL.createObjectURL(uploadedFile);
      this.productForm.patchValue({ images });
    }
  }

  onVariantImageUpload(event: any, index: number) {
    if (event.files && event.files.length > 0) {
      const uploadedFile = event.files[0];
      const imageUrl = URL.createObjectURL(uploadedFile);

      const variantArray = this.productForm.get('variants') as FormArray;
      const variantGroup = variantArray.at(index) as FormGroup;
      variantGroup.patchValue({ image: imageUrl });
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 3000 });
        this.isLoading = false;
      }
    });
  }

  openNew(): void {
    this.productForm.reset();
    this.productForm.patchValue({
      name: '',
      price: 0,
      costPrice: 0,
      currentStock: 0,
      type: 'PRODUCT',
      isActive: true,
      hasVariants: false
    });
    // Réinitialiser le tableau des variantes
    this.variants.clear();
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts(): void {
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      const numSelected = this.selectedProducts.length;
      this.confirmationService.confirm({
        message: `Êtes-vous sûr de vouloir supprimer ${numSelected} produit(s) ?`,
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
    const deletePromises = this.selectedProducts.map(product => {
      if (product._id) {
        return this.productService.deleteProduct(product._id).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(deletePromises).then(() => {
      this.loadProducts();
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: `${this.selectedProducts.length} products deleted`,
        life: 3000
      });
      this.selectedProducts = []; // Clear selection
    }).catch(error => {
      console.error('Error deleting products:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete some products',
        life: 3000
      });
    });
  }

  editProduct(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      costPrice: product.costPrice,
      currentStock: product.currentStock,
      type: product.type,
      isActive: product.isActive,
      hasVariants: product.hasVariants
    });

    // Réinitialiser le tableau des variantes
    this.variants.clear();

    // Ajouter les variantes existantes
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        const variantGroup = this.fb.group({
          sku: [variant.sku, Validators.required],
          couleur: [variant.attributes ? (variant.attributes as any)['Couleur'] || '' : ''],
          taille: [variant.attributes ? (variant.attributes as any)['Taille'] || '' : ''],
          price: [variant.price, Validators.min(0)],
          stock: [variant.stock, Validators.min(0)],
          image: [variant.image || '']
        });
        this.variants.push(variantGroup);
      });
    }

    this.productDialog = true;
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (product._id) {
          this.productService.deleteProduct(product._id).subscribe({
            next: () => {
              this.loadProducts();
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
            },
            error: (error: any) => {
              console.error('Error deleting product:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product', life: 3000 });
            }
          });
        }
      },
      reject: () => {
        // User cancelled the deletion
      }
    });
  }

  hideDialog(): void {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct(): void {
    this.submitted = true;

    if (this.productForm.valid) {
      // Convertir le formulaire en objet Product
      const formData = this.productForm.value;
      const productToSave: Product = {
        name: formData.name,
        price: formData.price,
        costPrice: formData.costPrice,
        currentStock: formData.currentStock,
        type: formData.type,
        isActive: formData.isActive,
        hasVariants: formData.hasVariants,
        variants: formData.hasVariants ? formData.variants.map((variant: any) => ({
          sku: variant.sku,
          attributes: new Map([['Couleur', variant.couleur], ['Taille', variant.taille]]),
          price: variant.price,
          stock: variant.stock,
          image: variant.image
        })) : [],
        images: formData.images || ['']
      };

      // Si c'est une mise à jour, ajouter l'id
      if (this.productForm.get('_id')?.value) {
        (productToSave as any)._id = this.productForm.get('_id')?.value;
      }

      this.productService.saveProduct(productToSave).subscribe({
        next: (response: Product) => {
          this.loadProducts();
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Saved', life: 3000 });
          this.productDialog = false;
          this.productForm.reset();
          this.productForm.patchValue({
            name: '',
            price: 0,
            costPrice: 0,
            currentStock: 0,
            type: 'PRODUCT',
            isActive: true,
            hasVariants: false
          });
          this.variants.clear();
        },
        error: (error: any) => {
          console.error('Error saving product:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save product', life: 3000 });
        }
      });
    }
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getStockSeverity(stock: number): string {
    if (stock === 0) {
      return 'danger';
    } else if (stock < 10) {
      return 'warning';
    } else {
      return 'success';
    }
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }
}