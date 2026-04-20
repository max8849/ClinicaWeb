import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioAdminDTO, UsuarioCreateDTO, UsuarioUpdateDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page fade-in">

  <div class="ph">
    <div>
      <h1>Gestión de usuarios</h1>
      <p>{{ total }} usuarios en el sistema</p>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" type="button" (click)="abrirCrear()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo usuario
      </button>
    </div>
  </div>

  <!-- Filtros -->
  <div class="filtros-row">
    <div class="search" style="flex:1;max-width:300px">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="fc" placeholder="Buscar nombre o email…" [(ngModel)]="q" (ngModelChange)="buscar()">
    </div>
    <select class="fc" style="width:160px" [(ngModel)]="fRol" (ngModelChange)="buscar()">
      <option value="">Todos los roles</option>
      <option value="admin">Administrador</option>
      <option value="medico">Médico</option>
      <option value="recepcionista">Recepcionista</option>
    </select>
    <select class="fc" style="width:140px" [(ngModel)]="fActivo" (ngModelChange)="buscar()">
      <option value="">Todos</option>
      <option value="true">Activos</option>
      <option value="false">Inactivos</option>
    </select>
  </div>

  @if (cargando) {
    <div class="empty"><div class="sm muted">Cargando usuarios…</div></div>
  } @else {
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Especialidad / Cédula</th><th>Estado</th><th>Registrado</th><th></th></tr>
        </thead>
        <tbody>
          @for (u of usuarios; track u.id) {
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="av av-sm" [class.av-blue]="u.rol==='medico'" [class.av-green]="u.rol==='admin'" [class.av-amber]="u.rol==='recepcionista'">
                    {{ u.nombreCompleto[0] }}
                  </div>
                  <span style="font-weight:500">{{ u.nombreCompleto }}</span>
                </div>
              </td>
              <td class="sm muted">{{ u.email }}</td>
              <td><span class="badge" [ngClass]="badgeRol(u.rol)">{{ labelRol(u.rol) }}</span></td>
              <td class="sm">
                @if (u.especialidad) { <div>{{ u.especialidad }}</div> }
                @if (u.cedula) { <div class="muted xs">Céd. {{ u.cedula }}</div> }
                @if (!u.especialidad && !u.cedula) { <span class="muted">—</span> }
              </td>
              <td>
                <span class="badge" [class.b-green]="u.activo" [class.b-red]="!u.activo">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="sm muted">{{ formatFecha(u.createdAt) }}</td>
              <td>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-ghost btn-sm btn-icon" title="Editar" type="button" (click)="abrirEditar(u)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" title="Reset password" type="button" (click)="abrirReset(u)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--warning)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </button>
                  @if (u.activo) {
                    <button class="btn btn-ghost btn-sm btn-icon" title="Desactivar" type="button" (click)="toggleActivo(u)">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--danger)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  } @else {
                    <button class="btn btn-ghost btn-sm" style="font-size:.72rem;color:var(--success)" type="button" (click)="toggleActivo(u)">Activar</button>
                  }
                </div>
              </td>
            </tr>
          }
          @empty {
            <tr><td colspan="7"><div class="empty"><h3>Sin usuarios</h3></div></td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (totalPaginas > 1) {
      <div class="pag-row">
        <button class="btn btn-ghost btn-sm" [disabled]="page===1" (click)="irPagina(page-1)" type="button">← Anterior</button>
        <span class="sm muted">Pág. {{ page }} / {{ totalPaginas }}</span>
        <button class="btn btn-ghost btn-sm" [disabled]="page===totalPaginas" (click)="irPagina(page+1)" type="button">Siguiente →</button>
      </div>
    }
  }
</div>

<!-- Modal crear / editar -->
@if (modal) {
  <div class="backdrop" (click)="closeOnBackdrop($event)">
    <div class="modal">
      <div class="m-head">
        <h3>{{ editando ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
        <button class="close-btn" type="button" (click)="modal=false">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="m-body">
        <div class="fr2">
          <div class="fg"><label class="lbl">Nombre(s) <span class="req">*</span></label>
            <input class="fc" [(ngModel)]="form.nombre" placeholder="Carlos"></div>
          <div class="fg"><label class="lbl">Apellidos <span class="req">*</span></label>
            <input class="fc" [(ngModel)]="form.apellidos" placeholder="Mendoza Ríos"></div>
        </div>
        <div class="fg"><label class="lbl">Email <span class="req">*</span></label>
          <input type="email" class="fc" [(ngModel)]="form.email" placeholder="usuario@clinica.mx"></div>
        @if (!editando) {
          <div class="fg"><label class="lbl">Contraseña <span class="req">*</span></label>
            <input type="password" class="fc" [(ngModel)]="form.password" placeholder="Mínimo 8 caracteres"></div>
        }
        <div class="fr2">
          <div class="fg">
            <label class="lbl">Rol <span class="req">*</span></label>
            <select class="fc" [(ngModel)]="form.rol" (ngModelChange)="onRolChange()">
              <option value="">— Seleccionar —</option>
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
          </div>
          @if (editando) {
            <div class="fg">
              <label class="lbl">Estado</label>
              <select class="fc" [(ngModel)]="form.activo">
                <option [ngValue]="true">Activo</option>
                <option [ngValue]="false">Inactivo</option>
              </select>
            </div>
          }
        </div>
        @if (form.rol === 'medico') {
          <div class="fr2">
            <div class="fg"><label class="lbl">Especialidad</label>
              <input class="fc" [(ngModel)]="form.especialidad" placeholder="Medicina General"></div>
            <div class="fg"><label class="lbl">Cédula profesional</label>
              <input class="fc" [(ngModel)]="form.cedula" placeholder="0000000"></div>
          </div>
        }
        @if (errorModal) {
          <p style="color:var(--danger);font-size:.85rem;margin-top:4px">{{ errorModal }}</p>
        }
      </div>
      <div class="m-foot">
        <button class="btn btn-secondary" type="button" (click)="modal=false">Cancelar</button>
        <button class="btn btn-primary" type="button" (click)="guardar()" [disabled]="guardando">
          {{ guardando ? 'Guardando…' : (editando ? 'Actualizar' : 'Crear usuario') }}
        </button>
      </div>
    </div>
  </div>
}

<!-- Modal reset password -->
@if (modalReset) {
  <div class="backdrop" (click)="closeOnBackdrop($event)">
    <div class="modal" style="max-width:420px">
      <div class="m-head">
        <h3>Restablecer contraseña</h3>
        <button class="close-btn" type="button" (click)="modalReset=false">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="m-body">
        <p class="sm muted" style="margin-bottom:14px">Restableciendo contraseña de <strong>{{ usuarioSeleccionado?.nombreCompleto }}</strong></p>
        <div class="fg"><label class="lbl">Nueva contraseña <span class="req">*</span></label>
          <input type="password" class="fc" [(ngModel)]="nuevaPassword" placeholder="Mínimo 8 caracteres"></div>
        @if (errorModal) { <p style="color:var(--danger);font-size:.85rem">{{ errorModal }}</p> }
      </div>
      <div class="m-foot">
        <button class="btn btn-secondary" type="button" (click)="modalReset=false">Cancelar</button>
        <button class="btn btn-primary" type="button" (click)="guardarReset()" [disabled]="guardando">
          {{ guardando ? 'Guardando…' : 'Restablecer' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioAdminDTO[] = [];
  total = 0; page = 1; pageSize = 20; totalPaginas = 1;
  cargando = true; guardando = false;
  q = ''; fRol = ''; fActivo = '';
  modal = false; modalReset = false; editando = false;
  errorModal = ''; nuevaPassword = '';
  usuarioSeleccionado?: UsuarioAdminDTO;

  form: UsuarioCreateDTO & { activo: boolean } = {
    nombre: '', apellidos: '', email: '', password: '', rol: '',
    especialidad: null, cedula: null, activo: true,
  };

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.buscar(); }

  buscar() {
    this.cargando = true;
    const activo = this.fActivo === '' ? undefined : this.fActivo === 'true';
    this.api.getUsuarios({ q: this.q || undefined, rol: this.fRol || undefined, activo, page: this.page, pageSize: this.pageSize })
      .subscribe({
        next: r => { this.usuarios = r.items; this.total = r.totalCount; this.totalPaginas = r.totalPages; this.cargando = false; },
        error: () => this.cargando = false,
      });
  }

  irPagina(p: number) { this.page = p; this.buscar(); }

  abrirCrear() {
    this.editando = false; this.errorModal = '';
    this.form = { nombre: '', apellidos: '', email: '', password: '', rol: '', especialidad: null, cedula: null, activo: true };
    this.modal = true;
  }

  abrirEditar(u: UsuarioAdminDTO) {
    this.editando = true; this.errorModal = '';
    this.usuarioSeleccionado = u;
    this.form = { nombre: u.nombre, apellidos: u.apellidos, email: u.email, password: '', rol: u.rol, especialidad: u.especialidad, cedula: u.cedula, activo: u.activo };
    this.modal = true;
  }

  abrirReset(u: UsuarioAdminDTO) {
    this.usuarioSeleccionado = u; this.nuevaPassword = ''; this.errorModal = '';
    this.modalReset = true;
  }

  onRolChange() {
    if (this.form.rol !== 'medico') { this.form.especialidad = null; this.form.cedula = null; }
  }

  guardar() {
    if (!this.form.nombre || !this.form.apellidos || !this.form.email || !this.form.rol) {
      this.errorModal = 'Completa los campos obligatorios'; return;
    }
    this.guardando = true; this.errorModal = '';
    if (this.editando && this.usuarioSeleccionado) {
      const dto: UsuarioUpdateDTO = { ...this.form };
      this.api.updateUsuario(this.usuarioSeleccionado.id, dto).subscribe({
        next: () => { this.modal = false; this.guardando = false; this.buscar(); },
        error: (e) => { this.errorModal = e?.error?.message ?? 'Error al actualizar'; this.guardando = false; },
      });
    } else {
      this.api.createUsuario(this.form).subscribe({
        next: () => { this.modal = false; this.guardando = false; this.buscar(); },
        error: (e) => { this.errorModal = e?.error?.message ?? 'Error al crear usuario'; this.guardando = false; },
      });
    }
  }

  guardarReset() {
    if (this.nuevaPassword.length < 8) { this.errorModal = 'Mínimo 8 caracteres'; return; }
    this.guardando = true; this.errorModal = '';
    this.api.resetPassword(this.usuarioSeleccionado!.id, { nuevaPassword: this.nuevaPassword }).subscribe({
      next: () => { this.modalReset = false; this.guardando = false; },
      error: (e) => { this.errorModal = e?.error?.message ?? 'Error al restablecer'; this.guardando = false; },
    });
  }

  toggleActivo(u: UsuarioAdminDTO) {
    const obs = u.activo ? this.api.desactivarUsuario(u.id) : this.api.activarUsuario(u.id);
    obs.subscribe({ next: updated => { u.activo = updated.activo; } });
  }

  closeOnBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('backdrop')) { this.modal = false; this.modalReset = false; }
  }

  badgeRol(r: string) { return { admin: 'b-red', medico: 'b-blue', recepcionista: 'b-amber' }[r] ?? 'b-gray'; }
  labelRol(r: string) { return { admin: 'Admin', medico: 'Médico', recepcionista: 'Recepcionista' }[r] ?? r; }
  formatFecha(iso: string) { return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }); }
}
