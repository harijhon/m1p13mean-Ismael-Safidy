import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = '/api/products';

  constructor(private http: HttpClient) { }

  getProducts(global: boolean = false): Observable<Product[]> {
    let headers = new HttpHeaders();
    if (global) {
      headers = headers.set('X-Skip-Store-Interceptor', 'true');
    }
    return this.http.get<Product[]>(this.apiUrl, { headers });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  saveProduct(product: Product): Observable<Product> {
    if (product._id) {
      // Update existing product
      return this.http.put<Product>(`${this.apiUrl}/${product._id}`, product);
    } else {
      // Create new product
      return this.http.post<Product>(this.apiUrl, product);
    }
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}