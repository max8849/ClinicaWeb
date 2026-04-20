import { Component, OnInit }            from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule }                  from '@angular/router';
import { FormsModule }                   from '@angular/forms';
import { ApiService }                    from '../../core/services/api.service';
import { CitaDTO, CitaCreateDTO, PacienteListDTO, UsuarioDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    .slot-row { display:flex; min-height:52px; border-bottom:1px solid var(--border); }
    .slot-event:hover { background:#dbeafe !important; }
  `],
  template: `
<div class="page fade-in">

  <div class="ph">
    <div>
      <h1>Agenda de citas</h1>
      <p>{{ total }} citas encontradas</p>
    </div>
    <div class="ph-actions">
      <div class="tab-group">
        <button class="tab-btn" [class.on]="vista === 'lista'" (click)="vista = 'lista'" type="button">Lista</button>
        <button class="tab-btn" [class.on]="vista === 'dia'"   (click)="vista = 'dia'"   type="button">Día</button>
      </div>
      <button class="btn btn-primary" type="button" (click)="abrirModal()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva cita
      </button>
    </div>
  </div>

  <!-- Filtros -->
  <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
    <div class="search" style="flex:1;max-width:300px">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="fc" placeholder="Buscar paciente…" [(ngModel)]="q" (ngModelChange)="buscar()">
    </div>
    <input type="date" class="fc" style="width:170px" [(ngModel)]="fFecha" (ngModelChange)="buscar()">
    <select class="fc" style="width:170px" [(ngModel)]="fEstado" (ngModelChange)="buscar()">
      <option value="">Todos los estados</option>
      <option value="programada">Programada</option>
      <option value="confirmada">Confirmada</option>
      <option value="en_curso">En curso</option>
      <option value="completada">Completada</option>
      <option value="cancelada">Cancelada</option>
      <option value="no_asistio">No asistió</option>
    </select>
    <select class="fc" style="width:200px" [(ngModel)]="fMedico" (ngModelChange)="buscar()">
      <option value="0">Todos los médicos</option>
      @for (m of medicos; track m.id) {
        <option [value]="m.id">Dr. {{ m.nombreCompleto }}</option>
      }
    </select>
    @if (q || fFecha || fEstado || fMedico !== '0') {
      <button class="btn btn-ghost btn-sm" type="button" (click)="limpiar()">Limpiar</button>
    }
  </div>

  @if (cargando) {
    <div class="empty" style="padding:60px"><div class="sm muted">Cargando citas…</div></div>
  }

  <!-- Vista lista -->
  @if (!cargando && vista === 'lista') {
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Folio</th><th>Paciente</th><th>Médico</th><th>Fecha</th>
            <th>Hora</th><th>Tipo</th><th>Motivo</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of citas; track c.id) {
            <tr>
              <td><span class="chip">{{ c.folio }}</span></td>
              <td>
                <a [routerLink]="['/pacientes', c.pacienteId]" style="font-weight:500;color:var(--primary);text-decoration:none">
                  {{ c.pacienteNombre }}
                </a>
              </td>
              <td class="sm">{{ c.medicoNombre }}</td>
              <td class="sm">{{ formatFecha(c.fecha) }}</td>
              <td style="font-weight:600;color:var(--g700)">{{ c.hora }}</td>
              <td><span class="badge" [ngClass]="badgeTipo(c.tipo)">{{ labelTipo(c.tipo) }}</span></td>
              <td class="sm muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.motivo }}</td>
              <td><span class="badge" [ngClass]="badgeEstado(c.estado)">{{ labelEstado(c.estado) }}</span></td>
              <td>
                <div style="display:flex;gap:4px">
                  @if (c.estado === 'programada') {
                    <button class="btn btn-ghost btn-sm btn-icon" title="Confirmar" type="button" (click)="cambiarEstado(c, 'confirmada')">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  }
                  @if (c.estado === 'confirmada' || c.estado === 'en_curso') {
                    <button class="btn btn-ghost btn-sm" type="button" (click)="cambiarEstado(c, 'completada')" style="font-size:.75rem;color:var(--success)">Completar</button>
                  }
                  @if (c.estado === 'programada' || c.estado === 'confirmada') {
                    <button class="btn btn-ghost btn-sm btn-icon" title="Cancelar" type="button" (click)="cambiarEstado(c, 'cancelada')">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--danger)" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
          @empty {
            <tr><td colspan="9">
              <div class="empty">
                <div class="empty-ico"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <h3>Sin citas</h3>
              </div>
            </td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    @if (totalPaginas > 1) {
      <div style="display:flex;justify-content:center;gap:8px;margin-top:18px">
        <button class="btn btn-ghost btn-sm" [disabled]="page === 1" (click)="irPagina(page - 1)" type="button">← Anterior</button>
        <span class="sm muted" style="padding:6px 12px">Pág. {{ page }} / {{ totalPaginas }}</span>
        <button class="btn btn-ghost btn-sm" [disabled]="page === totalPaginas" (click)="irPagina(page + 1)" type="button">Siguiente →</button>
      </div>
    }
  }

  <!-- Vista día -->
  @if (!cargando && vista === 'dia') {
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <button class="btn btn-ghost btn-sm btn-icon" type="button" (click)="cambiarDia(-1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span style="font-weight:600;font-size:.9rem">{{ formatFecha(diaActual) }}</span>
      <button class="btn btn-ghost btn-sm btn-icon" type="button" (click)="cambiarDia(1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="btn btn-ghost btn-sm" type="button" (click)="irHoy()">Hoy</button>
    </div>
    <div class="card0">
      <div style="display:grid;grid-template-columns:70px 1fr">
        @for (slot of slots; track slot) {
          <div class="slot-row">
            <div style="padding:0 10px;width:70px;border-right:1px solid var(--border);display:flex;align-items:center;color:var(--g400);font-size:.75rem;font-weight:500">
              {{ slot }}
            </div>
            @if (slotCita(slot); as c) {
              <div class="slot-event" [routerLink]="['/pacientes', c.pacienteId]"
                   style="margin:4px;flex:1;padding:6px 10px;border-radius:6px;background:#dbeafe;cursor:pointer;border-left:3px solid var(--primary)">
                <div style="font-size:.8rem;font-weight:600;color:var(--primary)">{{ c.pacienteNombre }}</div>
                <div class="xs muted">{{ c.motivo }}</div>
              </div>
            } @else {
              <div style="flex:1"></div>
            }
          </div>
        }
      </div>
    </div>
  }

</div>

@if (modal) {
  <div class="backdrop" (click)="closeOnBackdrop($event)">
    <div class="modal">
      <div class="m-head">
        <h3>Agendar cita</h3>
        <button class="close-btn" type="button" (click)="modal = false">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="m-body">
        <div class="fg">
          <label class="lbl">Paciente <span class="req">*</span></label>
          <select class="fc" [(ngModel)]="nueva.pacienteId">
            <option [ngValue]="0">— Seleccionar —</option>
            @for (p of pacientes; track p.id) {
              <option [ngValue]="p.id">{{ p.nombre }} {{ p.apellidoPaterno }} {{ p.apellidoMaterno }}</option>
            }
          </select>
        </div>
        <div class="fg">
          <label class="lbl">Médico <span class="req">*</span></label>
          <select class="fc" [(ngModel)]="nueva.medicoId">
            <option [ngValue]="0">— Seleccionar —</option>
            @for (m of medicos; track m.id) {
              <option [ngValue]="m.id">Dr. {{ m.nombreCompleto }} — {{ m.especialidad }}</option>
            }
          </select>
        </div>
        <div class="fr2">
          <div class="fg">
            <label class="lbl">Fecha <span class="req">*</span></label>
            <input type="date" class="fc" [(ngModel)]="nueva.fecha">
          </div>
          <div class="fg">
            <label class="lbl">Hora <span class="req">*</span></label>
            <select class="fc" [(ngModel)]="nueva.hora">
              @for (h of slots; track h) { <option [value]="h">{{ h }}</option> }
            </select>
          </div>
        </div>
        <div class="fr2">
          <div class="fg">
            <label class="lbl">Tipo</label>
            <select class="fc" [(ngModel)]="nueva.tipo">
              <option value="consulta">Consulta</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="urgencia">Urgencia</option>
              <option value="procedimiento">Procedimiento</option>
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Duración</label>
            <select class="fc" [(ngModel)]="nueva.duracionMin">
              <option [ngValue]="20">20 min</option>
              <option [ngValue]="30">30 min</option>
              <option [ngValue]="45">45 min</option>
              <option [ngValue]="60">60 min</option>
            </select>
          </div>
        </div>
        <div class="fg">
          <label class="lbl">Motivo <span class="req">*</span></label>
          <input class="fc" [(ngModel)]="nueva.motivo" placeholder="Motivo de la consulta…">
        </div>
        @if (errorModal) {
          <p style="color:var(--danger);font-size:.85rem;margin-top:8px">{{ errorModal }}</p>
        }
      </div>
      <div class="m-foot">
        <button class="btn btn-secondary" type="button" (click)="modal = false">Cancelar</button>
        <button class="btn btn-primary" type="button" (click)="guardar()" [disabled]="!valida() || guardando">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          {{ guardando ? 'Agendando…' : 'Agendar' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class CitasComponent implements OnInit {
  vista: 'lista' | 'dia' = 'lista';
  citas:     CitaDTO[] = [];
  medicos:   UsuarioDTO[] = [];
  pacientes: PacienteListDTO[] = [];
  total       = 0;
  page        = 1;
  pageSize    = 20;
  totalPaginas = 1;
  cargando    = true;
  guardando   = false;
  errorModal  = '';

  diaActual   = '';
  slots:      string[] = [];
  q           = '';
  fFecha      = '';
  fEstado     = '';
  fMedico     = '0';
  modal       = false;

  nueva: CitaCreateDTO = { pacienteId: 0, medicoId: 0, fecha: '', hora: '09:00', duracionMin: 30, motivo: '', tipo: 'consulta' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.diaActual = new Date().toISOString().split('T')[0];
    this.fFecha    = this.diaActual;
    for (let h = 8; h <= 19; h++) {
      this.slots.push(`${String(h).padStart(2,'0')}:00`);
      this.slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    this.buscar();
    this.api.getMedicos().subscribe({ next: ms => this.medicos = ms });
    this.api.getPacientes({ pageSize: 200 }).subscribe({ next: r => this.pacientes = r.items });
  }

  buscar(): void {
    this.cargando = true;
    this.api.getCitas({
      q:       this.q || undefined,
      fecha:   this.fFecha || undefined,
      estado:  this.fEstado || undefined,
      medicoId: this.fMedico !== '0' ? +this.fMedico : undefined,
      page:    this.page,
      pageSize: this.pageSize,
    }).subscribe({
      next: r => {
        this.citas        = r.items;
        this.total        = r.totalCount;
        this.totalPaginas = r.totalPages;
        this.cargando     = false;
      },
      error: () => this.cargando = false,
    });
  }

  limpiar(): void { this.q = ''; this.fFecha = ''; this.fEstado = ''; this.fMedico = '0'; this.page = 1; this.buscar(); }

  irPagina(p: number): void { this.page = p; this.buscar(); }

  irHoy(): void { this.diaActual = new Date().toISOString().split('T')[0]; }

  cambiarDia(d: number): void {
    const dt = new Date(this.diaActual + 'T12:00:00');
    dt.setDate(dt.getDate() + d);
    this.diaActual = dt.toISOString().split('T')[0];
  }

  slotCita(slot: string): CitaDTO | undefined {
    return this.citas.find(c => c.fecha === this.diaActual && c.hora === slot);
  }

  cambiarEstado(c: CitaDTO, estado: string): void {
    this.api.updateCitaEstado(c.id, estado).subscribe({
      next: updated => { c.estado = updated.estado; },
    });
  }

  abrirModal(): void {
    this.nueva      = { pacienteId: 0, medicoId: 0, fecha: this.diaActual, hora: '09:00', duracionMin: 30, motivo: '', tipo: 'consulta' };
    this.errorModal = '';
    this.modal      = true;
  }

  valida(): boolean {
    return this.nueva.pacienteId > 0 && this.nueva.medicoId > 0
        && !!this.nueva.fecha && !!this.nueva.hora && !!this.nueva.motivo;
  }

  guardar(): void {
    if (!this.valida() || this.guardando) return;
    this.guardando  = true;
    this.errorModal = '';
    this.api.createCita(this.nueva).subscribe({
      next: () => { this.modal = false; this.guardando = false; this.buscar(); },
      error: (e) => {
        this.errorModal = e?.error?.message ?? 'Error al agendar la cita';
        this.guardando  = false;
      },
    });
  }

  closeOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('backdrop')) this.modal = false;
  }

  formatFecha(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
  }

  badgeTipo(t: string): string {
    const m: Record<string,string> = { consulta:'b-blue', seguimiento:'b-teal', urgencia:'b-red', procedimiento:'b-amber' };
    return m[t] ?? 'b-gray';
  }
  labelTipo(t: string): string {
    const m: Record<string,string> = { consulta:'Consulta', seguimiento:'Seguimiento', urgencia:'Urgencia', procedimiento:'Procedimiento' };
    return m[t] ?? t;
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
