import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { AuthService }  from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  styles: [`
    /* ── Shell ── */
    .shell { display:flex; min-height:100vh; }

    /* ── Sidebar ── */
    .sidebar {
      width:248px; background:#0b3d5c;
      display:flex; flex-direction:column;
      position:fixed; top:0; left:0; height:100vh; z-index:200;
      transition:transform .26s cubic-bezier(.4,0,.2,1);
    }
    .sb-logo {
      display:flex; align-items:center; gap:11px;
      padding:0 20px; height:62px;
      border-bottom:1px solid rgba(255,255,255,.08); flex-shrink:0;
    }
    .sb-logo-ico {
      width:36px; height:36px;
      background:linear-gradient(135deg,#38bdf8,#0ea5e9);
      border-radius:10px; display:flex; align-items:center;
      justify-content:center; flex-shrink:0;
      box-shadow:0 2px 8px rgba(14,165,233,.35);
    }
    .sb-logo-ico svg { width:20px; height:20px; stroke:#fff; fill:none; stroke-width:2; }
    .sb-logo-name  { font-size:1rem; font-weight:700; color:#f0f9ff; letter-spacing:-.02em; }
    .sb-logo-sub   { font-size:.62rem; color:#7dd3fc; margin-top:1px; }

    .sb-nav { flex:1; padding:12px 10px; overflow-y:auto; display:flex; flex-direction:column; }
    .sb-section {
      font-size:.62rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.1em; color:#38bdf8; opacity:.55;
      padding:16px 10px 5px;
    }
    .nav-link {
      display:flex; align-items:center; gap:11px;
      padding:10px 12px; border-radius:8px;
      text-decoration:none; font-size:.875rem; font-weight:450;
      color:#94d8f8; transition:background .13s,color .13s;
      min-height:44px; margin-bottom:1px; position:relative;
    }
    .nav-link svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.75; flex-shrink:0; opacity:.8; }
    .nav-link:hover { background:rgba(255,255,255,.08); color:#f0f9ff; }
    .nav-link:hover svg { opacity:1; }
    .nav-link.active {
      background:rgba(56,189,248,.18); color:#e0f2fe; font-weight:600;
    }
    .nav-link.active svg { opacity:1; stroke-width:2; }
    .nav-link.active::before {
      content:''; position:absolute; left:0; top:8px; bottom:8px;
      width:3px; border-radius:0 3px 3px 0; background:#38bdf8;
    }

    .sb-foot {
      padding:10px; border-top:1px solid rgba(255,255,255,.08); flex-shrink:0;
    }
    .sb-user {
      display:flex; align-items:center; gap:10px;
      padding:10px 12px; border-radius:8px;
    }
    .sb-user:hover { background:rgba(255,255,255,.07); }
    .u-name { font-size:.82rem; font-weight:500; color:#e0f2fe; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .u-role { font-size:.67rem; color:#7dd3fc; }
    .sb-btn {
      width:30px; height:30px; background:none; border:none; cursor:pointer;
      color:#7dd3fc; border-radius:6px;
      display:flex; align-items:center; justify-content:center;
      transition:background .12s; flex-shrink:0;
    }
    .sb-btn:hover { background:rgba(255,255,255,.12); color:#f0f9ff; }
    .sb-btn svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.75; }

    /* ── Main ── */
    .main {
      margin-left:248px; flex:1;
      display:flex; flex-direction:column;
      min-height:100vh; background:var(--surface);
    }

    /* ── Topbar ── */
    .topbar {
      height:62px;
      background:var(--white);
      border-bottom:1px solid var(--border);
      display:flex; align-items:center;
      justify-content:space-between;
      padding:0 22px;
      position:sticky; top:0; z-index:100;
      gap:14px;
    }
    .topbar-l { display:flex; align-items:center; gap:10px; flex:1; min-width:0; }
    .topbar-r { display:flex; align-items:center; gap:10px; flex-shrink:0; }

    /* ── Hamburger (oculto en desktop) ── */
    .hbg {
      display:none; width:38px; height:38px;
      align-items:center; justify-content:center;
      background:none; border:none; cursor:pointer;
      border-radius:8px; color:var(--g600);
      transition:background .13s; flex-shrink:0;
    }
    .hbg:hover { background:var(--g100); }
    .hbg svg { width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:2; display:block; }

    /* Logo en topbar (solo móvil pequeño) */
    .tb-logo { display:none; align-items:center; gap:8px; flex-shrink:0; }
    .tb-logo-ico {
      width:30px; height:30px; background:var(--primary);
      border-radius:8px; display:flex; align-items:center; justify-content:center;
    }
    .tb-logo-ico svg { width:17px; height:17px; stroke:#fff; fill:none; stroke-width:2; }
    .tb-logo-nm { font-size:.9rem; font-weight:700; color:var(--g900); }

    /* ── Buscador topbar ── */
    .tb-search {
      display:flex; align-items:center; gap:8px;
      background:var(--g50); border:1px solid var(--border);
      border-radius:10px; padding:0 12px; height:38px;
      flex:1; max-width:360px; transition:border-color .15s, box-shadow .15s;
    }
    .tb-search:focus-within {
      border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-lt);
    }
    .tb-search svg { width:15px; height:15px; fill:none; stroke:var(--g400); stroke-width:2; flex-shrink:0; }
    .tb-search input {
      flex:1; border:none; outline:none; background:transparent;
      font-family:var(--font); font-size:.875rem; color:var(--g900); min-width:0;
    }
    .tb-search input::placeholder { color:var(--g400); }

    /* ── Toggle día/noche ── */
    .dn-btn {
      display:flex; align-items:center; gap:7px;
      padding:7px 15px; border-radius:100px;
      border:none; cursor:pointer;
      font-family:var(--font);
      font-size:.8rem; font-weight:600;
      transition:opacity .15s, transform .1s;
      white-space:nowrap; user-select:none; line-height:1;
      flex-shrink:0;
    }
    .dn-btn:hover  { opacity:.85; }
    .dn-btn:active { transform:scale(.96); }
    .dn-btn svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:2.2; flex-shrink:0; }
    .dn-day   { background:#1e293b; color:#f8fafc; }
    .dn-night { background:#f59e0b; color:#1c1007; }

    /* Pill de usuario */
    .tb-user {
      display:flex; align-items:center; gap:8px;
      padding:5px 12px 5px 5px;
      border-radius:100px;
      border:1px solid var(--border);
      background:var(--g50);
    }
    .tb-user-name { font-size:.82rem; font-weight:500; color:var(--g700); }

    /* ── Overlay ── */
    .overlay {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,.5); z-index:190;
      backdrop-filter:blur(2px);
    }
    .overlay.open { display:block; }

    /* ── Bottom nav (solo móvil) ── */
    .bot-nav {
      display:none;
      position:fixed; bottom:0; left:0; right:0; height:62px;
      background:var(--white); border-top:1px solid var(--border);
      z-index:150; box-shadow:0 -4px 16px rgba(0,0,0,.06);
      align-items:stretch;
    }
    .bn {
      flex:1; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:3px;
      text-decoration:none; color:var(--g400);
      font-size:.58rem; font-weight:600; text-transform:uppercase; letter-spacing:.03em;
      border:none; background:none; cursor:pointer; padding:8px 4px;
      transition:color .13s;
    }
    .bn svg { width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:1.6; }
    .bn.active { color:var(--primary); }
    .bn.active svg { stroke-width:2.2; }

    /* ── Toasts ── */
    .toast-stack {
      position:fixed; bottom:24px; right:24px; z-index:9999;
      display:flex; flex-direction:column; gap:10px;
      max-width:340px; width:calc(100vw - 32px);
      pointer-events:none;
    }
    .toast {
      display:flex; align-items:flex-start; gap:11px;
      background:var(--white); border-radius:12px;
      padding:13px 15px; border:1px solid var(--border);
      box-shadow:0 8px 32px rgba(0,0,0,.14);
      animation:toastIn .22s cubic-bezier(.4,0,.2,1);
      pointer-events:all;
    }
    @keyframes toastIn {
      from { opacity:0; transform:translateX(32px) scale(.96); }
      to   { opacity:1; transform:translateX(0) scale(1); }
    }
    .toast-ico {
      width:22px; height:22px; border-radius:50%;
      display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px;
    }
    .toast-ico svg { width:13px; height:13px; stroke:#fff; fill:none; stroke-width:2.5; }
    .toast-success .toast-ico { background:#16a34a; }
    .toast-error   .toast-ico { background:#dc2626; }
    .toast-warning .toast-ico { background:#d97706; }
    .toast-success { border-left:3px solid #16a34a; }
    .toast-error   { border-left:3px solid #dc2626; }
    .toast-warning { border-left:3px solid #d97706; }
    .toast-msg  { flex:1; font-size:.85rem; line-height:1.45; color:var(--g800); font-weight:500; }
    .toast-close {
      background:none; border:none; cursor:pointer; color:var(--g400);
      font-size:18px; line-height:1; padding:0 2px; flex-shrink:0;
      transition:color .12s;
    }
    .toast-close:hover { color:var(--g700); }

    /* ── Responsive ── */
    @media (max-width:960px) {
      .sidebar { transform:translateX(-100%); }
      .sidebar.open { transform:translateX(0); box-shadow:4px 0 32px rgba(0,0,0,.3); }
      .main { margin-left:0 !important; }
      .hbg { display:flex; }

      .g2,.g3 { grid-template-columns:1fr !important; }
      .g4      { grid-template-columns:1fr 1fr !important; }
      .fr2,.fr3 { grid-template-columns:1fr !important; }
    }
    @media (max-width:640px) {
      .main { padding-bottom:62px; }
      .bot-nav { display:flex; }
      .tb-logo { display:flex; }
      .tb-user-name { display:none; }
      .topbar { padding:0 14px; }
      .toast-stack { bottom:74px; right:12px; left:12px; max-width:none; width:auto; }
      .tb-search { display:none; }
    }
  `],
  template: `
@if (auth.loggedIn()) {

<!-- Overlay -->
<div class="overlay" [class.open]="sidebarOpen()" (click)="closeSidebar()"></div>

<div class="shell">

  <!-- ══ SIDEBAR ══ -->
  <aside class="sidebar" [class.open]="sidebarOpen()">
    <div class="sb-logo">
      <div class="sb-logo-ico">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/></svg>
      </div>
      <div>
        <div class="sb-logo-name">mDental</div>
        <div class="sb-logo-sub">Gestión clínica</div>
      </div>
    </div>

    <nav class="sb-nav">
      <div class="sb-section">General</div>
      <a class="nav-link" routerLink="/dashboard" routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        Panel
      </a>
      <a class="nav-link" routerLink="/citas" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Citas
      </a>
      <a class="nav-link" href="/sala-espera" target="_blank" rel="noopener"
         style="opacity:.7" title="Abre en nueva pestaña para TV">
        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
        Sala de espera
        <svg viewBox="0 0 24 24" width="11" height="11" style="margin-left:auto;opacity:.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>

      <div class="sb-section">Pacientes</div>
      <a class="nav-link" routerLink="/pacientes" routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Pacientes
      </a>
      <a class="nav-link" routerLink="/documentos" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Documentos
      </a>

      <div class="sb-section">Análisis</div>
      <a class="nav-link" routerLink="/reportes" routerLinkActive="active" (click)="closeSidebar()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Reportes
      </a>

      <div class="sb-section">Mensajería</div>
      <span class="nav-link" style="opacity:.35;cursor:not-allowed">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Recordatorios
        <span style="margin-left:auto;font-size:.6rem;background:rgba(255,255,255,.1);padding:2px 7px;border-radius:10px">Pronto</span>
      </span>

      @if (esAdmin) {
        <div class="sb-section">Admin</div>
        <a class="nav-link" routerLink="/usuarios" routerLinkActive="active" (click)="closeSidebar()">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>
          Usuarios
        </a>
      }
    </nav>

    <div class="sb-foot">
      <div class="sb-user">
        <div class="av av-sm av-blue" style="flex-shrink:0;font-size:.7rem">{{ iniciales }}</div>
        <div style="flex:1;min-width:0">
          <div class="u-name">{{ auth.usuario()?.nombreCompleto }}</div>
          <div class="u-role">{{ labelRol(auth.usuario()?.rol) }}</div>
        </div>
        <a routerLink="/perfil" class="sb-btn" title="Mi perfil" (click)="closeSidebar()">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </a>
        <button class="sb-btn" (click)="cerrarSesion()" title="Cerrar sesión">
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- ══ MAIN ══ -->
  <main class="main">

    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-l">
        <button class="hbg" (click)="toggleSidebar()" aria-label="Menú">
          <svg viewBox="0 0 24 24">
            @if (sidebarOpen()) {
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            } @else {
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            }
          </svg>
        </button>
        <div class="tb-logo">
          <div class="tb-logo-ico">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 7c0 2 .5 3.5 1.5 5.5C8.5 14.5 10 18 11 20.5c.3.7.7 1.5 1 1.5s.7-.8 1-1.5c1-2.5 2.5-6 3.5-8C17.5 10.5 18 9 18 7c0-2.5-2.5-5-6-5z"/></svg>
          </div>
          <span class="tb-logo-nm">mDental</span>
        </div>

        <!-- ══ BUSCADOR ══ -->
        <form class="tb-search" (ngSubmit)="buscarPaciente()">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input [(ngModel)]="topbarQ" name="q"
                 placeholder="Buscar paciente…"
                 autocomplete="off">
        </form>
      </div>

      <div class="topbar-r">

        <!-- ══ TOGGLE DÍA / NOCHE ══ -->
        @if (theme.dark()) {
          <button class="dn-btn dn-night" (click)="theme.toggle()" title="Cambiar a modo día">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            Modo día
          </button>
        } @else {
          <button class="dn-btn dn-day" (click)="theme.toggle()" title="Cambiar a modo noche">
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            Modo noche
          </button>
        }

        <!-- Usuario -->
        <div class="tb-user">
          <a routerLink="/perfil" class="av av-sm av-blue"
             style="text-decoration:none;font-size:.68rem;cursor:pointer">{{ iniciales }}</a>
          <span class="tb-user-name">{{ primerNombre }}</span>
        </div>

      </div>
    </header>

    <router-outlet/>
  </main>

</div>

<!-- Bottom nav móvil -->
<nav class="bot-nav">
  <a class="bn" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
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

} @else {
  <router-outlet/>
}

<!-- ══ TOASTS ══ -->
@if (toast.items().length > 0) {
  <div class="toast-stack">
    @for (t of toast.items(); track t.id) {
      <div class="toast" [class]="'toast-' + t.type">
        <span class="toast-ico">
          @if (t.type === 'success') {
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          } @else if (t.type === 'error') {
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          } @else {
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          }
        </span>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" (click)="toast.remove(t.id)" aria-label="Cerrar">×</button>
      </div>
    }
  </div>
}
  `,
})
export class AppComponent {
  sidebarOpen = signal(false);
  topbarQ     = '';

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    public toast: ToastService,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarOpen.set(false));
  }

  buscarPaciente(): void {
    const q = this.topbarQ.trim();
    if (!q) return;
    this.router.navigate(['/pacientes'], { queryParams: { q } });
    this.topbarQ = '';
  }

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void  { this.sidebarOpen.set(false); }

  get iniciales(): string {
    const n = this.auth.usuario()?.nombreCompleto ?? '';
    const p = n.trim().split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || 'U';
  }

  get primerNombre(): string {
    return this.auth.usuario()?.nombreCompleto?.split(' ')[0] ?? '';
  }

  get esAdmin(): boolean {
    return this.auth.usuario()?.rol === 'admin';
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  labelRol(r?: string): string {
    return { admin: 'Administrador', medico: 'Médico', recepcionista: 'Recepcionista' }[r ?? ''] ?? r ?? '';
  }
}
