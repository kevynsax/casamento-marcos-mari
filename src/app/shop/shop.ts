import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentModal } from './payment-modal/payment-modal';
import { ProductService } from '../../service/product.service';
import { Subscription } from 'rxjs';
import { ProductDto } from '../../type/Product.DTO';
import { ScrollAnimationDirective } from '../utils/scroll-animation.directive';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, PaymentModal, ScrollAnimationDirective],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class Shop implements OnInit, OnDestroy {
  protected selectedProduct = signal<ProductDto | null>(null);
  protected isModalOpen = signal(false);
  protected products = signal<ProductDto[]>([]);
  private productsSubscription?: Subscription;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => this.products.set(products),
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  }

  protected openPaymentModal(product: ProductDto): void {
    if (!product.disponivel) {
      return;
    }
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected closePaymentModal(): void {
    this.isModalOpen.set(false);
    document.body.style.overflow = '';
    setTimeout(() => {
      this.selectedProduct.set(null);
    }, 300);
  }

  protected onPaymentSuccess(): void {
    this.productService.refreshProducts();
  }

  protected formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
