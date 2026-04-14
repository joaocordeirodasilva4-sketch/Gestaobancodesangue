import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API = `${environment.apiUrl}/auth`;

  private _token = signal<string | null>(localStorage.getItem('hemolife_token'));
  private _user = signal<LoginResponse['user'] | null>(
    JSON.parse(localStorage.getItem('hemolife_user') || 'null')
  );

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('hemolife_token', res.access_token);
        localStorage.setItem('hemolife_user', JSON.stringify(res.user));
        this._token.set(res.access_token);
        this._user.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('hemolife_token');
    localStorage.removeItem('hemolife_user');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
