import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstoqueService } from '../../core/services/estoque.service';
import { ToastService } from '../../core/services/toast.service';
import { Estoque, TipoSanguineo } from '../../core/models';

@Component({
  selector: 'app-estoque',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header"><div><h1>Estoque de Sangue</h1><p>Gestão de estoque por tipo sanguíneo</p></div></div>

      <div class="total-card">
        <div class="total-icon"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z" fill="#c0392b"/></svg></div>
        <div><p class="total-label">Total de Unidades em Estoque</p><p class="total-value">{{ totalUnidades() }}</p></div>
      </div>

      @if (loading()) {
        <div class="estoque-grid">@for(i of [1,2,3,4,5,6,7,8]; track i){<div class="skel" style="height:120px"></div>}</div>
      } @else {
        <div class="estoque-grid">
          @for (item of estoqueItems(); track item.tipo_sanguineo) {
            <div class="estoque-card" [class]="'status-'+item.status">
              <div class="card-top">
                <div class="blood-icon" [class]="'icon-'+item.status">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z" [attr.fill]="iconColor(item.status)"/></svg>
                </div>
                <div><p class="tipo">{{ item.tipo_sanguineo }}</p><p class="sl" [class]="'sl-'+item.status">{{ statusLabel(item.status) }}</p></div>
                <p class="unidades">{{ item.unidades_disponiveis }}</p>
              </div>
              <div class="prog-row"><span>Estoque</span><span>Min: {{ item.estoque_minimo }}</span></div>
              <div class="progress-bar"><div class="fill" [class]="'fill-'+item.status" [style.width.%]="getPercent(item)"></div></div>
              <button class="btn-edit" (click)="openEdit(item)">✏ Editar</button>
            </div>
          }
        </div>
      }
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <div class="blood-icon icon-normal"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z" fill="#c0392b"/></svg></div>
              <div><p class="mt-tipo">Tipo {{ editItem()?.tipo_sanguineo }}</p><p class="mt-sub">Atualizar estoque</p></div>
            </div>
            <button class="close" (click)="closeModal()">✕</button>
          </div>
          <div class="form-group"><label>Unidades Disponíveis</label><input type="number" [(ngModel)]="editForm.unidades_disponiveis" /></div>
          <div class="form-group"><label>Estoque Mínimo</label><input type="number" [(ngModel)]="editForm.estoque_minimo" /></div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveEdit()" [disabled]="saving()">{{ saving() ? 'Salvando...' : '💾 Salvar' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page{padding:24px}.page-header{margin-bottom:20px}.page-header h1{font-size:22px;font-weight:700;color:#111}.page-header p{font-size:13px;color:#6b7280}
    .total-card{background:#fff;border-radius:10px;padding:20px 24px;display:flex;align-items:center;gap:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:24px}
    .total-icon{width:44px;height:44px;border-radius:50%;background:#fde8e8;display:flex;align-items:center;justify-content:center}.total-label{font-size:13px;color:#6b7280}.total-value{font-size:32px;font-weight:700;color:#111}
    .estoque-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
    .skel{background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200%;animation:shimmer 1.4s infinite;border-radius:10px}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .estoque-card{background:#fff;border-radius:10px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}.estoque-card.status-baixo{background:#fffbeb;border:1px solid #fde68a}.estoque-card.status-critico{background:#fff5f5;border:1px solid #fca5a5}
    .card-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}.blood-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}.icon-normal{background:#fde8e8}.icon-baixo{background:#fef3c7}.icon-critico{background:#fde8e8}
    .tipo{font-size:14px;font-weight:700;color:#111}.sl{font-size:11px;font-weight:500}.sl-normal{color:#16a34a}.sl-baixo{color:#d97706}.sl-critico{color:#dc2626}.unidades{font-size:24px;font-weight:700;color:#111;margin-left:auto}
    .prog-row{display:flex;justify-content:space-between;font-size:11px;color:#9ca3af;margin-bottom:5px}.progress-bar{height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden;margin-bottom:12px}.fill{height:100%;border-radius:2px}.fill-normal{background:#c0392b}.fill-baixo{background:#f59e0b}.fill-critico{background:#ef4444}
    .btn-edit{width:100%;padding:7px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;color:#6b7280;cursor:pointer}.btn-edit:hover{background:#f3f4f6}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}.modal{background:#fff;border-radius:12px;width:360px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.modal-title{display:flex;align-items:center;gap:12px}.mt-tipo{font-size:16px;font-weight:700;color:#111}.mt-sub{font-size:12px;color:#9ca3af}.close{background:none;border:none;font-size:18px;color:#6b7280;cursor:pointer}.modal-footer{display:flex;gap:10px;margin-top:20px}
    .form-group{margin-bottom:14px}label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px}input{width:100%;border:1.5px solid #e5e7eb;border-radius:7px;padding:9px 12px;font-size:14px;color:#111;outline:none;font-family:inherit;box-sizing:border-box}input:focus{border-color:#c0392b}
    .btn-primary{flex:1;background:#c0392b;color:#fff;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:600;cursor:pointer}.btn-primary:disabled{opacity:.65;cursor:not-allowed}.btn-cancel{flex:1;background:#fff;color:#374151;border:1.5px solid #e5e7eb;border-radius:8px;padding:11px;font-size:14px;cursor:pointer}
  `]
})
export class EstoqueComponent implements OnInit {
  private svc   = inject(EstoqueService);
  private toast = inject(ToastService);
  estoqueItems = signal<Estoque[]>([]); loading = signal(true); saving = signal(false);
  showModal = signal(false); editItem = signal<Estoque | null>(null);
  editForm = { unidades_disponiveis: 0, estoque_minimo: 0 };

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: r => { this.estoqueItems.set(r.tipos); this.loading.set(false); },
      error: () => { this.toast.error('Erro ao carregar estoque.'); this.loading.set(false); }
    });
  }
  totalUnidades() { return this.estoqueItems().reduce((s, e) => s + e.unidades_disponiveis, 0); }
  openEdit(item: Estoque) {
    this.editItem.set(item);
    this.editForm = { unidades_disponiveis: item.unidades_disponiveis, estoque_minimo: item.estoque_minimo };
    this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); }
  saveEdit() {
    this.saving.set(true);
    this.svc.update(this.editItem()!.tipo_sanguineo as TipoSanguineo, this.editForm).subscribe({
      next: () => { this.toast.success('Estoque atualizado!'); this.saving.set(false); this.closeModal(); this.load(); },
      error: () => this.saving.set(false)
    });
  }
  statusLabel(s: string) { return { normal:'Normal', baixo:'Baixo', critico:'Crítico' }[s] ?? s; }
  iconColor(s: string)   { return { normal:'#c0392b', baixo:'#f59e0b', critico:'#ef4444' }[s] ?? '#c0392b'; }
  getPercent(e: Estoque) { return Math.min(100, Math.round((e.unidades_disponiveis / (e.estoque_minimo * 2)) * 100)); }
}
