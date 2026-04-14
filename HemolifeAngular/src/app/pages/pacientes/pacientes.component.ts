import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../../core/services/pacientes.service';
import { ToastService } from '../../core/services/toast.service';
import { Paciente, PacienteCreate, TipoSanguineo, Genero } from '../../core/models';

const TIPOS: TipoSanguineo[] = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

@Component({
  selector: 'app-pacientes',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header"><div><h1>Pacientes</h1><p>{{ total() }} pacientes cadastrados</p></div><button class="btn-primary" (click)="openModal()">+ Novo Paciente</button></div>
      <div class="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input [(ngModel)]="search" placeholder="Buscar por nome, CPF, tipo sanguíneo ou hospital..." (input)="onSearch()" />
      </div>
      <div class="table-wrap">
        @if (loading()) { <div class="table-loading">@for(i of [1,2,3]; track i){<div class="skel"></div>}</div>
        } @else {
          <table>
            <thead><tr><th>Paciente</th><th>Tipo</th><th>Hospital</th><th>Médico</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              @for (p of pacientes(); track p.id) {
                <tr>
                  <td><p class="nome">{{ p.nome_completo }}</p>@if(p.cpf){<p class="sub">{{ p.cpf }}</p>}</td>
                  <td><span class="badge-tipo" [class]="tipoCss(p.tipo_sanguineo)">{{ p.tipo_sanguineo }}</span></td>
                  <td>{{ p.hospital_unidade ?? '—' }}</td><td>{{ p.medico_responsavel ?? '—' }}</td>
                  <td><span class="badge-status" [class]="'st-'+p.status">{{ p.status === 'ativo' ? 'Ativo' : 'Inativo' }}</span></td>
                  <td class="actions">
                    <button class="icon-btn" (click)="openModal(p)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="icon-btn danger" (click)="delete(p.id, p.nome_completo)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6">
                  <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" width="40" height="40"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    <p>Nenhum paciente cadastrado ainda</p>
                  </div>
                </td></tr>
              }
            </tbody>
          </table>
        }
      </div>
      @if (pages() > 1) {
        <div class="pagination">
          <button [disabled]="page()===1" (click)="goPage(page()-1)">‹</button>
          @for(p of pageRange(); track p){ <button [class.active]="p===page()" (click)="goPage(p)">{{p}}</button> }
          <button [disabled]="page()===pages()" (click)="goPage(page()+1)">›</button>
        </div>
      }
    </div>

    @if (showModal()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>{{ editId() ? 'Editar Paciente' : 'Novo Paciente' }}</h2><button class="close" (click)="closeModal()">✕</button></div>
          <div class="form-group"><label>Nome Completo *</label><input [(ngModel)]="form.nome_completo"/></div>
          <div class="form-row">
            <div class="form-group"><label>CPF</label><input [(ngModel)]="form.cpf" placeholder="000.000.000-00"/></div>
            <div class="form-group"><label>Data de Nascimento</label><input type="date" [(ngModel)]="form.data_nascimento"/></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Gênero *</label>
              <select [(ngModel)]="form.genero"><option value="">Selecione</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="outro">Outro</option></select>
            </div>
            <div class="form-group"><label>Tipo Sanguíneo *</label>
              <select [(ngModel)]="form.tipo_sanguineo"><option value="">Selecione</option>@for(t of tipos;track t){<option [value]="t">{{t}}</option>}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Telefone</label><input [(ngModel)]="form.telefone"/></div>
            <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.email"/></div>
          </div>
          <div class="form-group"><label>Endereço</label><input [(ngModel)]="form.endereco"/></div>
          <div class="form-row">
            <div class="form-group"><label>Hospital / Unidade</label><input [(ngModel)]="form.hospital_unidade"/></div>
            <div class="form-group"><label>Médico Responsável</label><input [(ngModel)]="form.medico_responsavel"/></div>
          </div>
          <div class="form-group"><label>Diagnóstico / Condição</label><input [(ngModel)]="form.diagnostico"/></div>
          <div class="form-group"><label>Status</label>
            <select [(ngModel)]="form.status"><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>
          </div>
          <div class="form-group"><label>Observações</label><textarea [(ngModel)]="form.observacoes"></textarea></div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Salvando...' : (editId() ? 'Salvar' : 'Cadastrar') }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page{padding:24px}.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.page-header h1{font-size:22px;font-weight:700;color:#111}.page-header p{font-size:13px;color:#6b7280;margin-top:2px}
    .search-bar{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:16px}.search-bar input{border:none;outline:none;font-size:14px;width:100%;background:transparent}
    .table-wrap{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px}.table-loading{padding:16px;display:flex;flex-direction:column;gap:10px}.skel{height:52px;background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200%;animation:shimmer 1.4s infinite;border-radius:6px}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    table{width:100%;border-collapse:collapse}thead tr{background:#f9fafb}th{text-align:left;font-size:12px;font-weight:600;color:#6b7280;padding:12px 16px;border-bottom:1px solid #e5e7eb;text-transform:uppercase;letter-spacing:.03em}td{padding:14px 16px;font-size:13px;color:#111;border-bottom:1px solid #f3f4f6;vertical-align:middle}tr:last-child td{border-bottom:none}.nome{font-weight:600}.sub{font-size:11px;color:#9ca3af;margin-top:2px}
    .empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px;color:#9ca3af;font-size:14px}
    .badge-tipo{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:22px;border-radius:6px;font-size:11px;font-weight:700;color:#fff;padding:0 6px}.tipo-pos{background:#16a34a}.tipo-neg{background:#c0392b}.tipo-ab{background:#7c3aed}
    .badge-status{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}.st-ativo{background:#dcfce7;color:#16a34a}.st-inativo{background:#f3f4f6;color:#6b7280}
    .actions{display:flex;gap:6px}.icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280}.icon-btn:hover{background:#f3f4f6}.icon-btn.danger:hover{background:#fef2f2;color:#c0392b;border-color:#fca5a5}
    .pagination{display:flex;gap:6px;justify-content:center;margin-top:16px}.pagination button{width:32px;height:32px;border-radius:6px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:13px;color:#374151}.pagination button.active{background:#c0392b;color:#fff;border-color:#c0392b}.pagination button:disabled{opacity:.4;cursor:not-allowed}
    .btn-primary{background:#c0392b;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer}.btn-primary:disabled{opacity:.65;cursor:not-allowed}.btn-cancel{background:#fff;color:#374151;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 20px;font-size:14px;cursor:pointer}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}.modal{background:#fff;border-radius:12px;width:520px;max-height:90vh;overflow-y:auto;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.2)}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.modal-header h2{font-size:18px;font-weight:700;color:#111}.close{background:none;border:none;font-size:18px;color:#6b7280;cursor:pointer}.modal-footer{display:flex;gap:10px;margin-top:20px}.modal-footer .btn-cancel{flex:1}.modal-footer .btn-primary{flex:2}
    .form-group{margin-bottom:14px}.form-row{display:flex;gap:14px;margin-bottom:14px}.form-row .form-group{flex:1;margin-bottom:0}label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px}input,select,textarea{width:100%;border:1.5px solid #e5e7eb;border-radius:7px;padding:9px 12px;font-size:14px;color:#111;outline:none;font-family:inherit;box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:#c0392b}select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}textarea{resize:vertical;min-height:80px}
  `]
})
export class PacientesComponent implements OnInit {
  private svc   = inject(PacientesService);
  private toast = inject(ToastService);
  pacientes = signal<Paciente[]>([]); total = signal(0); page = signal(1); pages = signal(1);
  loading = signal(true); saving = signal(false); showModal = signal(false); editId = signal<number|null>(null);
  search = ''; tipos = TIPOS;
  private searchTimer: any;
  form: any = this.emptyForm();
  emptyForm() { return { nome_completo:'', cpf:'', data_nascimento:'', genero:'' as Genero, tipo_sanguineo:'' as TipoSanguineo, telefone:'', email:'', endereco:'', hospital_unidade:'', medico_responsavel:'', diagnostico:'', status:'ativo' as const, observacoes:'' }; }
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.svc.getAll({ page: this.page(), limit: 20, search: this.search || undefined }).subscribe({
      next: r => { this.pacientes.set(r.data); this.total.set(r.total); this.pages.set(r.pages); this.loading.set(false); },
      error: () => { this.toast.error('Erro ao carregar pacientes.'); this.loading.set(false); }
    });
  }
  onSearch() { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400); }
  goPage(p: number) { this.page.set(p); this.load(); }
  pageRange() { return Array.from({ length: this.pages() }, (_, i) => i + 1); }
  openModal(p?: Paciente) { this.editId.set(p?.id ?? null); this.form = p ? { ...p } : this.emptyForm(); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }
  save() {
    if (!this.form.nome_completo || !this.form.tipo_sanguineo || !this.form.genero) { this.toast.error('Preencha os campos obrigatórios.'); return; }
    this.saving.set(true);
    const obs = this.editId() ? this.svc.update(this.editId()!, this.form) : this.svc.create(this.form);
    obs.subscribe({ next: () => { this.toast.success(this.editId() ? 'Paciente atualizado!' : 'Paciente cadastrado!'); this.saving.set(false); this.closeModal(); this.load(); }, error: () => this.saving.set(false) });
  }
  delete(id: number, nome: string) {
    if (!confirm(`Excluir "${nome}"?`)) return;
    this.svc.delete(id).subscribe({ next: () => { this.toast.success('Paciente excluído.'); this.load(); } });
  }
  tipoCss(t: TipoSanguineo) { return t.startsWith('AB') ? 'badge-tipo tipo-ab' : t.includes('+') ? 'badge-tipo tipo-pos' : 'badge-tipo tipo-neg'; }
}
