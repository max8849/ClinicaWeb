import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { HttpClient, HttpParams }        from '@angular/common/http';
import { interval, Subscription, startWith, switchMap, catchError, of } from 'rxjs';
import { environment }                   from '../../../environments/environment';
import { ApiResponse, PagedResult, CitaDTO } from '../../core/models/api.models';

interface CitaSala {
  id: number;
  hora: string;
  pacienteNombre: string;
  medicoNombre: string;
  tipo: string;
  estado: string;
  motivo: string;
}

@Component({
  selector: 'app-sala-espera',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host { display:block; }
    * { box-sizing:border-box; margin:0; padding:0; }

    .sala {
      min-height: 100vh;
      background: #0a1628;
      color: white;
      font-family: 'DM Sans', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #0c2d5a 0%, #0c3d6e 100%);
      border-bottom: 2px solid #1e4d8c;
      padding: 20px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-icon {
      width: 52px; height: 52px;
      background: #0369a1;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-icon svg { width: 30px; height: 30px; stroke: white; fill: none; stroke-width: 2; }
    .brand-name { font-size: 1.9rem; font-weight: 700; letter-spacing: -.02em; }
    .brand-name span { color: #38bdf8; }
    .brand-sub { font-size: .85rem; color: #7dd3fc; margin-top: 2px; }

    .clock-area { text-align: right; }
    .clock { font-size: 3.2rem; font-weight: 700; font-variant-numeric: tabular-nums; color: #f0f9ff; letter-spacing: -.02em; }
    .fecha { font-size: .9rem; color: #7dd3fc; margin-top: 2px; }

    /* ── Título sección ── */
    .section-title {
      padding: 22px 48px 14px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .section-title h2 {
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: #7dd3fc;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #1e3a5f;
    }
    .refresh-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #22c55e;
      flex-shrink: 0;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: .5; transform: scale(.7); }
    }

    /* ── Tabla ── */
    .tabla-wrap { padding: 0 48px; flex: 1; }
    table { width: 100%; border-collapse: collapse; }

    thead tr {
      border-bottom: 1px solid #1e3a5f;
    }
    thead th {
      padding: 10px 16px;
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #475569;
      text-align: left;
    }

    tbody tr {
      border-bottom: 1px solid #0f2240;
      transition: background .2s;
    }
    tbody tr:last-child { border-bottom: none; }
    tbody tr.en-consulta {
      background: rgba(13, 148, 136, .08);
      border-left: 3px solid #0d9488;
    }
    tbody tr.completada-row { opacity: .45; }

    tbody td {
      padding: 14px 16px;
      font-size: 1.05rem;
      vertical-align: middle;
    }

    .hora-cell {
      font-size: 1.3rem;
      font-weight: 700;
      color: #f0f9ff;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      width: 90px;
    }

    .paciente-cell {
      font-size: 1.15rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .doctor-cell {
      font-size: .95rem;
      color: #94a3b8;
    }

    .tipo-cell {
      font-size: .85rem;
      color: #64748b;
      text-transform: capitalize;
    }

    /* ── Columnas ── */
    .contenido {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      overflow: hidden;
    }
    .col {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .col-espera   { border-right: 1px solid #1e3a5f; }

    .col-header {
      padding: 14px 32px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1e3a5f;
    }
    .col-header h2 {
      font-size: .78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
    }
    .col-espera .col-header h2   { color: #38bdf8; }
    .col-consulta .col-header h2 { color: #2dd4bf; }

    .col-body { flex: 1; overflow-y: auto; padding: 12px 0; }

    /* ── Tarjeta paciente ── */
    .pac-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 32px;
      border-bottom: 1px solid #0f2240;
      transition: background .15s;
    }
    .pac-card:last-child { border-bottom: none; }

    .pac-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e3a5f;
      min-width: 42px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .pac-hora {
      font-size: 1.1rem;
      font-weight: 700;
      color: #e2e8f0;
      min-width: 62px;
      font-variant-numeric: tabular-nums;
    }
    .pac-info { flex: 1; min-width: 0; }
    .pac-nombre {
      font-size: 1.2rem;
      font-weight: 600;
      color: #f0f9ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pac-sub {
      font-size: .85rem;
      color: #475569;
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* badge estado */
    .badge-estado {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 30px;
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .04em;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .badge-estado .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .s-programada { background: rgba(100,116,139,.15); color: #94a3b8; }
    .s-programada .dot { background: #64748b; }
    .s-confirmada { background: rgba(3,105,161,.2); color: #38bdf8; }
    .s-confirmada .dot { background: #38bdf8; }
    .s-completada { background: rgba(5,150,105,.15); color: #34d399; }
    .s-completada .dot { background: #34d399; }
    .s-no_asistio { background: rgba(217,119,6,.15); color: #fbbf24; }
    .s-no_asistio .dot { background: #fbbf24; }

    /* ── Tarjeta EN CONSULTA ── */
    .pac-card-active {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 20px 32px;
      border-bottom: 1px solid #0f3030;
      background: rgba(13,148,136,.07);
      border-left: 3px solid #0d9488;
    }
    .pac-card-active:last-child { border-bottom: none; }
    .active-nombre {
      font-size: 1.55rem;
      font-weight: 700;
      color: #f0f9ff;
    }
    .active-doctor {
      font-size: 1rem;
      color: #2dd4bf;
      font-weight: 500;
    }
    .active-tipo {
      font-size: .85rem;
      color: #475569;
    }
    .active-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin-top: 6px;
      padding: 6px 16px;
      border-radius: 30px;
      background: rgba(13,148,136,.25);
      color: #2dd4bf;
      font-size: .82rem;
      font-weight: 700;
      width: fit-content;
      animation: glow .9s alternate infinite;
    }
    .active-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #2dd4bf;
      animation: pulse .8s infinite;
    }

    @keyframes glow {
      from { box-shadow: 0 0 0   rgba(13,148,136,0); }
      to   { box-shadow: 0 0 16px rgba(13,148,136,.5); }
    }

    /* ── Empty col ── */
    .empty-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
    .empty-col svg { width: 48px; height: 48px; stroke: #1e3a5f; margin-bottom: 14px; }
    .empty-col p { font-size: .9rem; color: #334155; }

    /* ── Footer ── */
    .footer {
      padding: 12px 32px;
      border-top: 1px solid #1e3a5f;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-info { font-size: .73rem; color: #334155; }
    .footer-info strong { color: #475569; }
    .last-update { font-size: .73rem; color: #334155; }
  `],
  template: `
<div class="sala">

  <!-- Header -->
  <header class="header">
    <div class="logo-area">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C9 2 7 4 7 6.5c0 1.5.4 2.8 1 4.5C9 13 10.5 16 11.5 18.5c.3.7.5 1.5.5 1.5s.2-.8.5-1.5C13.5 16 15 13 16 11c.6-1.7 1-3 1-4.5C17 4 15 2 12 2z"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">m<span>Dental</span></div>
        <div class="brand-sub">Sala de espera</div>
      </div>
    </div>
    <div class="clock-area">
      <div class="clock">{{ horaActual }}</div>
      <div class="fecha">{{ fechaHoy }}</div>
    </div>
  </header>

  <!-- Cuerpo dividido -->
  @if (cargando && citas.length === 0) {
    <div style="flex:1;display:flex;align-items:center;justify-content:center;color:#334155">
      <p style="font-size:1.1rem">Cargando sala de espera…</p>
    </div>
  } @else {
    <div class="contenido">

      <!-- Columna izquierda: en espera -->
      <div class="col col-espera">
        <div class="col-header">
          <div class="refresh-dot"></div>
          <h2>En espera ({{ espera.length }})</h2>
        </div>
        <div class="col-body">
          @if (espera.length === 0) {
            <div class="empty-col">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <p>Sin pacientes en espera</p>
            </div>
          }
          @for (c of espera; track c.id; let i = $index) {
            <div class="pac-card">
              <div class="pac-num">{{ i + 1 }}</div>
              <div class="pac-hora">{{ c.hora }}</div>
              <div class="pac-info">
                <div class="pac-nombre">{{ c.pacienteNombre }}</div>
                <div class="pac-sub">{{ c.medicoNombre }} · {{ labelTipo(c.tipo) }}</div>
              </div>
              <span class="badge-estado" [ngClass]="'s-' + c.estado">
                <span class="dot"></span>{{ labelEstado(c.estado) }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Columna derecha: en consulta -->
      <div class="col col-consulta">
        <div class="col-header">
          <div class="refresh-dot" style="background:#2dd4bf"></div>
          <h2>En consulta ({{ enCurso.length }})</h2>
        </div>
        <div class="col-body">
          @if (enCurso.length === 0) {
            <div class="empty-col">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <p>Ningún paciente en consulta</p>
            </div>
          }
          @for (c of enCurso; track c.id) {
            <div class="pac-card-active">
              <div style="font-size:.75rem;color:#475569;font-variant-numeric:tabular-nums">{{ c.hora }}</div>
              <div class="active-nombre">{{ c.pacienteNombre }}</div>
              <div class="active-doctor">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M12 2C9 2 7 4 7 6.5c0 1.5.4 2.8 1 4.5C9 13 10.5 16 11.5 18.5c.3.7.5 1.5.5 1.5s.2-.8.5-1.5C13.5 16 15 13 16 11c.6-1.7 1-3 1-4.5C17 4 15 2 12 2z"/></svg>
                {{ c.medicoNombre }}
              </div>
              <div class="active-tipo">{{ labelTipo(c.tipo) }}</div>
              <div class="active-badge">
                <span class="active-dot"></span>
                En consulta
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  }

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-info">
      <strong>Consultorio mDental</strong> · Sistema de gestión clínica
    </div>
    <div class="last-update">Actualizado: {{ ultimaActualizacion }}</div>
  </footer>

</div>
  `,
})
export class SalaEsperaComponent implements OnInit, OnDestroy {
  citas:              CitaSala[] = [];
  cargando           = true;
  horaActual         = '';
  fechaHoy           = '';
  ultimaActualizacion = '';

  get espera():  CitaSala[] { return this.citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada'); }
  get enCurso(): CitaSala[] { return this.citas.filter(c => c.estado === 'en_curso'); }

  private subs: Subscription[] = [];
  private bc!: BroadcastChannel;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.tickReloj();
    this.subs.push(
      interval(1000).subscribe(() => this.tickReloj()),
    );

    // Polling de respaldo cada 8s
    this.subs.push(
      interval(8_000).pipe(
        startWith(0),
        switchMap(() => this.cargarCitas()),
      ).subscribe(lista => this.aplicar(lista)),
    );

    // Actualización instantánea cuando la secretaria cambia un estado
    this.bc = new BroadcastChannel('mdental-sala');
    this.bc.onmessage = () => {
      this.cargarCitas().subscribe(lista => this.aplicar(lista));
    };
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.bc?.close();
  }

  private aplicar(lista: CitaSala[]): void {
    this.citas    = lista;
    this.cargando = false;
    this.ultimaActualizacion = new Date().toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }

  private cargarCitas() {
    const hoy    = new Date().toISOString().split('T')[0];
    const params = new HttpParams().set('fecha', hoy).set('pageSize', '100');

    return this.http
      .get<ApiResponse<PagedResult<CitaDTO>>>(`${environment.apiUrl}/citas`, { params })
      .pipe(
        catchError(() => of(null)),
        switchMap(res => {
          if (!res?.success || !res.data) return of([] as CitaSala[]);
          const lista: CitaSala[] = (res.data.items ?? [])
            .filter(c => c.estado === 'programada' || c.estado === 'confirmada' || c.estado === 'en_curso')
            .sort((a, b) => a.hora.localeCompare(b.hora))
            .map(c => ({
              id:             c.id,
              hora:           c.hora,
              pacienteNombre: c.pacienteNombre,
              medicoNombre:   c.medicoNombre,
              tipo:           c.tipo,
              estado:         c.estado,
              motivo:         c.motivo,
            }));
          return of(lista);
        }),
      );
  }

  private tickReloj(): void {
    const ahora = new Date();
    this.horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    this.fechaHoy   = ahora.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  labelEstado(e: string): string {
    const m: Record<string, string> = {
      programada:  'Programada',
      confirmada:  'Confirmada',
      en_curso:    'En consulta',
      completada:  'Atendido',
      no_asistio:  'No se presentó',
      cancelada:   'Cancelada',
    };
    return m[e] ?? e;
  }

  labelTipo(t: string): string {
    const m: Record<string, string> = {
      consulta:     'Consulta',
      limpieza:     'Limpieza',
      extraccion:   'Extracción',
      endodoncia:   'Endodoncia',
      ortodoncia:   'Ortodoncia',
      implante:     'Implante',
      estetica:     'Estética',
      urgencia:     'Urgencia',
      seguimiento:  'Seguimiento',
      procedimiento:'Procedimiento',
    };
    return m[t] ?? t;
  }
}
