import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitacoesService } from '../../core/services/solicitacoes.service';
import { ToastService } from '../../core/services/toast.service';
import { Solicitacao, SolicitacaoCreate, TipoSanguineo, StatusSolicitacao, Urgencia } from '../../core/models';

const TIPOS: TipoSanguineo[] = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

@Component({
  selector: 'app-solicitacoes',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header"><div><h1>Solicitações</h1><p>{{ total() }} solicitações registradas</p></div><button class="btn-primary" (click)="openModal()">+ Nova Solicitação</button></div>
      <div class="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input [(ngModel)]="search" placeholder="Buscar por paciente, hospital ou tipo sanguíneo..." (input)="onSearch()" />
      </div>
      <div class="table-wrap">
        @if (loading()) { <div class="table-loading">@for(i of [1,2,3]; track i){<div class="skel"></div>}</div>
        } @else {
          <table>
            <thead><tr><th>Paciente</th><th>Hospital</th><th>Tipo</th><th>Unidades</th><th>Urgência</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              @for (s of solicitacoes(); track s.id) {
                <tr>
                  <td><p class="nome">{{ s.nome_paciente }}</p>@if(s.medico_responsavel){<p class="sub">{{ s.medico_responsavel }}</p>}</td>
                  <td>{{ s.hospital }}</td>
                  <td><span class="badge-tipo" [class]="tipoCss(s.tipo_sanguineo)">{{ s.tipo_sanguineo }}</span></td>
                  <td>{{ s.unidades }}</td>
                  <td><span class="badge-urg" [class]="'urg-'+s.urgencia">{{ uLabel(s.urgencia) }}</span></td>
                  <td><span class="badge-status" [class]="'st-'+s.status">{{ sLabel(s.status) }}</span></td>
                  <td class="actions">
                    <button class="icon-btn" (click)="openModal(s)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="icon-btn danger" (click)="delete(s.id)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                  </td>
                </tr>
              } @empty { <tr><td colspan="7" class="empty">Nenhuma solicitação encontrada.</td></tr> }
            </tbody>
          </table>
        }
      </div>
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>{{ editId() ? 'Editar Solicitação' : 'Nova Solicitação' }}</h2><button class="close" (click)="closeModal()">✕</button></div>
          <div class="form-group"><label>Nome do Paciente *</label><input [(ngModel)]="form.nome_paciente"/></div>
          <div class="form-row">
            <div class="form-group"><label>Hospital *</label><input [(ngModel)]="form.hospital"/></div>
            <div class="form-group"><label>Tipo Sanguíneo *</label>
              <select [(ngModel)]="form.tipo_sanguineo"><option value="">Selecione</option>@for(t of tipos;track t){<option [value]="t">{{t}}</option>}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Unidades *</label><input type="number" [(ngModel)]="form.unidades" min="1"/></div>
            <div class="form-group"><label>Urgência *</label>
              <select [(ngModel)]="form.urgencia"><option value="normal">Normal</option><option value="urgente">Urgente</option><option value="emergencia">Emergência</option></select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Data da Solicitação</label><input type="date" [(ngModel)]="form.data_solicitacao"/></div>
            <div class="form-group"><label>Médico Responsável</label><input [(ngModel)]="form.medico_responsavel"/></div>
          </div>
          <div class="form-group"><label>Observações</label><textarea [(ngModel)]="form.observacoes"></textarea></div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : (editId() ? 'Salvar' : 'Criar Solicitação') }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page{padding:24px}.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.page-header h1{font-size:22px;font-weight:700;color:#111}.page-header p{font-size:13px;color:#6b7280;margin-top:2px}
    .search-bar{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:16px}.search-bar input{border:none;outline:none;font-size:14px;width:100%;background:transparent}
    .table-wrap{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px}.table-loading{padding:16px;display:flex;flex-direction:column;gap:10px}.skel{height:52px;background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200%;animation:shimmer 1.4s infinite;border-radius:6px}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    table{width:100%;border-collapse:collapse}thead tr{background:#f9fafb}th{text-align:left;font-size:12px;font-weight:600;color:#6b7280;padding:12px 16px;border-bottom:1px solid #e5e7eb;text-transform:uppercase;letter-spacing:.03em}td{padding:14px 16px;font-size:13px;color:#111;border-bottom:1px solid #f3f4f6;vertical-align:middle}tr:last-child td{border-bottom:none}.nome{font-weight:600}.sub{font-size:11px;color:#9ca3af;margin-top:2px}.empty{text-align:center;color:#9ca3af;padding:40px!important}
    .badge-tipo{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:22px;border-radius:6px;font-size:11px;font-weight:700;color:#fff;padding:0 6px}.tipo-pos{background:#16a34a}.tipo-neg{background:#c0392b}.tipo-ab{background:#7c3aed}
    .badge-urg,.badge-status{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}.urg-normal{background:#f3f4f6;color:#6b7280}.urg-urgente{background:#fef3c7;color:#d97706}.urg-emergencia{background:#fde8e8;color:#c0392b}
    .st-pendente{background:#fef3c7;color:#d97706}.st-aprovada{background:#dcfce7;color:#16a34a}.st-rejeitada{background:#fde8e8;color:#c0392b}.st-entregue{background:#dbeafe;color:#1d4ed8}
    .actions{display:flex;gap:6px}.icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280}.icon-btn:hover{background:#f3f4f6}.icon-btn.danger:hover{background:#fef2f2;color:#c0392b;border-color:#fca5a5}
    .btn-primary{background:#c0392b;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer}.btn-primary:disabled{opacity:.65;cursor:not-allowed}.btn-cancel{background:#fff;color:#374151;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 20px;font-size:14px;cursor:pointer}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}.modal{background:#fff;border-radius:12px;width:520px;max-height:90vh;overflow-y:auto;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.2)}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.modal-header h2{font-size:18px;font-weight:700;color:#111}.close{background:none;border:none;font-size:18px;color:#6b7280;cursor:pointer}.modal-footer{display:flex;gap:10px;margin-top:20px}.modal-footer .btn-cancel{flex:1}.modal-footer .btn-primary{flex:2}
    .form-group{margin-bottom:14px}.form-row{display:flex;gap:14px;margin-bottom:14px}.form-row .form-group{flex:1;margin-bottom:0}label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px}input,select,textarea{width:100%;border:1.5px solid #e5e7eb;border-radius:7px;padding:9px 12px;font-size:14px;color:#111;outline:none;font-family:inherit;box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:#c0392b}select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}textarea{resize:vertical;min-height:80px}
  `]
})
export class SolicitacoesComponent implements OnInit {
  private svc   = inject(SolicitacoesService);
  private toast = inject(ToastService);
  solicitacoes = signal<Solicitacao[]>([]); total = signal(0); page = signal(1); pages = signal(1);
  loading = signal(true); saving = signal(false); showModal = signal(false); editId = signal<number|null>(null);
  search = ''; tipos = TIPOS;
  private searchTimer: any;
  form: any = this.emptyForm();
  emptyForm() { return { nome_paciente:'', hospital:'', tipo_sanguineo:'' as any, unidades:1, urgencia:'normal' as Urgencia, data_solicitacao: new Date().toISOString().split('T')[0], medico_responsavel:'', observacoes:'' }; }
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.svc.getAll({ page: this.page(), limit: 20, search: this.search || undefined }).subscribe({
      next: r => { this.solicitacoes.set(r.data); this.total.set(r.total); this.pages.set(r.pages); this.loading.set(false); },
      error: () => { this.toast.error('Erro ao carregar solicitações.'); this.loading.set(false); }
    });
  }
  onSearch() { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400); }
  goPage(p: number) { this.page.set(p); this.load(); }
  pageRange() { return Array.from({ length: this.pages() }, (_, i) => i + 1); }
  openModal(s?: Solicitacao) { this.editId.set(s?.id ?? null); this.form = s ? { ...s } : this.emptyForm(); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }
  save() {
    if (!this.form.nome_paciente || !this.form.hospital || !this.form.tipo_sanguineo) { this.toast.error('Preencha os campos obrigatórios.'); return; }
    this.saving.set(true);
    const obs = this.editId() ? this.svc.update(this.editId()!, this.form) : this.svc.create(this.form);
    obs.subscribe({ next: () => { this.toast.success(this.editId() ? 'Solicitação atualizada!' : 'Solicitação criada!'); this.saving.set(false); this.closeModal(); this.load(); }, error: () => this.saving.set(false) });
  }
  delete(id: number) {
    if (!confirm('Excluir esta solicitação?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Solicitação excluída.'); this.load(); } });
  }
  tipoCss(t: TipoSanguineo) { return t.startsWith('AB') ? 'badge-tipo tipo-ab' : t.includes('+') ? 'badge-tipo tipo-pos' : 'badge-tipo tipo-neg'; }
  uLabel(u: string) { return { normal:'Normal', urgente:'Urgente', emergencia:'Emergência' }[u] ?? u; }
  sLabel(s: string) { return { pendente:'Pendente', aprovada:'Aprovada', rejeitada:'Rejeitada', entregue:'Entregue' }[s] ?? s; }
}
