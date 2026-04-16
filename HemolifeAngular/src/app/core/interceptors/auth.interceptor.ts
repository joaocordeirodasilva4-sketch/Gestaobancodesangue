import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const toast = inject(ToastService);
  const token = auth.getToken();
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const authReq = token && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (err.status === 403) {
        toast.error('Sem permissão para esta ação.');
      } else if (err.status === 404) {
        // silencioso — cada página trata individualmente
      } else if (err.status === 409) {
        const msg = err.error?.detail?.message ?? 'Conflito: registro já existe.';
        toast.error(msg);
      } else if (err.status === 422) {
        toast.error('Dados inválidos. Verifique os campos obrigatórios.');
      } else if (err.status >= 500) {
        toast.error('Erro no servidor. Tente novamente em instantes.');
      }
      return throwError(() => err);
    })
  );
};
