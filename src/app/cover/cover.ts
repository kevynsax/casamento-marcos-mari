import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DATA_CASAMENTO } from '../../service/constants';
import { interval, Subscription } from 'rxjs';
import { ScrollAnimationDirective } from '../utils/scroll-animation.directive';

@Component({
    selector: 'app-cover',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage, ScrollAnimationDirective],
    templateUrl: './cover.html',
    styleUrl: './cover.scss'
})
export class Cover implements OnInit, OnDestroy {
    protected readonly dataCasamento = DATA_CASAMENTO;
    protected dias = signal(0);
    protected horas = signal(0);
    protected minutos = signal(0);
    protected segundos = signal(0);
    private subscription?: Subscription;

    constructor() {
    }

    protected formatarData(data: Date): string {
        return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    ngOnInit(): void {
        this.atualizarContador();
        this.subscription = interval(1000).subscribe(() => {
            this.atualizarContador();
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private atualizarContador(): void {
        const agora = new Date().getTime();
        const dataAlvo = this.dataCasamento.getTime();
        const diferenca = dataAlvo - agora;

        if (diferenca > 0) {
            this.dias.set(Math.floor(diferenca / (1000 * 60 * 60 * 24)));
            this.horas.set(Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            this.minutos.set(Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)));
            this.segundos.set(Math.floor((diferenca % (1000 * 60)) / 1000));
        } else {
            this.dias.set(0);
            this.horas.set(0);
            this.minutos.set(0);
            this.segundos.set(0);
        }
    }
}
