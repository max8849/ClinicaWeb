import { Component, OnInit }            from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule }                  from '@angular/router';
import { FormsModule }                   from '@angular/forms';
import { ApiService }                    from '../../core/services/api.service';
import { ToastService }                  from '../../core/services/toast.service';
import { CitaDTO, CitaCreateDTO, PacienteListDTO, UsuarioDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    .slot-row { display:flex; min-height:52px; border-bottom:1px solid var(--border); }
    /* ── Vista día grid ── */
    .dia-wrap { overflow-x:auto; border:1px solid var(--border); border-radius:var(--rl); background:var(--white); }
    .dia-grid { display:grid; min-width:600px; }
    .dia-head-cell {
      padding:10px 12px; font-size:.75rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.06em; color:var(--g500); background:#f8fafc;
      border-bottom:2px solid var(--border); border-right:1px solid var(--border);
      text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .dia-head-cell:last-child { border-right:none; }
    .dia-time-cell {
      padding:0 10px; font-size:.72rem; font-weight:600; color:var(--g400);
      border-bottom:1px solid var(--border); border-right:1px solid var(--border);
      display:flex; align-items:center; background:#fafafa;
      font-variant-numeric:tabular-nums; white-space:nowrap;
    }
    .dia-slot-cell {
      border-bottom:1px solid var(--border); border-right:1px solid var(--border);
      padding:3px; min-height:52px; position:relative;
    }
    .dia-slot-cell:last-child { border-right:none; }
    .cita-bloque {
      height:100%; border-radius:6px; padding:6px 9px; cursor:pointer;
      border-left:3px solid; text-decoration:none; display:block;
    }
    .cita-bloque:hover { filter:brightness(.94); }
    .cb-pac  { font-size:.8rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cb-sub  { font-size:.68rem; margin-top:1px; opacity:.75; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cb-badge { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-top:3px; }
    /* Estado colores */
    .est-programada  { background:#eff6ff; border-color:#3b82f6; color:#1d4ed8; }
    .est-confirmada  { background:#e0f2fe; border-color:#0369a1; color:#0369a1; }
    .est-en_curso    { background:#ccfbf1; border-color:#0d9488; color:#0f766e; animation:glowSlot .9s alternate infinite; }
    .est-completada  { background:#f0fdf4; border-color:#16a34a; color:#15803d; opacity:.65; }
    .est-cancelada   { background:#fef2f2; border-color:#ef4444; color:#b91c1c; opacity:.45; }
    .est-no_asistio  { background:#fffbeb; border-color:#d97706; color:#92400e; opacity:.5; }
    @keyframes glowSlot { from { box-shadow:0 0 0 rgba(13,148,136,0); } to { box-shadow:0 0 8px rgba(13,148,136,.4); } }
    .slot-event:hover { background:#dbeafe !important; }
    .sms-disabled { opacity:.5; cursor:not-allowed !important; position:relative; }
    .sms-disabled:hover::after {
      content:'Paquete no contratado';
      position:absolute; bottom:100%; left:50%; transform:translateX(-50%);
      background:var(--g800); color:white; font-size:.7rem; padding:4px 8px;
      border-radius:4px; white-space:nowrap; z-index:10;
    }
    .combo-wrap { position:relative; }
    .combo-drop {
      position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:300;
      background:var(--white); border:1px solid var(--border2); border-radius:var(--r);
      box-shadow:var(--shl); max-height:200px; overflow-y:auto;
    }
    .combo-item {
      padding:9px 12px; font-size:.875rem; cursor:pointer; color:var(--g800);
      border-bottom:1px solid var(--border);
    }
    .combo-item:last-child { border-bottom:none; }
    .combo-item:hover { background:var(--primary-lt); color:var(--primary); }
    .combo-item.sel { background:var(--primary-lt); font-weight:500; color:var(--primary); }
    .combo-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--g400); font-size:16px; line-height:1; padding:2px; }
    .combo-clear:hover { color:var(--g700); }
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
  <div class="filtros-row">
    <div class="search" style="flex:1;min-width:180px">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="fc" placeholder="Buscar paciente…" [(ngModel)]="q" (ngModelChange)="buscar()">
    </div>
    <input type="date" class="fc" style="min-width:140px;flex:1" [(ngModel)]="fFecha" (ngModelChange)="buscar()">
    <select class="fc" style="min-width:140px;flex:1" [(ngModel)]="fEstado" (ngModelChange)="buscar()">
      <option value="">Todos los estados</option>
      <option value="programada">Programada</option>
      <option value="confirmada">Confirmada</option>
      <option value="en_curso">En curso</option>
      <option value="completada">Completada</option>
      <option value="cancelada">Cancelada</option>
      <option value="no_asistio">No asistió</option>
    </select>
    <select class="fc" style="min-width:160px;flex:1" [(ngModel)]="fMedico" (ngModelChange)="buscar()">
      <option value="0">Todos los odontólogos</option>
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
            <th>Folio</th><th>Paciente</th><th>Odontólogo</th><th>Fecha</th>
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
                    <button class="btn btn-ghost btn-sm btn-icon" title="Confirmar asistencia" type="button" (click)="cambiarEstado(c, 'confirmada')">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  }
                  @if (c.estado === 'programada' || c.estado === 'confirmada') {
                    <button class="btn btn-ghost btn-sm" type="button" (click)="cambiarEstado(c, 'en_curso')"
                            style="font-size:.75rem;color:#0d9488;font-weight:600" title="Pasar a consulta">
                      En curso
                    </button>
                  }
                  @if (c.estado === 'en_curso') {
                    <button class="btn btn-ghost btn-sm" type="button" (click)="cambiarEstado(c, 'completada')"
                            style="font-size:.75rem;color:var(--success);font-weight:600">Completar</button>
                  }
                  @if (c.estado === 'programada' || c.estado === 'confirmada') {
                    <button class="btn btn-ghost btn-sm btn-icon" title="Cancelar" type="button" (click)="cambiarEstado(c, 'cancelada')">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--danger)" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  }
                  <!-- Botones SMS/WhatsApp deshabilitados -->
                  @if (c.estado === 'programada' || c.estado === 'confirmada') {
                    <button class="btn btn-ghost btn-sm btn-icon sms-disabled" title="Enviar recordatorio SMS (paquete no contratado)" type="button" disabled>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--g400)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </button>
                    <button class="btn btn-ghost btn-sm btn-icon sms-disabled" title="Enviar recordatorio WhatsApp (paquete no contratado)" type="button" disabled>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--g400)" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
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
  @if (vista === 'dia') {
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm btn-icon" type="button" (click)="cambiarDia(-1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span style="font-weight:600;font-size:.9rem">{{ formatFecha(diaActual) }}</span>
      <button class="btn btn-ghost btn-sm btn-icon" type="button" (click)="cambiarDia(1)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button class="btn btn-ghost btn-sm" type="button" (click)="irHoy()">Hoy</button>
      @if (cargandoDia) {
        <span class="sm muted">Cargando…</span>
      } @else {
        <span class="sm muted">{{ citasDia.length }} cita{{ citasDia.length !== 1 ? 's' : '' }}</span>
      }
    </div>

    @if (!cargandoDia) {
      @if (medicosDelDia.length === 0) {
        <div class="empty">
          <div class="empty-ico"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <h3>Sin citas para este día</h3>
        </div>
      } @else {
        <div class="dia-wrap">
          <!-- grid dinámico: 70px hora + 1fr por cada odontólogo -->
          <div class="dia-grid" [style.grid-template-columns]="diaGridCols">

            <!-- Cabecera -->
            <div class="dia-head-cell" style="background:#f0f9ff">Hora</div>
            @for (m of medicosDelDia; track m.medicoId) {
              <div class="dia-head-cell">
                <div style="color:var(--primary);font-weight:700">{{ m.medicoNombre }}</div>
                <div style="font-size:.65rem;color:var(--g400);font-weight:400;text-transform:none;letter-spacing:0">{{ m.especialidad }}</div>
              </div>
            }

            <!-- Filas por slot -->
            @for (slot of slots; track slot) {
              <div class="dia-time-cell">{{ slot }}</div>
              @for (m of medicosDelDia; track m.medicoId) {
                <div class="dia-slot-cell">
                  @if (slotCitaMedico(slot, m.medicoId); as c) {
                    <a class="cita-bloque" [ngClass]="'est-' + c.estado" [routerLink]="['/pacientes', c.pacienteId]">
                      <div class="cb-pac">{{ c.pacienteNombre }}</div>
                      <div class="cb-sub">{{ c.motivo || labelTipo(c.tipo) }}</div>
                      <div class="cb-badge">{{ labelEstado(c.estado) }}</div>
                    </a>
                  }
                </div>
              }
            }

          </div>
        </div>
      }
    }
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
        <!-- Combobox Paciente -->
        <div class="fg">
          <label class="lbl">Paciente <span class="req">*</span></label>
          <div class="combo-wrap">
            <input class="fc" [value]="pacienteLabel"
                   placeholder="Buscar por nombre o apellido…"
                   (input)="onPacienteInput($event)"
                   (focus)="showDropPac=true"
                   autocomplete="off">
            @if (nueva.pacienteId) {
              <button class="combo-clear" type="button" (click)="clearPaciente()">×</button>
            }
            @if (showDropPac && pacientesFiltrados.length > 0) {
              <div class="combo-drop">
                @for (p of pacientesFiltrados; track p.id) {
                  <div class="combo-item" [class.sel]="nueva.pacienteId === p.id"
                       (mousedown)="selectPaciente(p)">
                    {{ p.nombre }} {{ p.apellidoPaterno }} {{ p.apellidoMaterno }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
        <!-- Combobox Odontólogo -->
        <div class="fg">
          <label class="lbl">Odontólogo <span class="req">*</span></label>
          <div class="combo-wrap">
            <input class="fc" [value]="medicoLabel"
                   placeholder="Buscar odontólogo…"
                   (input)="onMedicoInput($event)"
                   (focus)="showDropMed=true"
                   autocomplete="off">
            @if (nueva.medicoId) {
              <button class="combo-clear" type="button" (click)="clearMedico()">×</button>
            }
            @if (showDropMed && medicosFiltrados.length > 0) {
              <div class="combo-drop">
                @for (m of medicosFiltrados; track m.id) {
                  <div class="combo-item" [class.sel]="nueva.medicoId === m.id"
                       (mousedown)="selectMedico(m)">
                    Dr. {{ m.nombreCompleto }}{{ m.especialidad ? ' — ' + m.especialidad : '' }}
                  </div>
                }
              </div>
            }
          </div>
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
            <label class="lbl">Tipo de consulta</label>
            <select class="fc" [(ngModel)]="nueva.tipo">
              <option value="consulta">Consulta general</option>
              <option value="limpieza">Limpieza dental</option>
              <option value="extraccion">Extracción</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="ortodoncia">Ortodoncia (ajuste)</option>
              <option value="implante">Implante</option>
              <option value="estetica">Estética dental</option>
              <option value="urgencia">Urgencia</option>
              <option value="seguimiento">Seguimiento</option>
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
              <option [ngValue]="90">90 min</option>
              <option [ngValue]="120">120 min</option>
            </select>
          </div>
        </div>
        <div class="fg">
          <label class="lbl">Motivo <span class="req">*</span></label>
          <input class="fc" [(ngModel)]="nueva.motivo" placeholder="Ej: Dolor en molar inferior derecho…">
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
  citasDia:   CitaDTO[] = [];
  cargandoDia = false;
  slots:      string[] = [];
  q           = '';
  fFecha      = '';
  fEstado     = '';
  fMedico     = '0';
  modal       = false;

  nueva: CitaCreateDTO = { pacienteId: 0, medicoId: 0, fecha: '', hora: '09:00', duracionMin: 30, motivo: '', tipo: 'consulta' };

  // ── Combobox paciente ─────────────────────────────────────────────
  qPaciente   = '';
  showDropPac = false;

  get pacienteLabel(): string {
    if (!this.nueva.pacienteId) return this.qPaciente;
    const p = this.pacientes.find(x => x.id === this.nueva.pacienteId);
    return p ? `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim() : this.qPaciente;
  }
  get pacientesFiltrados(): PacienteListDTO[] {
    const q = this.qPaciente.toLowerCase().trim();
    if (!q) return this.pacientes.slice(0, 50);
    return this.pacientes.filter(p =>
      `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.toLowerCase().includes(q)
    ).slice(0, 50);
  }
  onPacienteInput(e: Event): void {
    this.qPaciente       = (e.target as HTMLInputElement).value;
    this.nueva.pacienteId = 0;
    this.showDropPac      = true;
  }
  selectPaciente(p: PacienteListDTO): void {
    this.nueva.pacienteId = p.id;
    this.qPaciente        = `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno ?? ''}`.trim();
    this.showDropPac      = false;
  }
  clearPaciente(): void { this.nueva.pacienteId = 0; this.qPaciente = ''; this.showDropPac = false; }

  // ── Combobox odontólogo ───────────────────────────────────────────
  qMedico     = '';
  showDropMed = false;

  get medicoLabel(): string {
    if (!this.nueva.medicoId) return this.qMedico;
    const m = this.medicos.find(x => x.id === this.nueva.medicoId);
    return m ? `Dr. ${m.nombreCompleto}${m.especialidad ? ' — ' + m.especialidad : ''}` : this.qMedico;
  }
  get medicosFiltrados(): UsuarioDTO[] {
    const q = this.qMedico.toLowerCase().trim();
    if (!q) return this.medicos;
    return this.medicos.filter(m => m.nombreCompleto.toLowerCase().includes(q) || (m.especialidad ?? '').toLowerCase().includes(q));
  }
  onMedicoInput(e: Event): void {
    this.qMedico       = (e.target as HTMLInputElement).value;
    this.nueva.medicoId = 0;
    this.showDropMed    = true;
  }
  selectMedico(m: UsuarioDTO): void {
    this.nueva.medicoId = m.id;
    this.qMedico        = `Dr. ${m.nombreCompleto}${m.especialidad ? ' — ' + m.especialidad : ''}`;
    this.showDropMed    = false;
  }
  clearMedico(): void { this.nueva.medicoId = 0; this.qMedico = ''; this.showDropMed = false; }

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.diaActual = new Date().toISOString().split('T')[0];
    this.fFecha    = this.diaActual;
    for (let h = 8; h <= 19; h++) {
      this.slots.push(`${String(h).padStart(2,'0')}:00`);
      this.slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    this.buscar();
    this.cargarDia();
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

  irHoy(): void {
    this.diaActual = new Date().toISOString().split('T')[0];
    this.cargarDia();
  }

  cambiarDia(d: number): void {
    const dt = new Date(this.diaActual + 'T12:00:00');
    dt.setDate(dt.getDate() + d);
    this.diaActual = dt.toISOString().split('T')[0];
    this.cargarDia();
  }

  cargarDia(): void {
    this.cargandoDia = true;
    this.api.getCitas({ fecha: this.diaActual, pageSize: 200 }).subscribe({
      next: r => { this.citasDia = r.items; this.cargandoDia = false; },
      error: () => this.cargandoDia = false,
    });
  }

  get diaGridCols(): string {
    return '70px ' + this.medicosDelDia.map(() => '1fr').join(' ');
  }

  get medicosDelDia(): { medicoId: number; medicoNombre: string; especialidad: string }[] {
    const map = new Map<number, { medicoId: number; medicoNombre: string; especialidad: string }>();
    for (const c of this.citasDia) {
      if (!map.has(c.medicoId)) {
        map.set(c.medicoId, { medicoId: c.medicoId, medicoNombre: c.medicoNombre, especialidad: c.medicoEspecialidad ?? '' });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.medicoNombre.localeCompare(b.medicoNombre));
  }

  slotCitaMedico(slot: string, medicoId: number): CitaDTO | undefined {
    return this.citasDia.find(c => c.hora === slot && c.medicoId === medicoId);
  }

  private bc = new BroadcastChannel('mdental-sala');

  cambiarEstado(c: CitaDTO, estado: string): void {
    this.api.updateCitaEstado(c.id, estado).subscribe({
      next: updated => {
        c.estado = updated.estado;
        this.bc.postMessage({ tipo: 'estado' });
        this.toast.success(`Estado actualizado: ${this.labelEstado(estado)}`);
      },
      error: () => this.toast.error('No se pudo actualizar el estado'),
    });
  }

  abrirModal(): void {
    this.nueva        = { pacienteId: 0, medicoId: 0, fecha: this.diaActual, hora: '09:00', duracionMin: 30, motivo: '', tipo: 'consulta' };
    this.errorModal   = '';
    this.qPaciente    = '';
    this.qMedico      = '';
    this.showDropPac  = false;
    this.showDropMed  = false;
    this.modal        = true;
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
      next: () => {
        this.modal = false; this.guardando = false;
        this.buscar(); this.cargarDia();
        this.toast.success('Cita agendada correctamente');
      },
      error: (e) => {
        this.errorModal = e?.error?.message ?? 'Error al agendar la cita';
        this.toast.error(this.errorModal);
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

  // Tipos adaptados a odontología
  badgeTipo(t: string): string {
    const m: Record<string,string> = {
      consulta:'b-blue', limpieza:'b-teal', extraccion:'b-red', endodoncia:'b-amber',
      ortodoncia:'b-blue', implante:'b-green', estetica:'b-teal', urgencia:'b-red',
      seguimiento:'b-teal', procedimiento:'b-amber',
    };
    return m[t] ?? 'b-gray';
  }
  labelTipo(t: string): string {
    const m: Record<string,string> = {
      consulta:'Consulta', limpieza:'Limpieza', extraccion:'Extracción', endodoncia:'Endodoncia',
      ortodoncia:'Ortodoncia', implante:'Implante', estetica:'Estética', urgencia:'Urgencia',
      seguimiento:'Seguimiento', procedimiento:'Procedimiento',
    };
    return m[t] ?? t;
  }
  badgeEstado(e: string): string {
    const m: Record<string,string> = { programada:'b-gray', confirmada:'b-blue', en_curso:'b-teal', completada:'b-green', cancelada:'b-red', no_asistio:'b-amber' };
    return m[e] ?? 'b-gray';
  }
  labelEstado(e: string): string {
    const m: Record<string,string> = { programada:'Programada', confirmada:'Confirmada', en_curso:'En consulta', completada:'Completada', cancelada:'Cancelada', no_asistio:'No asistió' };
    return m[e] ?? e;
  }
}