import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { ApiService }        from '../../core/services/api.service';
import { DashboardStats, CitaDTO, UsuarioDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .cita-row { transition: background .1s; }
    .cita-row:hover { background: var(--g50) !important; }
    .qa:hover { border-color: var(--primary) !important; color: var(--primary) !important; }
    @keyframes pulse { from { opacity:.4 } to { opacity:.7 } }
  `],
  template: `
<div class="page fade-in">

  <div class="ph">
    <div>
      <h1>Panel general</h1>
      <p>{{ fechaHoy }}</p>
    </div>
    <div class="ph-actions">
      <a class="btn btn-primary" routerLink="/citas">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva cita
      </a>
    </div>
  </div>

  <!-- KPIs -->
  <div class="g4 mb-3">
    <div class="stat-card">
      <div class="st-icon" style="background:var(--primary-lt);color:var(--primary)">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <div class="st-lbl">Citas hoy</div>
      <div class="st-val">{{ cargando ? '…' : (stats?.citasHoy ?? 0) }}</div>
      <div class="st-sub">{{ stats?.confirmadas ?? 0 }} confirmadas</div>
    </div>
    <div class="stat-card">
      <div class="st-icon" style="background:var(--accent-lt);color:#0A7A64">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <div class="st-lbl">Pacientes</div>
      <div class="st-val">{{ cargando ? '…' : (stats?.totalPacientes ?? 0) }}</div>
      <div class="st-sub">registrados</div>
    </div>
    <div class="stat-card">
      <div class="st-icon" style="background:var(--warning-lt);color:var(--warning)">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="st-lbl">Pendientes</div>
      <div class="st-val">{{ cargando ? '…' : (stats?.pendientes ?? 0) }}</div>
      <div class="st-sub">sin confirmar hoy</div>
    </div>
    <div class="stat-card">
      <div class="st-icon" style="background:var(--success-lt);color:var(--success)">
        <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <div class="st-lbl">Completadas</div>
      <div class="st-val">{{ cargando ? '…' : (stats?.completadasMes ?? 0) }}</div>
      <div class="st-sub">este mes</div>
    </div>
  </div>

  <!-- Grid -->
  <div class="g2" style="gap:18px">

    <!-- Citas del día -->
    <div class="card0">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">
        <h3 style="font-size:.95rem;font-weight:600">Citas de hoy</h3>
        <a class="btn btn-ghost btn-sm" routerLink="/citas">Ver todas</a>
      </div>

      @if (cargandoCitas) {
        <div class="empty" style="padding:36px"><div class="sm muted">Cargando citas…</div></div>
      }

      @for (c of citasHoy; track c.id) {
        <a class="cita-row" [routerLink]="['/pacientes', c.pacienteId]"
           style="display:flex;align-items:center;gap:12px;padding:13px 20px;border-bottom:1px solid var(--border);text-decoration:none;cursor:pointer">
          <div class="av av-md av-blue">{{ iniciales(c.pacienteNombre) }}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.875rem;font-weight:500;color:var(--g800);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ c.pacienteNombre }}
            </div>
            <div class="sm muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ c.motivo }}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:.875rem;font-weight:600;color:var(--g700)">{{ c.hora }}</div>
            <span class="badge" [ngClass]="badgeEstado(c.estado)">{{ labelEstado(c.estado) }}</span>
          </div>
        </a>
      }

      @if (!cargandoCitas && citasHoy.length === 0) {
        <div class="empty" style="padding:36px">
          <div class="empty-ico"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <h3>Sin citas hoy</h3>
        </div>
      }
    </div>

    <!-- Columna derecha -->
    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- Médicos -->
      <div class="card">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:14px">Médicos en turno</h3>
        @for (m of medicos; track m.id) {
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
            <div class="av av-md av-blue">{{ iniciales(m.nombreCompleto) }}</div>
            <div style="flex:1">
              <div style="font-size:.875rem;font-weight:500;color:var(--g800)">Dr. {{ m.nombreCompleto }}</div>
              <div class="sm muted">{{ m.especialidad }}</div>
            </div>
            <span class="badge b-green">Activo</span>
          </div>
        }
        @if (!cargando && medicos.length === 0) {
          <div class="sm muted">Sin médicos disponibles</div>
        }
      </div>

      <!-- Accesos rápidos -->
      <div class="card">
        <h3 style="font-size:.95rem;font-weight:600;margin-bottom:12px">Acceso rápido</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <a routerLink="/pacientes" class="qa"
             style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 8px;border:1px solid var(--border);border-radius:var(--r);background:var(--white);cursor:pointer;text-decoration:none;transition:all .15s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>
            <span class="xs" style="color:var(--g600);font-weight:500">Nuevo paciente</span>
          </a>
          <a routerLink="/citas" class="qa"
             style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 8px;border:1px solid var(--border);border-radius:var(--r);background:var(--white);cursor:pointer;text-decoration:none;transition:all .15s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="xs" style="color:var(--g600);font-weight:500">Nueva cita</span>
          </a>
          <a routerLink="/pacientes" class="qa"
             style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 8px;border:1px solid var(--border);border-radius:var(--r);background:var(--white);cursor:pointer;text-decoration:none;transition:all .15s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
            <span class="xs" style="color:var(--g600);font-weight:500">Expedientes</span>
          </a>
          <a routerLink="/citas" class="qa"
             style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 8px;border:1px solid var(--border);border-radius:var(--r);background:var(--white);cursor:pointer;text-decoration:none;transition:all .15s">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.75"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span class="xs" style="color:var(--g600);font-weight:500">Agenda del día</span>
          </a>
        </div>
      </div>

    </div>
  </div>
</div>
  `,
})
export class DashboardComponent implements OnInit {
  stats:        DashboardStats | null = null;
  citasHoy:     CitaDTO[] = [];
  medicos:      UsuarioDTO[] = [];
  cargando      = true;
  cargandoCitas = true;
  fechaHoy      = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.fechaHoy = new Date().toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    this.api.getDashboardStats().subscribe({
      next:  s  => { this.stats = s; this.cargando = false; },
      error: () => this.cargando = false,
    });

    const hoy = new Date().toISOString().split('T')[0];
    this.api.getCitas({ fecha: hoy, pageSize: 50 }).subscribe({
      next:  r  => { this.citasHoy = r.items; this.cargandoCitas = false; },
      error: () => this.cargandoCitas = false,
    });

    this.api.getMedicos().subscribe({ next: ms => this.medicos = ms });
  }

  iniciales(nombre: string): string {
    const p = nombre.trim().split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }

  badgeEstado(e: string): string {
    const m: Record<string, string> = { programada:'b-gray', confirmada:'b-blue', en_curso:'b-teal', completada:'b-green', cancelada:'b-red', no_asistio:'b-amber' };
    return m[e] ?? 'b-gray';
  }

  labelEstado(e: string): string {
    const m: Record<string, string> = { programada:'Programada', confirmada:'Confirmada', en_curso:'En curso', completada:'Completada', cancelada:'Cancelada', no_asistio:'No asistió' };
    return m[e] ?? e;
  }
}
