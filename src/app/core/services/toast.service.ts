import { Injectable, signal } from '@angular/core';

export interface Toast {
  id:      number;
  type:    'success' | 'error' | 'warning';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  items = signal<Toast[]>([]);
  private seq = 0;

  success(message: string) { this._add('success', message, 4000); }
  error(message: string)   { this._add('error',   message, 6000); }
  warning(message: string) { this._add('warning', message, 5000); }

  remove(id: number): void {
    this.items.update(ts => ts.filter(t => t.id !== id));
  }

  private _add(type: Toast['type'], message: string, ms: number): void {
    const id = ++this.seq;
    this.items.update(ts => [...ts, { id, type, message }]);
    setTimeout(() => this.remove(id), ms);
  }
}
