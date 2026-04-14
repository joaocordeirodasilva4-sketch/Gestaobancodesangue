import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Doacao, DoacaoCreate, DoacaoUpdate, PaginatedResponse, StatusDoacao, TipoSanguineo } from '../models';

export interface DoacaoFilter {
  page?: number;
  limit?: number;
  doador_id?: number;
  tipo_sanguineo?: TipoSanguineo;
  status?: StatusDoacao;
  data_inicio?: string;
  data_fim?: string;
}

@Injectable({ providedIn: 'root' })
export class DoacoesService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/doacoes`;

  getAll(filters: DoacaoFilter = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<Doacao>>(this.API, { params });
  }

  getById(id: number) {
    return this.http.get<Doacao>(`${this.API}/${id}`);
  }

  create(body: DoacaoCreate) {
    return this.http.post<Doacao>(this.API, body);
  }

  update(id: number, body: DoacaoUpdate) {
    return this.http.put<Doacao>(`${this.API}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  updateStatus(id: number, status: StatusDoacao) {
    return this.http.patch<Doacao>(`${this.API}/${id}/status`, { status });
  }
}
