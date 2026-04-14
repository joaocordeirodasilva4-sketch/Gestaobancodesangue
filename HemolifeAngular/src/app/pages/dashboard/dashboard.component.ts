import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { EstoqueService } from '../../core/services/estoque.service';
import { DashboardResumo, Estoque } from '../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">

      @if (alertas().length > 0) {
        <div class="alert-banner">
          <div class="alert-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <strong>Estoque Crítico Detectado</strong>
            <span>{{ alertas().length }} tipo(s) abaixo do mínimo: {{ tiposCriticos() }}</span>
          </div>
          <button class="btn-urgente" routerLink="/estoque">Gerar Pedido Urgente</button>
        </div>
      }

      <div class="page-header">
        <div>
          <h1>Painel de Controle</h1>
          <p>Visão geral do banco de sangue</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="card skeleton"></div>
          }
        </div>
      } @else {
        <div class="cards">
          <div class="card">
            <div class="card-content">
              <div>
                <p class="card-label">Doadores Ativos</p>
                <p class="card-value">{{ resumo()?.doadores_ativos ?? 0 }}</p>
                <p class="card-sub">{{ resumo()?.total_doadores ?? 0 }} total cadastrados</p>
              </div>
              <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <div>
                <p class="card-label">Unidades em Estoque</p>
                <p class="card-value">{{ resumo()?.unidades_estoque ?? 0 }}</p>
                <p class="card-sub">Todas as bolsas</p>
              </div>
              <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" width="20" height="20"><path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z"/></svg></div>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <div>
                <p class="card-label">Solicitações Pendentes</p>
                <p class="card-value">{{ resumo()?.solicitacoes_pendentes ?? 0 }}</p>
                <p class="card-sub">{{ resumo()?.total_solicitacoes ?? 0 }} total</p>
              </div>
              <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <div>
                <p class="card-label">Doações Registradas</p>
                <p class="card-value">{{ resumo()?.doacoes_registradas ?? 0 }}</p>
                <p class="card-sub">Todas as doações</p>
              </div>
              <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
            </div>
          </div>
        </div>
      }

      <div class="section-header">
        <h2>Estoque por Tipo Sanguíneo</h2>
        <a class="link-ver" routerLink="/estoque">Ver detalhes</a>
      </div>

      @if (loading()) {
        <div class="estoque-grid">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="estoque-card skeleton" style="height:110px"></div>
          }
        </div>
      } @else {
        <div class="estoque-grid">
          @for (item of estoqueItems(); track item.tipo_sanguineo) {
            <div class="estoque-card" [class]="'status-' + item.status">
              <div class="estoque-top">
                <div class="blood-icon" [class]="'icon-' + item.status">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z" [attr.fill]="iconColor(item.status)"/>
                  </svg>
                </div>
                <div>
                  <p class="tipo">{{ item.tipo_sanguineo }}</p>
                  <p class="sl" [class]="'sl-' + item.status">{{ statusLabel(item.status) }}</p>
                </div>
                <p class="unidades">{{ item.unidades_disponiveis }}</p>
              </div>
              <div class="prog-row">
                <span>Estoque</span><span>Min: {{ item.estoque_minimo }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [class]="'fill-' + item.status" [style.width.%]="getPercent(item)"></div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1200px; }

    .alert-banner { display: flex; align-items: center; justify-content: space-between; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; gap: 12px; }
    .alert-left { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #b91c1c; flex-wrap: wrap; }
    .alert-left strong { font-weight: 700; }
    .btn-urgente { background: #c0392b; color: #fff; border: none; border-radius: 7px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; text-decoration: none; }

    .page-header { margin-bottom: 20px; }
    .page-header h1 { font-size: 22px; font-weight: 700; color: #111; }
    .page-header p  { font-size: 13px; color: #6b7280; margin-top: 2px; }

    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .loading-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
    .card-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .card-label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
    .card-value { font-size: 28px; font-weight: 700; color: #111; }
    .card-sub   { font-size: 11px; color: #9ca3af; margin-top: 4px; }
    .card-icon  { width: 38px; height: 38px; border-radius: 50%; background: #fde8e8; display: flex; align-items: center; justify-content: center; }

    .skeleton { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200%; animation: shimmer 1.4s infinite; border-radius: 10px; min-height: 100px; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-header h2 { font-size: 16px; font-weight: 700; color: #111; }
    .link-ver { font-size: 13px; color: #c0392b; text-decoration: none; font-weight: 500; }

    .estoque-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .estoque-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
    .estoque-card.status-baixo   { background: #fffbeb; border: 1px solid #fde68a; }
    .estoque-card.status-critico { background: #fff5f5; border: 1px solid #fca5a5; }
    .estoque-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .blood-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon-normal  { background: #fde8e8; }
    .icon-baixo   { background: #fef3c7; }
    .icon-critico { background: #fde8e8; }
    .tipo   { font-size: 14px; font-weight: 700; color: #111; }
    .sl     { font-size: 11px; font-weight: 500; }
    .sl-normal  { color: #16a34a; }
    .sl-baixo   { color: #d97706; }
    .sl-critico { color: #dc2626; }
    .unidades { font-size: 24px; font-weight: 700; color: #111; margin-left: auto; }
    .prog-row { display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; margin-bottom: 5px; }
    .progress-bar { height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 2px; transition: width .4s; }
    .fill-normal  { background: #c0392b; }
    .fill-baixo   { background: #f59e0b; }
    .fill-critico { background: #ef4444; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashSvc    = inject(DashboardService);
  private estoqueSvc = inject(EstoqueService);

  resumo       = signal<DashboardResumo | null>(null);
  estoqueItems = signal<Estoque[]>([]);
  alertas      = signal<Estoque[]>([]);
  tiposCriticos = signal('');
  loading      = signal(true);

  ngOnInit() {
    forkJoin({
      resumo:  this.dashSvc.getResumo(),
      estoque: this.estoqueSvc.getAll(),
    }).subscribe({
      next: ({ resumo, estoque }) => {
        this.resumo.set(resumo);
        this.estoqueItems.set(estoque.tipos);
        const criticos = estoque.tipos.filter(e => e.status === 'critico' || e.status === 'baixo');
        this.alertas.set(criticos);
        this.tiposCriticos.set(criticos.map(e => e.tipo_sanguineo).join(', '));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(s: string) { return { normal: 'Normal', baixo: 'Baixo', critico: 'Crítico' }[s] ?? s; }
  iconColor(s: string)   { return { normal: '#c0392b', baixo: '#f59e0b', critico: '#ef4444' }[s] ?? '#c0392b'; }
  getPercent(e: Estoque) { return Math.min(100, Math.round((e.unidades_disponiveis / (e.estoque_minimo * 2)) * 100)); }
}
