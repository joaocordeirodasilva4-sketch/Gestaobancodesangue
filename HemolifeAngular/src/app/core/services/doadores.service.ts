import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Doador, DoadorCreate, DoadorUpdate, PaginatedResponse, StatusDoador, TipoSanguineo } from '../models';

export interface DoadorFilter {
  page?: number;
  limit?: number;
  search?: string;
  tipo_sanguineo?: TipoSanguineo;
  status?: StatusDoador;
}

@Injectable({ providedIn: 'root' })
export class DoadoresService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/doadores`;

  getAll(filters: DoadorFilter = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<Doador>>(this.API, { params });
  }

  getById(id: number) {
    return this.http.get<Doador>(`${this.API}/${id}`);
  }

  create(body: DoadorCreate) {
    return this.http.post<Doador>(this.API, body);
  }

  update(id: number, body: DoadorUpdate) {
    return this.http.put<Doador>(`${this.API}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  updateStatus(id: number, status: StatusDoador) {
    return this.http.patch<Doador>(`${this.API}/${id}/status`, { status });
  }

  getDoacoes(id: number) {
    return this.http.get<any[]>(`${this.API}/${id}/doacoes`);
  }
}
