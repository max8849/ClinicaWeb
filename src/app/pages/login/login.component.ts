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
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
    }
    .login-card {
      background: var(--white);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04);
      padding: 44px 40px;
      width: 100%;
      max-width: 420px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    .logo-icon {
      width: 44px; height: 44px;
      background: var(--primary);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .powered-by {
      text-align: center;
      margin-top: 24px;
      font-size: .7rem;
      color: var(--g400);
    }
  `],
  template: `
<div class="login-wrap">
  <div class="login-card">
    <div class="logo">
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

    <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:6px;color:var(--g900)">Iniciar sesión</h2>
    <p class="sm muted" style="margin-bottom:24px">Ingresa tus credenciales para continuar</p>

    <div class="fg">
      <label class="lbl">Correo electrónico</label>
      <input type="email" class="fc" [(ngModel)]="email" placeholder="usuario@mdental.mx" (keyup.enter)="login()">
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

    <div class="powered-by">
      Desarrollado con <strong>mDental</strong> · Sistema clínico
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