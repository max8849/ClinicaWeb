import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService }  from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    /* ══════════════════════════════
       SHELL
    ══════════════════════════════ */
    .shell {
      display: flex;
      min-height: 100vh;
    }

    /* ══════════════════════════════
       SIDEBAR
    ══════════════════════════════ */
    .sidebar {
      width: 248px;
      background: #0b3d5c;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; height: 100vh;
      z-index: 200;
      transition: transform .28s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
    }

    /* Logo strip */
    .sb-brand {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 0 20px;
      height: 62px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      flex-shrink: 0;
    }
    .sb-brand-ico {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(14,165,233,.4);
    }
    .sb-brand-ico svg { width: 20px; height: 20px; stroke: #fff; fill: none; stroke-width: 2; }
    .sb-brand-name {
      font-size: 1rem; font-weight: 700;
      color: #f0f9ff; letter-spacing: -.02em;
    }
    .sb-brand-sub {
      font-size: .62rem; color: #7dd3fc; margin-top: 1px;
    }

    /* Nav */
    .sb-nav {
      flex: 1;
      padding: 12px 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .sb-section {
      font-size: .62rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .1em;
      color: #38bdf8; opacity: .55;
      padding: 16px 10px 5px;
    }
    .sb-link {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 12px; border-radius: 8px;
      text-decoration: none;
      font-size: .875rem; font-weight: 450;
      color: #94d8f8;
      transition: background .14s, color .14s;
      min-height: 44px;
      margin-bottom: 1px;
    }
    .sb-link svg {
      width: 18px; height: 18px;
      fill: none; stroke: currentColor; stroke-width: 1.75;
      flex-shrink: 0; opacity: .8;
    }
    .sb-link:hover {
      background: rgba(255,255,255,.08);
      color: #f0f9ff;
    }
    .sb-link:hover svg { opacity: 1; }
    .sb-link.active {
      background: rgba(56,189,248,.18);
      color: #e0f2fe;
      font-weight: 600;
    }
    .sb-link.active svg { opacity: 1; stroke-width: 2; }
    .sb-link.active::before {
      content: '';
      position: absolute;
      left: 0; top: 8px; bottom: 8px;
      width: 3px; border-radius: 0 3px 3px 0;
      background: #38bdf8;
    }
    /* necesita position:relative para el ::before */
    .sb-link { position: relative; }

    .sb-badge {
      margin-left: auto;
      font-size: .6rem; font-weight: 700;
      background: rgba(56,189,248,.2);
      color: #7dd3fc;
      padding: 2px 8px; border-radius: 20px;
      white-space: nowrap;
    }

    /* Footer usuario */
    .sb-foot {
      padding: 10px;
      border-top: 1px solid rgba(255,255,255,.08);
      flex-shrink: 0;
    }
    .sb-user {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px;
      cursor: default;
      transition: background .14s;
    }
    .sb-user:hover { background: rgba(255,255,255,.07); }
    .sb-user-info { flex: 1; min-width: 0; }
    .sb-user-name {
      font-size: .82rem; font-weight: 500; color: #e0f2fe;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sb-user-role { font-size: .67rem; color: #7dd3fc; }
    .sb-btn {
      width: 30px; height: 30px;
      background: none; border: none; cursor: pointer;
      color: #7dd3fc; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: background .12s, color .12s;
      flex-shrink: 0;
    }
    .sb-btn:hover { background: rgba(255,255,255,.12); color: #f0f9ff; }
    .sb-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.75; }

    /* ══════════════════════════════
       MAIN AREA
    ══════════════════════════════ */
    .main {
      margin-left: 248px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--surface);
      transition: margin .28s cubic-bezier(.4,0,.2,1);
    }

    /* ══════════════════════════════
       TOPBAR
    ══════════════════════════════ */
    .topbar {
      height: 62px;
      background: var(--topbar-bg);
      border-bottom: 1px solid var(--topbar-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 22px;
      position: sticky; top: 0; z-index: 100;
      gap: 14px;
    }
    .topbar-l { display: flex; align-items: center; gap: 10px; }
    .topbar-r { display: flex; align-items: center; gap: 12px; }

    /* Hamburger (oculto en desktop) */
    .hbg {
      display: none;
      width: 38px; height: 38px;
      align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer;
      border-radius: 8px;
      color: var(--g600);
      transition: background .14s;
      flex-shrink: 0;
    }
    .hbg:hover { background: var(--g100); }
    .hbg svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2; display: block; }

    /* Logo en topbar (solo móvil) */
    .tb-logo {
      display: none;
      align-items: center; gap: 8px;
      text-decoration: none;
    }
    .tb-logo-ico {
      width: 30px; height: 30px;
      background: var(--primary);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .tb-logo-ico svg { width: 17px; height: 17px; stroke: #fff; fill: none; stroke-width: 2; }
    .tb-logo-name { font-size: .9rem; font-weight: 700; color: var(--g900); }

    /* ── Toggle día / noche ──────────────────────
       Botón con estado explícito por color —
       siempre visible en ambos modos.
    ─────────────────────────────────────────── */
    .dn-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 7px 14px;
      border-radius: 100px;
      border: none; cursor: pointer;
      font-family: var(--font);
      font-size: .8rem; font-weight: 600;
      transition: opacity .15s, transform .1s;
      white-space: nowrap; user-select: none;
      line-height: 1;
    }
    .dn-btn:hover  { opacity: .88; }
    .dn-btn:active { transform: scale(.96); }
    .dn-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.2; flex-shrink: 0; }
    /* Modo día → botón oscuro (luna) → claro contraste sobre topbar blanco */
    .dn-day  { background: #1e293b; color: #f8fafc; }
    /* Modo noche → botón ámbar (sol) → claro contraste sobre topbar oscuro */
    .dn-night { background: #f59e0b; color: #1c1007; }
    /* Móvil: solo icono, sin etiqueta de texto */
    @media (max-width: 640px) {
      .dn-btn { padding: 8px; gap: 0; }
      .dn-label { display: none; }
    }

    /* User pill (topbar derecha) */
    .tb-user {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 10px 5px 5px;
      border-radius: 100px;
      border: 1px solid var(--border);
      background: var(--g50);
      cursor: default;
    }
    .tb-user-name { font-size: .82rem; font-weight: 500; color: var(--g700); }

    /* ══════════════════════════════
       OVERLAY
    ══════════════════════════════ */
    .overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 190;
      backdrop-filter: blur(2px);
    }
    .overlay.show { display: block; }

    /* ══════════════════════════════
       BOTTOM NAV (solo móvil)
    ══════════════════════════════ */
    .bot-nav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 62px;
      background: var(--white);
      border-top: 1px solid var(--border);
      z-index: 150;
      align-items: stretch;
      box-shadow: 0 -4px 16px rgba(0,0,0,.06);
    }
    .bn {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 3px;
      text-decoration: none;
      color: var(--g400);
      font-size: .6rem; font-weight: 600;
      letter-spacing: .02em;
      text-transform: uppercase;
      border: none; background: none; cursor: pointer;
      transition: color .14s;
      padding: 8px 4px;
    }
    .bn svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 1.6; }
    .bn.active { color: var(--primary); }
    .bn.active svg { stroke-width: 2.2; }

    /* ══════════════════════════════
       RESPONSIVE
    ══════════════════════════════ */
    @media (max-width: 960px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open {
        transform: translateX(0);
        box-shadow: 4px 0 32px rgba(0,0,0,.3);
      }
      .main { margin-left: 0 !important; }
      .hbg { display: flex; }
    }

    @media (max-width: 640px) {
      .main { padding-bottom: 62px; }
      .bot-nav { display: flex; }
      .tb-logo { display: flex; }
      .tb-user-name { display: none; }
    }
  `],
  template: `
<!-- Overlay -->
<div class="overlay" [class.show]="sidebarOpen()" (click)="closeSidebar()"></div>

<div class="shell">

  <!-- ══════════ SIDEBAR ══════════ -->
  <aside class="sidebar" [class.open]="sidebarOpen()">

    <div class="sb-brand">
      <div class="sb-brand-ico">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/></svg>
      </div>
      <div>
        <div class="sb-brand-name">mDental</div>
        <div class="sb-brand-sub">Gestión clínica</div>
      </div>
    </div>

    <nav class="sb-nav">

      <div class="sb-section">General</div>
      <a class="sb-link" routerLink="/dashboard" routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        Panel
      </a>
      <a class="sb-link" routerLink="/citas" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Citas
      </a>

      <div class="sb-section">Pacientes</div>
      <a class="sb-link" routerLink="/pacientes" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        Pacientes
      </a>
      <a class="sb-link" routerLink="/documentos" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Documentos
      </a>

      <div class="sb-section">Análisis</div>
      <a class="sb-link" routerLink="/reportes" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Reportes
      </a>

      <div class="sb-section">Mensajería</div>
      <span class="sb-link" style="opacity:.35;cursor:not-allowed">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Recordatorios
        <span class="sb-badge">Pronto</span>
      </span>

      @if (auth.usuario()?.rol === 'admin') {
        <div class="sb-section">Admin</div>
        <a class="sb-link" routerLink="/usuarios" routerLinkActive="active" (click)="closeSidebar()">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Usuarios
        </a>
      }

    </nav>

    <div class="sb-foot">
      <div class="sb-user">
        <div class="av av-sm av-blue" style="font-size:.7rem;flex-shrink:0">{{ iniciales }}</div>
        <div class="sb-user-info">
          <div class="sb-user-name">{{ auth.usuario()?.nombreCompleto }}</div>
          <div class="sb-user-role">{{ labelRol }}</div>
        </div>
        <a routerLink="/perfil" class="sb-btn" title="Mi perfil" (click)="closeSidebar()">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </a>
        <button class="sb-btn" (click)="logout()" title="Cerrar sesión">
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>

  </aside>

  <!-- ══════════ MAIN ══════════ -->
  <div class="main">

    <!-- ── Topbar ── -->
    <header class="topbar">
      <div class="topbar-l">
        <!-- Hamburger — visible solo al colapsar sidebar -->
        <button class="hbg" (click)="toggleSidebar()" aria-label="Menú">
          <svg viewBox="0 0 24 24">
            @if (sidebarOpen()) {
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            } @else {
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            }
          </svg>
        </button>
        <!-- Logo solo en móvil -->
        <div class="tb-logo">
          <div class="tb-logo-ico">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/></svg>
          </div>
          <span class="tb-logo-name">mDental</span>
        </div>
      </div>

      <div class="topbar-r">

        <!-- ══ TOGGLE DÍA / NOCHE ══ -->
        @if (theme.dark()) {
          <button class="dn-btn dn-night" (click)="theme.toggle()" title="Cambiar a modo día">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <span class="dn-label">Modo día</span>
          </button>
        } @else {
          <button class="dn-btn dn-day" (click)="theme.toggle()" title="Cambiar a modo noche">
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span class="dn-label">Modo noche</span>
          </button>
        }

        <!-- Usuario -->
        <div class="tb-user">
          <div class="av av-sm av-blue" style="font-size:.68rem">{{ iniciales }}</div>
          <span class="tb-user-name">{{ primerNombre }}</span>
        </div>

      </div>
    </header>

    <router-outlet></router-outlet>
  </div>

</div>

<!-- ══════════ BOTTOM NAV (móvil) ══════════ -->
<nav class="bot-nav">
  <a class="bn" routerLink="/dashboard" routerLinkActive="active"
     [routerLinkActiveOptions]="{exact:true}">
    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
    Panel
  </a>
  <a class="bn" routerLink="/citas" routerLinkActive="active">
    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    Citas
  </a>
  <a class="bn" routerLink="/pacientes" routerLinkActive="active">
    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
    Pacientes
  </a>
  <button class="bn" (click)="toggleSidebar()">
    <svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
    Más
  </button>
</nav>
  `,
})
export class LayoutComponent {
  sidebarOpen = signal(false);

  constructor(public auth: AuthService, public theme: ThemeService) {}

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void  { this.sidebarOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.closeSidebar(); }

  get iniciales(): string {
    const n = this.auth.usuario()?.nombreCompleto ?? '';
    const p = n.trim().split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || 'U';
  }

  get primerNombre(): string {
    return this.auth.usuario()?.nombreCompleto?.split(' ')[0] ?? '';
  }

  get labelRol(): string {
    const r = this.auth.usuario()?.rol ?? '';
    return { admin: 'Administrador', medico: 'Odontólogo', recepcionista: 'Recepcionista' }[r] ?? r;
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}
