import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardResumo, Estoque } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/dashboard`;

  getResumo() {
    return this.http.get<DashboardResumo>(`${this.API}/resumo`);
  }

  getEstoque() {
    return this.http.get<{ total_unidades: number; tipos: Estoque[] }>(`${this.API}/estoque`);
  }

  getAlertas() {
    return this.http.get<{ alertas: Estoque[] }>(`${this.API}/alertas`);
  }

  getAtividadeRecente() {
    return this.http.get<any>(`${this.API}/atividade-recente`);
  }
}
