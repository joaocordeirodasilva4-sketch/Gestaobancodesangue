import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Solicitacao, SolicitacaoCreate, SolicitacaoUpdate, PaginatedResponse, StatusSolicitacao, TipoSanguineo, Urgencia } from '../models';

export interface SolicitacaoFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: StatusSolicitacao;
  urgencia?: Urgencia;
  tipo_sanguineo?: TipoSanguineo;
}

@Injectable({ providedIn: 'root' })
export class SolicitacoesService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/solicitacoes`;

  getAll(filters: SolicitacaoFilter = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<Solicitacao>>(this.API, { params });
  }

  getById(id: number) {
    return this.http.get<Solicitacao>(`${this.API}/${id}`);
  }

  create(body: SolicitacaoCreate) {
    return this.http.post<Solicitacao>(this.API, body);
  }

  update(id: number, body: SolicitacaoUpdate) {
    return this.http.put<Solicitacao>(`${this.API}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  updateStatus(id: number, status: StatusSolicitacao) {
    return this.http.patch<Solicitacao>(`${this.API}/${id}/status`, { status });
  }
}
