import { Component, EventEmitter, Input, Output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductDto } from '../../../type/Product.DTO';
import { CompraService } from '../../../service/compra.service';
import * as QRCode from 'qrcode';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type PaymentMethod = 'pix' | 'credit-card';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.scss'
})
export class PaymentModal implements OnDestroy {
  @Input() product: ProductDto | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<void>();

  protected currentStep = signal<'info' | 'payment'>('info');
  protected selectedPaymentMethod = signal<PaymentMethod>('pix');
  protected isProcessing = signal(false);
  protected showPaymentSuccess = signal(false);

  // Guest Info
  protected guestName = '';
  protected guestMessage = '';

  // Credit Card form
  protected cardNumber = '';
  protected cardName = '';
  protected cardExpiry = '';
  protected cardCvv = '';
  protected cardCpf = '';

  // Pix
  protected pixKey = signal('');
  protected pixCopied = signal(false);
  protected qrCodeDataUrl = signal<string>('');

  private intencaoCompraId: number | null = null;
  private pollingSubscription?: Subscription;

  constructor(private compraService: CompraService) {
  }

  protected selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

  protected proceedToPayment(): void {
    if (this.isGuestInfoValid() && this.product) {
      this.isProcessing.set(true);

      this.compraService.criarIntencaoCompra({
        nome: this.guestName,
        mensagem: this.guestMessage,
        idProduto: this.product.id
      }).subscribe({
        next: (response) => {
          this.intencaoCompraId = response.id;
          this.pixKey.set(response.qrCodePix);
          this.generateQRCode(response.qrCodePix);
          this.isProcessing.set(false);
          this.currentStep.set('payment');
          this.startPollingPaymentStatus();
        },
        error: (err: any) => {
          console.error('Erro ao criar intenção de compra:', err);
          this.isProcessing.set(false);
          // You might want to show an error message to the user
          alert('Erro ao processar sua solicitação. Por favor, tente novamente.');
        }
      });
    }
  }

  private startPollingPaymentStatus(): void {
    if (!this.intencaoCompraId) {
      return;
    }

    // Poll every 2 seconds
    this.pollingSubscription = interval(2000)
      .pipe(
        switchMap(() => this.compraService.verificarStatusCompra(this.intencaoCompraId!))
      )
      .subscribe({
        next: (compra) => {
          if(!compra)
            return;

          this.stopPolling();
          this.showPaymentSuccess.set(true);
          this.paymentSuccess.emit();
        },
        error: (err: any) => {
          console.error('Erro ao verificar status da compra:', err);
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  protected isGuestInfoValid(): boolean {
    return this.guestName.trim().length > 0 && this.guestMessage.trim().length > 0;
  }

  protected closeModal(): void {
    this.stopPolling();
    this.resetForm();
    this.close.emit();
  }

  protected copyPixKey(): void {
    navigator.clipboard.writeText(this.pixKey()).then(() => {
      this.pixCopied.set(true);
      setTimeout(() => this.pixCopied.set(false), 2000);
    });
  }

  private generateQRCode(pixKey: string): void {
    if (pixKey) {
      QRCode.toDataURL(pixKey, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then((url: string) => {
        this.qrCodeDataUrl.set(url);
      }).catch((err: any) => {
        console.error('Erro ao gerar QR Code:', err);
      });
    }
  }

  protected processPayment(): void {
    if (!this.intencaoCompraId) {
      alert('Erro: Intenção de compra não encontrada.');
      return;
    }

    if (!this.isFormValid()) {
      alert('Por favor, preencha todos os campos do cartão corretamente.');
      return;
    }

    this.isProcessing.set(true);

    const numeroCartao = this.cardNumber.replace(/\s/g, '');
    const cpfPagador = this.cardCpf.replace(/\D/g, '');

    this.compraService.pagarComCartao({
      idIntencaoCompra: this.intencaoCompraId,
      cpfPagador: cpfPagador,
      nomePagador: this.cardName,
      ccvCartao: this.cardCvv,
      numeroCartao: numeroCartao,
      dataExpiracaoCartao: this.cardExpiry
    }).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.stopPolling();
        this.showPaymentSuccess.set(true);
        this.paymentSuccess.emit();
      },
      error: (err: any) => {
        console.error('Erro ao processar pagamento:', err);
        this.isProcessing.set(false);
        alert('Erro ao processar pagamento. Por favor, verifique os dados do cartão e tente novamente.');
      }
    });
  }

  protected formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '');
    let formattedValue = '';

    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }

    this.cardNumber = formattedValue;
  }

  protected formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    this.cardExpiry = value;
  }

  protected formatCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Format: XXX.XXX.XXX-XX
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 9) {
      value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9);
    } else if (value.length > 6) {
      value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
    } else if (value.length > 3) {
      value = value.slice(0, 3) + '.' + value.slice(3);
    }

    this.cardCpf = value;
  }

  private resetForm(): void {
    this.currentStep.set('info');
    this.guestName = '';
    this.guestMessage = '';
    this.cardNumber = '';
    this.cardName = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.cardCpf = '';
    this.showPaymentSuccess.set(false);
    this.pixCopied.set(false);
    this.intencaoCompraId = null;
    this.pixKey.set('');
    this.qrCodeDataUrl.set('');
  }

  protected isFormValid(): boolean {
    if (this.selectedPaymentMethod() === 'credit-card') {
      return this.cardNumber.replace(/\s/g, '').length === 16 &&
        this.cardName.trim().length > 0 &&
        this.cardExpiry.length === 5 &&
        this.cardCvv.length === 3 &&
        this.cardCpf.replace(/\D/g, '').length === 11;
    }
    return true; // Pix doesn't require form validation
  }
}

