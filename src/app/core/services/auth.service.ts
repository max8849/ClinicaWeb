import { Injectable, signal, computed } from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { tap }                          from 'rxjs';
import { ApiResponse, LoginRequest, LoginResponse, UsuarioDTO } from '../models/api.models';
import { environment }                  from '../../../environments/environment';

const TOKEN_KEY   = 'md_token';
const USER_KEY    = 'md_user';
const EXPIRES_KEY = 'md_expires';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;

  // ─── Estado reactivo ─────────────────────────────────────────────────────
  private readonly _token   = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _usuario = signal<UsuarioDTO | null>(this.loadUser());

  readonly token    = this._token.asReadonly();
  readonly usuario  = this._usuario.asReadonly();
  readonly loggedIn = computed(() => !!this._token());

  constructor(private http: HttpClient) {}

  // ─── Login ────────────────────────────────────────────────────────────────
  login(dto: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.base}/login`, dto).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.saveSession(res.data);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this._token.set(null);
    this._usuario.set(null);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private saveSession(data: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY,   data.token);
    localStorage.setItem(USER_KEY,    JSON.stringify(data.usuario));
    localStorage.setItem(EXPIRES_KEY, data.expiresAt);
    this._token.set(data.token);
    this._usuario.set(data.usuario);
  }

  private loadUser(): UsuarioDTO | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
