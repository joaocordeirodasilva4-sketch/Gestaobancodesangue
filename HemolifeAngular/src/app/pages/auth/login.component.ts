import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
              <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z"/>
            </svg>
          </div>
          <div>
            <h1>HemoLife</h1>
            <p>Banco de Sangue — Sistema v1.0</p>
          </div>
        </div>

        @if (error()) {
          <div class="error-box">{{ error() }}</div>
        }

        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="username"
                 placeholder="admin@hemolife.com"
                 (keyup.enter)="login()" />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" [(ngModel)]="password"
                 placeholder="••••••••"
                 (keyup.enter)="login()" />
        </div>

        <button class="btn-login" (click)="login()" [disabled]="loading()">
          @if (loading()) {
            <span class="spinner"></span> Entrando...
          } @else {
            Entrar
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; background: #f3f4f6;
      display: flex; align-items: center; justify-content: center;
    }
    .login-card {
      background: #fff; border-radius: 16px; padding: 40px;
      width: 380px; box-shadow: 0 4px 32px rgba(0,0,0,.1);
    }
    .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
    .brand-icon {
      width: 52px; height: 52px; border-radius: 12px;
      background: #c0392b; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .brand h1 { font-size: 20px; font-weight: 800; color: #111; }
    .brand p  { font-size: 12px; color: #9ca3af; margin-top: 2px; }

    .error-box {
      background: #fde8e8; border: 1px solid #fca5a5;
      border-radius: 8px; padding: 10px 14px;
      font-size: 13px; color: #c0392b; margin-bottom: 16px;
    }

    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    input {
      width: 100%; border: 1.5px solid #e5e7eb; border-radius: 8px;
      padding: 11px 14px; font-size: 14px; color: #111; outline: none;
      font-family: inherit; box-sizing: border-box; transition: border .15s;
    }
    input:focus { border-color: #c0392b; }

    .btn-login {
      width: 100%; padding: 13px; background: #c0392b; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 700;
      cursor: pointer; margin-top: 8px; display: flex; align-items: center;
      justify-content: center; gap: 8px; transition: background .15s;
    }
    .btn-login:hover:not(:disabled) { background: #a93226; }
    .btn-login:disabled { opacity: .65; cursor: not-allowed; }

    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  username = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  login() {
    if (!this.username || !this.password) {
      this.error.set('Preencha e-mail e senha.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.detail?.message ?? 'E-mail ou senha incorretos.';
        this.error.set(msg);
      }
    });
  }
}
