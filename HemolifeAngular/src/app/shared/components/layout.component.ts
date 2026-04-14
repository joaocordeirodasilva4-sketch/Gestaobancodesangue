import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastComponent } from './toast.component';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="shell">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">HemoLife</span>
            <span class="brand-sub">Banco de Sangue</span>
          </div>
        </div>

        <nav class="nav">
          @for (item of navItems; track item.route) {
            <a class="nav-item"
               [routerLink]="item.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }">
              <span class="nav-icon" [innerHTML]="item.icon"></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <span class="version">Sistema v1.0</span>
          <span class="version-sub">Gestão de Banco de Sangue</span>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main">
        <router-outlet />
      <app-toast />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: #f3f4f6; }

    /* SIDEBAR */
    .sidebar {
      width: 160px; min-width: 160px; background: #fff;
      display: flex; flex-direction: column;
      border-right: 1px solid #e5e7eb;
      position: sticky; top: 0; height: 100vh;
    }
    .brand {
      display: flex; align-items: center; gap: 10px;
      padding: 18px 14px 16px; border-bottom: 1px solid #f3f4f6;
    }
    .brand-icon {
      width: 34px; height: 34px; border-radius: 8px;
      background: #c0392b; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .brand-text { display: flex; flex-direction: column; }
    .brand-name { font-size: 13px; font-weight: 700; color: #111; }
    .brand-sub  { font-size: 10px; color: #9ca3af; }

    .nav { padding: 12px 8px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .nav-item {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 10px; border-radius: 8px;
      text-decoration: none; color: #4b5563;
      font-size: 13px; font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .nav-item:hover { background: #f3f4f6; color: #111; }
    .nav-item.active { background: #c0392b; color: #fff; }
    .nav-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .nav-icon ::ng-deep svg { width: 16px; height: 16px; }

    .sidebar-footer {
      padding: 14px; border-top: 1px solid #f3f4f6;
      display: flex; flex-direction: column;
    }
    .version     { font-size: 11px; color: #9ca3af; font-weight: 500; }
    .version-sub { font-size: 10px; color: #d1d5db; }

    /* MAIN */
    .main { flex: 1; overflow-y: auto; }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Painel',       route: '/dashboard',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>` },
    { label: 'Doadores',     route: '/doadores',     icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
    { label: 'Estoque',      route: '/estoque',      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>` },
    { label: 'Solicitações', route: '/solicitacoes', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
    { label: 'Doações',      route: '/doacoes',      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>` },
    { label: 'Pacientes',    route: '/pacientes',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
  ];
}
