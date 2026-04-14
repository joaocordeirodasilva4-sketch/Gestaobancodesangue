import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 1;

  private add(type: Toast['type'], message: string) {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.remove(id), 4000);
  }

  success(message: string) { this.add('success', message); }
  error(message: string)   { this.add('error',   message); }
  info(message: string)    { this.add('info',    message); }

  remove(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
