import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';
import { AuthService }  from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
    }
    .login-card {
      background: var(--white);
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.05);
      padding: 44px 40px;
      width: 100%;
      max-width: 420px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 36px;
    }
    .logo-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, var(--primary) 0%, #0284c7 100%);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(3,105,161,.35);
      flex-shrink: 0;
    }
    .powered-by {
      text-align: center;
      margin-top: 28px;
      font-size: .7rem;
      color: var(--g400);
    }
    /* ── Móvil: pantalla completa, sensación nativa ── */
    @media (max-width: 540px) {
      .login-wrap {
        padding: 0;
        align-items: stretch;
        background: var(--white);
      }
      .login-card {
        border-radius: 0;
        box-shadow: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .login-hero {
        background: linear-gradient(160deg, #0c4a6e 0%, #0369a1 60%, #0ea5e9 100%);
        padding: 52px 28px 40px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .login-body {
        flex: 1;
        padding: 36px 28px 32px;
        display: flex;
        flex-direction: column;
      }
      .logo { margin-bottom: 0; }
      .logo-icon {
        background: rgba(255,255,255,.2);
        box-shadow: none;
        backdrop-filter: blur(8px);
      }
      .logo-icon svg { stroke: white; }
    }
    @media (min-width: 541px) {
      .login-hero { display: none; }
    }
    @media (max-width: 540px) {
      .desktop-logo { display: none !important; }
    }
  `],
  template: `
<div class="login-wrap">
  <div class="login-card">

    <!-- Hero sección solo visible en móvil -->
    <div class="login-hero">
      <div class="logo">
        <div class="logo-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/>
          </svg>
        </div>
        <div>
          <div style="font-weight:700;font-size:1.4rem;color:#fff;letter-spacing:-.02em">mDental</div>
          <div style="font-size:.75rem;color:rgba(255,255,255,.65);margin-top:2px">Sistema de gestión clínica</div>
        </div>
      </div>
      <div>
        <div style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:4px">Bienvenido</div>
        <div style="font-size:.82rem;color:rgba(255,255,255,.6)">Inicia sesión para continuar</div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="login-body">

      <!-- Logo solo visible en desktop -->
      <div class="logo desktop-logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/>
          </svg>
        </div>
        <div>
          <div style="font-weight:700;font-size:1.2rem;color:var(--g900);letter-spacing:-.02em">mDental</div>
          <div style="font-size:.72rem;color:var(--g400);letter-spacing:.02em">Sistema de gestión clínica</div>
        </div>
      </div>

      <h2 style="font-size:1.2rem;font-weight:600;margin-bottom:5px;color:var(--g900)">Iniciar sesión</h2>
      <p class="sm muted" style="margin-bottom:24px">Ingresa tus credenciales para continuar</p>

      <div class="fg">
        <label class="lbl">Correo electrónico</label>
        <input type="email" class="fc" [(ngModel)]="email" placeholder="usuario@mdental.mx" (keyup.enter)="login()" autocomplete="email">
      </div>
      <div class="fg">
        <label class="lbl">Contraseña</label>
        <input type="password" class="fc" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="login()" autocomplete="current-password">
      </div>

      @if (error) {
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;margin-bottom:16px;color:var(--danger);font-size:.85rem">
          {{ error }}
        </div>
      }

      <button class="btn btn-primary" type="button" (click)="login()" [disabled]="cargando"
              style="width:100%;justify-content:center;margin-top:8px;min-height:46px;font-size:.95rem">
        @if (cargando) { Iniciando sesión… } @else { Entrar }
      </button>

      <div class="powered-by" style="margin-top:auto;padding-top:24px">
        mDental · Sistema clínico
      </div>
    </div>

  </div>
</div>
  `,
})
export class LoginComponent {
  email    = '';
  password = '';
  error    = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) { this.error = 'Completa todos los campos.'; return; }
    this.cargando = true;
    this.error    = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        if (res.success) this.router.navigate(['/dashboard']);
        else { this.error = res.message ?? 'Credenciales incorrectas'; this.cargando = false; }
      },
      error: (e) => {
        this.error   = e?.error?.message ?? 'Error al conectar con el servidor';
        this.cargando = false;
      },
    });
  }
}