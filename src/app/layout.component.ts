import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService }  from './core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .shell { display:flex; min-height:100vh; }

    .sidebar {
      width:240px; background:var(--white); border-right:1px solid var(--border);
      display:flex; flex-direction:column; position:fixed; top:0; bottom:0; z-index:20;
    }
    .sb-logo {
      display:flex; align-items:center; gap:10px; padding:20px 18px;
      border-bottom:1px solid var(--border);
    }
    .sb-logo-icon {
      width:36px; height:36px; background:var(--primary); border-radius:10px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .sb-nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
    .sb-link {
      display:flex; align-items:center; gap:10px; padding:9px 12px;
      border-radius:var(--r); text-decoration:none; font-size:.84rem;
      color:var(--g600); transition:all .12s; font-weight:450;
    }
    .sb-link:hover { background:var(--g50); color:var(--g900); }
    .sb-link.active { background:var(--primary-lt); color:var(--primary); font-weight:600; }
    .sb-link svg { width:18px; height:18px; flex-shrink:0; }
    .sb-section { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--g400); padding:14px 12px 6px; }
    .sb-footer { padding:12px 14px; border-top:1px solid var(--border); }
    .sb-user { display:flex; align-items:center; gap:10px; }

    .main { flex:1; margin-left:240px; background:var(--g50); min-height:100vh; }

    .sms-tag {
      display:inline-flex; align-items:center; gap:3px; padding:1px 6px;
      border-radius:10px; font-size:.6rem; font-weight:600;
      background:var(--g100); color:var(--g400); margin-left:auto;
    }

    @media(max-width:768px) {
      .sidebar { transform:translateX(-100%); transition:transform .2s; }
      .sidebar.open { transform:translateX(0); }
      .main { margin-left:0; }
    }
  `],
  template: `
<div class="shell">
  <aside class="sidebar">
    <div class="sb-logo">
      <div class="sb-logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/>
        </svg>
      </div>
      <div>
        <div style="font-weight:700;font-size:.95rem;color:var(--g900);letter-spacing:-.01em">mDental</div>
        <div style="font-size:.65rem;color:var(--g400)">Gestión clínica</div>
      </div>
    </div>

    <nav class="sb-nav">
      <div class="sb-section">General</div>
      <a class="sb-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        Panel
      </a>
      <a class="sb-link" routerLink="/citas" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Citas
      </a>

      <div class="sb-section">Pacientes</div>
      <a class="sb-link" routerLink="/pacientes" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        Pacientes
      </a>
      <a class="sb-link" routerLink="/documentos" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Documentos
      </a>

      <div class="sb-section">Análisis</div>
      <a class="sb-link" routerLink="/reportes" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Reportes
      </a>

      <div class="sb-section">Mensajería</div>
      <a class="sb-link" style="opacity:.45;cursor:not-allowed;pointer-events:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Recordatorios
        <span class="sms-tag">Próximamente</span>
      </a>

      @if (auth.usuario()?.rol === 'admin') {
        <div class="sb-section">Administración</div>
        <a class="sb-link" routerLink="/usuarios" routerLinkActive="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Usuarios
        </a>
      }
    </nav>

    <div class="sb-footer">
      <div class="sb-user">
        <div class="av av-sm av-blue">{{ iniciales }}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.82rem;font-weight:500;color:var(--g800);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            {{ auth.usuario()?.nombreCompleto }}
          </div>
          <div style="font-size:.68rem;color:var(--g400)">{{ labelRol }}</div>
        </div>
        <a routerLink="/perfil" style="color:var(--g400);text-decoration:none" title="Mi perfil">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </a>
        <button (click)="logout()" style="background:none;border:none;cursor:pointer;color:var(--g400)" title="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </aside>

  <main class="main">
    <router-outlet></router-outlet>
  </main>
</div>
  `,
})
export class LayoutComponent {
  constructor(public auth: AuthService, private router: any) {}

  get iniciales(): string {
    const n = this.auth.usuario()?.nombreCompleto ?? '';
    const p = n.trim().split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || 'U';
  }

  get labelRol(): string {
    const r = this.auth.usuario()?.rol ?? '';
    return { admin: 'Administrador', medico: 'Odontólogo', recepcionista: 'Recepcionista' }[r] ?? r;
  }

  logout(): void {
    this.auth.logout();
    // Navigate handled by interceptor on 401 or direct
    window.location.href = '/login';
  }
}
