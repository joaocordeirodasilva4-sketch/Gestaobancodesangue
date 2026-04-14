import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Paciente, PacienteCreate, PacienteUpdate, PaginatedResponse, TipoSanguineo } from '../models';

export interface PacienteFilter {
  page?: number;
  limit?: number;
  search?: string;
  tipo_sanguineo?: TipoSanguineo;
  status?: 'ativo' | 'inativo';
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/pacientes`;

  getAll(filters: PacienteFilter = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<Paciente>>(this.API, { params });
  }

  getById(id: number) {
    return this.http.get<Paciente>(`${this.API}/${id}`);
  }

  create(body: PacienteCreate) {
    return this.http.post<Paciente>(this.API, body);
  }

  update(id: number, body: PacienteUpdate) {
    return this.http.put<Paciente>(`${this.API}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  updateStatus(id: number, status: 'ativo' | 'inativo') {
    return this.http.patch<Paciente>(`${this.API}/${id}/status`, { status });
  }
}
