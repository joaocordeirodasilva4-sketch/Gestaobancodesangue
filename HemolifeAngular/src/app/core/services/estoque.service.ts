import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Estoque, EstoqueResumo, EstoqueUpdate, PedidoUrgente, TipoSanguineo } from '../models';

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/estoque`;

  getAll() {
    return this.http.get<EstoqueResumo>(this.API);
  }

  getResumo() {
    return this.http.get<EstoqueResumo>(`${this.API}/resumo`);
  }

  getCriticos() {
    return this.http.get<Estoque[]>(`${this.API}/criticos`);
  }

  getByTipo(tipo: TipoSanguineo) {
    return this.http.get<Estoque>(`${this.API}/${tipo}`);
  }

  update(tipo: TipoSanguineo, body: EstoqueUpdate) {
    return this.http.put<Estoque>(`${this.API}/${tipo}`, body);
  }

  gerarPedidoUrgente(body: PedidoUrgente) {
    return this.http.post<any>(`${this.API}/pedido-urgente`, body);
  }

  getMovimentacoes() {
    return this.http.get<any[]>(`${this.API}/movimentacoes`);
  }
}
