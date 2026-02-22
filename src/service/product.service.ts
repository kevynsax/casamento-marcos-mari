import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ProductDto } from '../type/Product.DTO';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/produto`;
  private _products = new BehaviorSubject<ProductDto[]>([]);
  public products$ = this._products.asObservable();

  constructor(private http: HttpClient) {
    this.loadProducts();
    this.startAutoRefresh();
  }

  private loadProducts(): void {
    this.http.get<ProductDto[]>(this.apiUrl).subscribe({
      next: (products) => {
        // Add animation duration to products
        const productsWithAnimation = products.map((product, index) => ({
          ...product,
          animationDuration: `${1000 + (index % 4) * 200}ms`
        }));
        this._products.next(productsWithAnimation);
      },
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  private startAutoRefresh(): void {
    // Refresh every 30 seconds
    interval(30000)
      .pipe(switchMap(() => this.http.get<ProductDto[]>(this.apiUrl)))
      .subscribe({
        next: (products) => {
          const productsWithAnimation = products.map((product, index) => ({
            ...product,
            animationDuration: `${1000 + (index % 4) * 200}ms`
          }));
          this._products.next(productsWithAnimation);
        },
        error: (err) => console.error('Erro ao atualizar produtos:', err)
      });
  }

  public refreshProducts(): void {
    this.loadProducts();
  }
}

