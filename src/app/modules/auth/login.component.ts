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
      background: var(--g50);
    }
    .login-card {
      background: var(--white);
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,.08);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .logo-icon {
      width: 40px; height: 40px;
      background: var(--primary);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
  `],
  template: `
<div class="login-wrap">
  <div class="login-card">
    <div class="logo">
      <div class="logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <div>
        <div style="font-weight:700;font-size:1.1rem;color:var(--g900)">MediCare</div>
        <div style="font-size:.75rem;color:var(--g400)">Sistema clínico</div>
      </div>
    </div>

    <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:6px;color:var(--g900)">Iniciar sesión</h2>
    <p class="sm muted" style="margin-bottom:24px">Ingresa tus credenciales para continuar</p>

    <div class="fg">
      <label class="lbl">Correo electrónico</label>
      <input type="email" class="fc" [(ngModel)]="email" placeholder="usuario@clinica.mx" (keyup.enter)="login()">
    </div>
    <div class="fg">
      <label class="lbl">Contraseña</label>
      <input type="password" class="fc" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="login()">
    </div>

    @if (error) {
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;margin-bottom:16px;color:var(--danger);font-size:.85rem">
        {{ error }}
      </div>
    }

    <button class="btn btn-primary" type="button" (click)="login()" [disabled]="cargando"
            style="width:100%;justify-content:center;margin-top:8px">
      @if (cargando) { Iniciando sesión… } @else { Entrar }
    </button>
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
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.error    = e?.error?.message ?? 'Credenciales incorrectas';
        this.cargando = false;
      },
    });
  }
}
