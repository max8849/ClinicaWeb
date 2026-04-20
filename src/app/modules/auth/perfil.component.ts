import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioAdminDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page fade-in" style="max-width:600px">

  <div class="ph">
    <div><h1>Mi perfil</h1><p>Información de tu cuenta</p></div>
  </div>

  @if (perfil) {
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div class="av av-lg av-blue" style="font-size:1.2rem">{{ iniciales }}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:600">{{ perfil.nombreCompleto }}</div>
          <div class="sm muted">{{ perfil.email }}</div>
          <span class="badge" [ngClass]="badgeRol(perfil.rol)" style="margin-top:4px">{{ labelRol(perfil.rol) }}</span>
        </div>
      </div>
      <div class="sec">Datos</div>
      <div class="ir"><span class="irl">Especialidad</span><span class="irv">{{ perfil.especialidad || '—' }}</span></div>
      <div class="ir"><span class="irl">Cédula</span><span class="irv">{{ perfil.cedula || '—' }}</span></div>
      <div class="ir"><span class="irl">Estado</span><span class="irv"><span class="badge b-green">Activo</span></span></div>
      <div class="ir"><span class="irl">Registrado</span><span class="irv">{{ formatFecha(perfil.createdAt) }}</span></div>
    </div>

    <div class="card">
      <div class="sec">Cambiar contraseña</div>
      <div class="fg"><label class="lbl">Contraseña actual</label>
        <input type="password" class="fc" [(ngModel)]="pwd.passwordActual" placeholder="Tu contraseña actual"></div>
      <div class="fg"><label class="lbl">Nueva contraseña</label>
        <input type="password" class="fc" [(ngModel)]="pwd.nuevaPassword" placeholder="Mínimo 8 caracteres"></div>
      @if (msgPwd) {
        <p [style.color]="errorPwd ? 'var(--danger)' : 'var(--success)'" style="font-size:.85rem;margin-bottom:8px">{{ msgPwd }}</p>
      }
      <button class="btn btn-primary" type="button" (click)="cambiarPassword()" [disabled]="guardando">
        {{ guardando ? 'Guardando…' : 'Actualizar contraseña' }}
      </button>
    </div>
  }
</div>
  `,
})
export class PerfilComponent implements OnInit {
  perfil?: UsuarioAdminDTO;
  pwd = { passwordActual: '', nuevaPassword: '' };
  guardando = false; errorPwd = false; msgPwd = '';

  get iniciales() {
    const p = (this.perfil?.nombreCompleto ?? '').trim().split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || 'U';
  }

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.api.getMe().subscribe({ next: p => this.perfil = p });
  }

  cambiarPassword() {
    if (!this.pwd.passwordActual || this.pwd.nuevaPassword.length < 8) {
      this.errorPwd = true; this.msgPwd = 'Completa ambos campos (mínimo 8 caracteres)'; return;
    }
    this.guardando = true; this.msgPwd = '';
    this.api.cambiarPasswordPropia(this.pwd).subscribe({
      next: () => {
        this.errorPwd = false; this.msgPwd = 'Contraseña actualizada correctamente';
        this.pwd = { passwordActual: '', nuevaPassword: '' }; this.guardando = false;
      },
      error: (e) => {
        this.errorPwd = true; this.msgPwd = e?.error?.message ?? 'Error al actualizar'; this.guardando = false;
      },
    });
  }

  badgeRol(r: string) { return { admin:'b-red', medico:'b-blue', recepcionista:'b-amber' }[r] ?? 'b-gray'; }
  labelRol(r: string) { return { admin:'Administrador', medico:'Médico', recepcionista:'Recepcionista' }[r] ?? r; }
  formatFecha(iso: string) { return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' }); }
}
