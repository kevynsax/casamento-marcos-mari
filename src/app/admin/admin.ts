import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompraService } from '../../service/compra.service';
import { Compra } from '../../type/NovaIntencaoCompra.DTO';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  protected compras = signal<Compra[]>([]);
  protected loading = signal(true);
  protected loadingCompras = signal(true);
  protected copiedId = signal<number | null>(null);

  constructor(
    private compraService: CompraService,
  ) {}

  ngOnInit(): void {
    this.loadCompras();
  }

  private loadCompras(): void {
    this.compraService.listarCompras().subscribe({
      next: (compras) => {
        this.compras.set(compras);
        this.loadingCompras.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar compras:', err);
        this.loadingCompras.set(false);
      }
    });
  }

  protected getInviteUrl(conviteId: number): string {
    return `${window.location.origin}/convite/${conviteId}`;
  }

  protected copyUrl(conviteId: number): void {
    const url = this.getInviteUrl(conviteId);
    navigator.clipboard.writeText(url).then(() => {
      this.copiedId.set(conviteId);
      setTimeout(() => {
        this.copiedId.set(null);
      }, 2000);
    });
  }

  protected getPurchaseStats() {
    const compras = this.compras();
    const total = compras.length;
    const totalValue = compras.reduce((sum, c) => sum + c.total, 0);
    const finalized = compras.filter(c => c.statusPagamento === 'FINALIZADO').length;
    const pending = compras.filter(c => c.statusPagamento === 'PENDENTE').length;
    const pix = compras.filter(c => c.tipoPagamento === 'PIX').length;
    const cartao = compras.filter(c => c.tipoPagamento === 'CARTAO').length;

    return {
      total,
      totalValue,
      finalized,
      pending,
      pix,
      cartao
    };
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
