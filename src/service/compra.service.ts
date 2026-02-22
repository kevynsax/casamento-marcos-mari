import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NovaIntencaoCompraDTO, IntencaoCompraResponseDTO, Compra } from '../type/NovaIntencaoCompra.DTO';
import { PagamentoCartaoDTO } from '../type/PagamentoCartao.DTO';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiBaseUrl}/compra`;

  constructor(private http: HttpClient) {}

  criarIntencaoCompra(intencao: NovaIntencaoCompraDTO): Observable<IntencaoCompraResponseDTO> {
    return this.http.post<IntencaoCompraResponseDTO>(`${this.apiUrl}/intencao`, intencao);
  }

  verificarStatusCompra(intencaoId: number): Observable<Compra | undefined> {
    return this.http.get<Compra>(`${this.apiUrl}/intencao/${intencaoId}`);
  }

  pagarComCartao(pagamento: PagamentoCartaoDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/cartao`, pagamento);
  }

  listarCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.apiUrl);
  }
}
