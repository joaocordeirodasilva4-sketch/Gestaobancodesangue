import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'doadores',     loadComponent: () => import('./pages/doadores/doadores.component').then(m => m.DoadoresComponent) },
      { path: 'estoque',      loadComponent: () => import('./pages/estoque/estoque.component').then(m => m.EstoqueComponent) },
      { path: 'doacoes',      loadComponent: () => import('./pages/doacoes/doacoes.component').then(m => m.DoacoesComponent) },
      { path: 'solicitacoes', loadComponent: () => import('./pages/solicitacoes/solicitacoes.component').then(m => m.SolicitacoesComponent) },
      { path: 'pacientes',    loadComponent: () => import('./pages/pacientes/pacientes.component').then(m => m.PacientesComponent) },
    ]
  },
  { path: 'auth/login', loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
