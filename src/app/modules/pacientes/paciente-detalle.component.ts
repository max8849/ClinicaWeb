import { Component, OnInit }              from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { RouterModule, ActivatedRoute }    from '@angular/router';
import { ApiService }                      from '../../core/services/api.service';
import { PacienteDetalleDTO, CitaDTO }     from '../../core/models/api.models';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
@if (cargando) {
  <div class="page"><div class="empty" style="margin-top:80px"><div class="sm muted">Cargando…</div></div></div>
} @else if (p) {
<div class="page fade-in">

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:22px">
    <a class="btn btn-ghost btn-sm btn-icon" routerLink="/pacientes">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </a>
    <div class="av av-lg" [class.av-blue]="p.sexo === 'F'" [class.av-green]="p.sexo === 'M'">
      {{ p.nombre[0] }}{{ p.apellidoPaterno[0] }}
    </div>
    <div style="flex:1">
      <h1 style="font-size:1.2rem">{{ p.nombre }} {{ p.apellidoPaterno }} {{ p.apellidoMaterno }}</h1>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:3px">
        <span class="chip">{{ p.folio }}</span>
        <span class="sm muted">{{ p.edad }} años · {{ p.sexo === 'F' ? 'Femenino' : 'Masculino' }}</span>
        <span class="sm muted">{{ p.totalConsultas }} consultas</span>
        @if (tieneAlergia) { <span class="badge b-red">⚠ {{ p.alergias }}</span> }
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <a class="btn btn-secondary btn-sm" routerLink="/citas">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Nueva cita
      </a>
      <a class="btn btn-primary btn-sm" [routerLink]="['/expediente', p.id]">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Ver expediente
      </a>
    </div>
  </div>

  <div class="g2" style="gap:18px;align-items:start">

    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="sec">Identificación</div>
        <div class="ir"><span class="irl">Folio</span><span class="irv"><span class="chip">{{ p.folio }}</span></span></div>
        <div class="ir"><span class="irl">Nacimiento</span><span class="irv">{{ formatFecha(p.fechaNacimiento) }}</span></div>
        <div class="ir"><span class="irl">Edad</span><span class="irv">{{ p.edad }} años</span></div>
        <div class="ir"><span class="irl">Sexo</span><span class="irv">{{ p.sexo === 'F' ? 'Femenino' : 'Masculino' }}</span></div>
        @if (p.curp) {
          <div class="ir"><span class="irl">CURP</span><span class="irv mono xs">{{ p.curp }}</span></div>
        }
        @if (p.grupoSanguineo) {
          <div class="ir"><span class="irl">Grupo sang.</span><span class="irv"><span class="badge b-red">{{ p.grupoSanguineo }}</span></span></div>
        }
      </div>

      <div class="card">
        <div class="sec">Contacto</div>
        <div class="ir"><span class="irl">Teléfono</span><span class="irv">{{ p.telefono }}</span></div>
        @if (p.email) { <div class="ir"><span class="irl">Email</span><span class="irv xs" style="word-break:break-all">{{ p.email }}</span></div> }
        @if (p.domicilio) { <div class="ir"><span class="irl">Domicilio</span><span class="irv sm">{{ p.domicilio }}</span></div> }
        @if (p.colonia) { <div class="ir"><span class="irl">Colonia</span><span class="irv sm">{{ p.colonia }}</span></div> }
        @if (p.ciudad) { <div class="ir"><span class="irl">Ciudad</span><span class="irv sm">{{ p.ciudad }}</span></div> }
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="sec">Antecedentes clínicos</div>
        @if (p.alergias) {
          <div class="mb-2">
            <div class="ilbl">Alergias</div>
            <p [style.color]="tieneAlergia ? 'var(--danger)' : 'var(--g400)'" style="font-size:.875rem;font-weight:500;margin-top:3px">{{ p.alergias }}</p>
          </div>
        }
        @if (p.antecedentesHF) {
          <div class="mb-2"><div class="ilbl">Hereditarios / familiares</div><p class="sm" style="margin-top:3px;line-height:1.55">{{ p.antecedentesHF }}</p></div>
        }
        @if (p.antecedentesNP) {
          <div class="mb-2"><div class="ilbl">No patológicos</div><p class="sm" style="margin-top:3px;line-height:1.55">{{ p.antecedentesNP }}</p></div>
        }
        @if (p.antecedentesPatologicos) {
          <div><div class="ilbl">Patológicos</div><p class="sm" style="margin-top:3px;line-height:1.55">{{ p.antecedentesPatologicos }}</p></div>
        }
      </div>

      <div class="card0">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border)">
          <h3 style="font-size:.9rem;font-weight:600">Historial de citas</h3>
          <a class="btn btn-ghost btn-sm" routerLink="/citas">Ver agenda</a>
        </div>
        @for (c of citas; track c.id) {
          <div style="display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid var(--border)">
            <div style="flex:1">
              <div class="sm" style="font-weight:500;color:var(--g800)">{{ c.motivo }}</div>
              <div class="xs muted">{{ formatFecha(c.fecha) }} {{ c.hora }} · {{ c.medicoNombre }}</div>
            </div>
            <span class="badge" [ngClass]="badgeEstado(c.estado)">{{ labelEstado(c.estado) }}</span>
          </div>
        }
        @if (!cargandoCitas && citas.length === 0) {
          <div style="padding:20px;text-align:center;color:var(--g400);font-size:.875rem">Sin historial</div>
        }
      </div>
    </div>

  </div>
</div>
} @else {
  <div class="page">
    <div class="empty" style="margin-top:80px">
      <div class="empty-ico"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <h3>Paciente no encontrado</h3>
      <a class="btn btn-primary btn-sm mt-2" routerLink="/pacientes">Ir a pacientes</a>
    </div>
  </div>
}
  `,
})
export class PacienteDetalleComponent implements OnInit {
  p?:            PacienteDetalleDTO;
  citas:         CitaDTO[] = [];
  cargando       = true;
  cargandoCitas  = true;

  get tieneAlergia(): boolean {
    const a = this.p?.alergias ?? '';
    return !!a && a !== 'Ninguna' && a !== 'Ninguna conocida';
  }

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.api.getPaciente(id).subscribe({
      next: p => { this.p = p; this.cargando = false; },
      error: () => this.cargando = false,
    });
    this.api.getCitasByPaciente(id).subscribe({
      next: cs => { this.citas = cs.slice(0, 8); this.cargandoCitas = false; },
      error: () => this.cargandoCitas = false,
    });
  }

  formatFecha(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
  }

  badgeEstado(e: string): string {
    const m: Record<string,string> = { programada:'b-gray', confirmada:'b-blue', en_curso:'b-teal', completada:'b-green', cancelada:'b-red', no_asistio:'b-amber' };
    return m[e] ?? 'b-gray';
  }

  labelEstado(e: string): string {
    const m: Record<string,string> = { programada:'Programada', confirmada:'Confirmada', en_curso:'En curso', completada:'Completada', cancelada:'Cancelada', no_asistio:'No asistió' };
    return m[e] ?? e;
  }
}
