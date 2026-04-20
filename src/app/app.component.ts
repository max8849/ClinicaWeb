import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  styles: [`
    .hamburger { display:none; background:none; border:none; cursor:pointer; padding:8px; color:#F0F9FF; }
    .overlay   { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99; }
    @media(max-width:768px) {
      .hamburger { display:flex; align-items:center; justify-content:center; }
      .sidebar   { transform:translateX(-100%); transition:transform .25s ease; }
      .sidebar.open { transform:translateX(0); }
      .overlay.open  { display:block; }
      .main { margin-left:0 !important; }
      .topbar { padding:0 16px !important; }
      .page { padding:16px !important; }
    }
  `],
  template: `
@if (auth.loggedIn()) {
<div class="shell">

  <!-- Overlay móvil -->
  <div class="overlay" [class.open]="sidebarOpen" (click)="closeSidebar()"></div>

  <!-- Sidebar -->
  <nav class="sidebar" [class.open]="sidebarOpen">
    <div class="sb-logo">
      <div class="sb-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0C4A6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C9 2 7 4 7 6.5c0 1.5.4 2.8 1 4.5C9 13 10.5 16 11.5 18.5c.3.7.5 1.5.5 1.5s.2-.8.5-1.5C13.5 16 15 13 16 11c.6-1.7 1-3 1-4.5C17 4 15 2 12 2z"/>
        </svg>
      </div>
      <span class="sb-name">m<span>Dental</span></span>
    </div>

    <div class="sb-nav">
      <div class="sb-section">General</div>

      <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Dashboard
      </a>

      <div class="sb-section">Citas</div>

      <a class="nav-link" routerLink="/citas" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Agenda
      </a>

      <a class="nav-link" href="/sala-espera" target="_blank" rel="noopener" (click)="closeSidebar()"
         style="opacity:.85" title="Abrir en nueva pestaña para mostrar en TV">
        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
        Sala de espera
        <svg viewBox="0 0 24 24" width="11" height="11" style="margin-left:auto;opacity:.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>

      <div class="sb-section">Pacientes</div>

      <a class="nav-link" routerLink="/pacientes" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Pacientes
      </a>

      <a class="nav-link" routerLink="/documentos" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Documentos
      </a>

      <div class="sb-section">Análisis</div>

      <a class="nav-link" routerLink="/reportes" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Reportes
      </a>

      <div class="sb-section">Mensajería</div>

      <span class="nav-link" style="opacity:.35;cursor:not-allowed">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Recordatorios
      </span>

      @if (esAdmin) {
        <div class="sb-section">Admin</div>
        <a class="nav-link" routerLink="/usuarios" routerLinkActive="active" (click)="closeSidebar()">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>
          Usuarios
        </a>
      }
    </div>

    <div class="sb-foot">
      <a class="nav-link" routerLink="/perfil" routerLinkActive="active" (click)="closeSidebar()" style="margin-bottom:4px">
        <div class="av av-md av-blue" style="flex-shrink:0">{{ iniciales }}</div>
        <div style="min-width:0;flex:1">
          <div class="u-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ auth.usuario()?.nombreCompleto }}</div>
          <div class="u-role">{{ labelRol(auth.usuario()?.rol) }}</div>
        </div>
      </a>
      <button class="nav-link" type="button" (click)="cerrarSesion()"
              style="width:100%;color:#f87171;border:none;background:transparent;cursor:pointer">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Cerrar sesión
      </button>
    </div>
  </nav>

  <!-- Main -->
  <main class="main">
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="hamburger" type="button" (click)="sidebarOpen=!sidebarOpen" aria-label="Menú">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--g700)" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <div style="font-size:.9rem;font-weight:600;color:var(--g900)">Sistema de Gestión Clínica</div>
          <div class="xs muted">{{ fechaHoy }}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <a routerLink="/perfil" class="av av-sm av-blue" style="text-decoration:none;cursor:pointer">{{ iniciales }}</a>
      </div>
    </div>
    <router-outlet/>
  </main>

</div>
} @else {
  <router-outlet/>
}
  `,
})
export class AppComponent {
  sidebarOpen = false;
  fechaHoy = new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  get iniciales(): string {
    const n = this.auth.usuario()?.nombreCompleto ?? '';
    const p = n.trim().split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || 'U';
  }

  get esAdmin(): boolean {
    return this.auth.usuario()?.rol === 'admin';
  }

  constructor(public auth: AuthService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarOpen = false);
  }

  closeSidebar() { this.sidebarOpen = false; }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  labelRol(r?: string) { return { admin:'Administrador', medico:'Médico', recepcionista:'Recepcionista' }[r??''] ?? r ?? ''; }
}
