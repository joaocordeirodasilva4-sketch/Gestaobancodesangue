import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast-' + t.type">
          <span class="icon">
            @if (t.type === 'success') { ✓ }
            @if (t.type === 'error')   { ✕ }
            @if (t.type === 'info')    { i }
          </span>
          <span class="msg">{{ t.message }}</span>
          <button class="close" (click)="toast.remove(t.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 9999; pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px; min-width: 280px;
      box-shadow: 0 4px 20px rgba(0,0,0,.15);
      font-size: 13px; font-weight: 500;
      pointer-events: all;
      animation: slideIn .2s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(40px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .toast-error   { background: #fde8e8; color: #991b1b; border: 1px solid #fca5a5; }
    .toast-info    { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .icon {
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
      background: currentColor; color: inherit; opacity: .15;
    }
    .toast-success .icon { background: #16a34a; color: #fff; opacity: 1; }
    .toast-error   .icon { background: #dc2626; color: #fff; opacity: 1; }
    .toast-info    .icon { background: #2563eb; color: #fff; opacity: 1; }
    .msg  { flex: 1; }
    .close {
      background: none; border: none; cursor: pointer;
      font-size: 14px; color: currentColor; opacity: .5; padding: 0 2px;
    }
    .close:hover { opacity: 1; }
  `]
})
export class ToastComponent {
  toast = inject(ToastService);
}
