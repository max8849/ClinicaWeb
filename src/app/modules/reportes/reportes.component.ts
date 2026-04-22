import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ReporteCitasDTO, ReportePacientesDTO, ReporteMedicosDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .rep-tab { display:flex;gap:4px;background:var(--g100);padding:4px;border-radius:var(--r);width:fit-content;margin-bottom:24px;flex-wrap:wrap; }
    .rep-tab-btn { padding:7px 16px;border:none;background:transparent;border-radius:6px;font-family:var(--font);font-size:.83rem;cursor:pointer;color:var(--g500);transition:all .15s; }
    .rep-tab-btn.on { background:var(--white);color:var(--primary);font-weight:500;box-shadow:var(--sh); }
    .kpi-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px; }
    .kpi { background:var(--white);border:1px solid var(--border);border-radius:var(--rl);padding:16px 18px; }
    .kpi-lbl { font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--g500);margin-bottom:4px; }
    .kpi-val { font-size:1.7rem;font-weight:600;color:var(--g900);line-height:1; }
    .kpi-sub { font-size:.75rem;color:var(--g400);margin-top:3px; }
    .bar-row { display:flex;align-items:center;gap:10px;margin-bottom:8px; }
    .bar-lbl { font-size:.8rem;color:var(--g700);min-width:130px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .bar-track { flex:1;height:8px;background:var(--g100);border-radius:4px;overflow:hidden; }
    .bar-fill { height:100%;border-radius:4px;transition:width .4s ease; }
    .bar-num { font-size:.8rem;font-weight:600;color:var(--g700);min-width:30px;text-align:right; }
    .rpt-grid { display:grid;grid-template-columns:1fr 1fr;gap:18px; }
    @media(max-width:640px) { .rpt-grid { grid-template-columns:1fr; } }
    /* ── Médicos: tarjetas móvil ── */
    .m-med-card {
      background:var(--white); border:1px solid var(--border);
      border-radius:var(--rl); padding:14px 16px;
    }
    .m-med-head { margin-bottom:10px; }
    .m-med-nombre { font-weight:600; font-size:.95rem; color:var(--g900); }
    .m-med-esp { font-size:.78rem; color:var(--g500); margin-top:2px; }
    .m-med-stats {
      display:grid; grid-template-columns:1fr 1fr; gap:8px 12px;
      padding-top:10px; border-top:1px solid var(--border);
    }
    .m-stat-lbl {
      font-size:.62rem; font-weight:700; text-transform:uppercase;
      letter-spacing:.04em; color:var(--g400); margin-bottom:2px;
    }
    .m-stat-val { font-size:.88rem; color:var(--g800); font-weight:600; }
  `],
  template: `
<div class="page fade-in">

  <div class="ph">
    <div><h1>Reportes</h1><p>Análisis y estadísticas del sistema</p></div>
    <div class="ph-actions">
      @if (tab === 'citas' && rc) {
        <button class="btn btn-secondary btn-sm" type="button" (click)="exportarCitas()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar Excel
        </button>
      }
      @if (tab === 'pacientes' && rp) {
        <button class="btn btn-secondary btn-sm" type="button" (click)="exportarPacientes()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar Excel
        </button>
      }
      @if (tab === 'medicos' && rm) {
        <button class="btn btn-secondary btn-sm" type="button" (click)="exportarMedicos()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar Excel
        </button>
      }
    </div>
  </div>

  <!-- Tabs -->
  <div class="rep-tab">
    <button class="rep-tab-btn" [class.on]="tab==='citas'"    (click)="tab='citas';cargar()"    type="button">Citas</button>
    <button class="rep-tab-btn" [class.on]="tab==='pacientes'" (click)="tab='pacientes';cargar()" type="button">Pacientes</button>
    <button class="rep-tab-btn" [class.on]="tab==='medicos'"  (click)="tab='medicos';cargar()"  type="button">Médicos</button>
  </div>

  <!-- ── CITAS ─────────────────────────────────────────────────── -->
  @if (tab === 'citas') {
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:flex-end">
      <div class="fg" style="margin:0">
        <label class="lbl">Desde</label>
        <input type="date" class="fc" style="width:160px" [(ngModel)]="citaDesde">
      </div>
      <div class="fg" style="margin:0">
        <label class="lbl">Hasta</label>
        <input type="date" class="fc" style="width:160px" [(ngModel)]="citaHasta">
      </div>
      <button class="btn btn-primary" type="button" (click)="cargar()">Consultar</button>
    </div>

    @if (cargando) { <div class="empty"><div class="sm muted">Cargando reporte…</div></div> }
    @else if (rc) {
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-lbl">Total citas</div><div class="kpi-val">{{ rc.totalCitas }}</div></div>
        <div class="kpi"><div class="kpi-lbl">Completadas</div><div class="kpi-val" style="color:var(--success)">{{ rc.completadas }}</div><div class="kpi-sub">{{ rc.porcentajeCompletadas }}%</div></div>
        <div class="kpi"><div class="kpi-lbl">Canceladas</div><div class="kpi-val" style="color:var(--danger)">{{ rc.canceladas }}</div></div>
        <div class="kpi"><div class="kpi-lbl">No asistió</div><div class="kpi-val" style="color:var(--warning)">{{ rc.noAsistio }}</div></div>
        <div class="kpi"><div class="kpi-lbl">Pendientes</div><div class="kpi-val" style="color:var(--g500)">{{ rc.pendientes }}</div></div>
      </div>

      <div class="rpt-grid">
        <div class="card">
          <div class="sec">Por médico</div>
          @for (m of rc.porMedico; track m.medicoId) {
            <div class="bar-row">
              <div class="bar-lbl" [title]="m.medicoNombre">{{ m.medicoNombre }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--primary);width:{{ pct(m.total, rc.totalCitas) }}%"></div></div>
              <div class="bar-num">{{ m.total }}</div>
            </div>
          }
        </div>
        <div class="card">
          <div class="sec">Por tipo</div>
          @for (t of rc.porTipo; track t.tipo) {
            <div class="bar-row">
              <div class="bar-lbl">{{ labelTipo(t.tipo) }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--accent);width:{{ pct(t.total, rc.totalCitas) }}%"></div></div>
              <div class="bar-num">{{ t.total }}</div>
            </div>
          }
        </div>
        <div class="card">
          <div class="sec">Por estado</div>
          @for (e of rc.porEstado; track e.estado) {
            <div class="bar-row">
              <div class="bar-lbl">{{ labelEstado(e.estado) }}</div>
              <div class="bar-track"><div class="bar-fill" [style.background]="colorEstado(e.estado)" [style.width]="pct(e.total,rc.totalCitas)+'%'"></div></div>
              <div class="bar-num">{{ e.total }}</div>
            </div>
          }
        </div>
        <div class="card">
          <div class="sec">Últimos días</div>
          @for (d of rc.porDia.slice(-7); track d.fecha) {
            <div class="bar-row">
              <div class="bar-lbl">{{ formatFechaCorta(d.fecha) }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--primary);width:{{ pct(d.total, maxDia) }}%"></div></div>
              <div class="bar-num">{{ d.total }}</div>
            </div>
          }
        </div>
      </div>
    }
  }

  <!-- ── PACIENTES ─────────────────────────────────────────────── -->
  @if (tab === 'pacientes') {
    @if (cargando) { <div class="empty"><div class="sm muted">Cargando reporte…</div></div> }
    @else if (rp) {
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-lbl">Activos</div><div class="kpi-val">{{ rp.totalActivos }}</div></div>
        <div class="kpi"><div class="kpi-lbl">Nuevos este mes</div><div class="kpi-val" style="color:var(--success)">{{ rp.nuevosMes }}</div></div>
        <div class="kpi"><div class="kpi-lbl">Nuevos este año</div><div class="kpi-val">{{ rp.nuevosAnio }}</div></div>
        <div class="kpi"><div class="kpi-lbl">Inactivos</div><div class="kpi-val" style="color:var(--g400)">{{ rp.totalInactivos }}</div></div>
      </div>

      <div class="rpt-grid">
        <div class="card">
          <div class="sec">Por sexo</div>
          @for (s of rp.porSexo; track s.sexo) {
            <div class="bar-row">
              <div class="bar-lbl">{{ s.sexo }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--primary);width:{{ pct(s.total, rp.totalActivos) }}%"></div></div>
              <div class="bar-num">{{ s.total }}</div>
            </div>
          }
        </div>
        <div class="card">
          <div class="sec">Por rango de edad</div>
          @for (e of rp.porRangoEdad; track e.rango) {
            <div class="bar-row">
              <div class="bar-lbl">{{ e.rango }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--accent);width:{{ pct(e.total, maxEdad) }}%"></div></div>
              <div class="bar-num">{{ e.total }}</div>
            </div>
          }
        </div>
        <div class="card">
          <div class="sec">Top diagnósticos</div>
          @for (d of rp.topDiagnosticos; track d.diagnostico) {
            <div class="bar-row">
              <div class="bar-lbl" [title]="d.diagnostico" style="max-width:200px">{{ d.diagnostico }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--primary);width:{{ pct(d.frecuencia, maxDiag) }}%"></div></div>
              <div class="bar-num">{{ d.frecuencia }}</div>
            </div>
          }
        </div>
        <div class="card">
          <div class="sec">Top alergias</div>
          @for (a of rp.topAlergias; track a.alergia) {
            <div class="bar-row">
              <div class="bar-lbl">{{ a.alergia }}</div>
              <div class="bar-track"><div class="bar-fill" style="background:var(--danger);width:{{ pct(a.frecuencia, maxAlergia) }}%"></div></div>
              <div class="bar-num">{{ a.frecuencia }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Registros por mes -->
      <div class="card" style="margin-top:18px">
        <div class="sec">Registros por mes (últimos 12 meses)</div>
        <div style="display:flex;align-items:flex-end;gap:6px;height:100px;padding-top:8px">
          @for (m of rp.registrosPorMes; track m.nombreMes) {
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="font-size:.65rem;color:var(--g500)">{{ m.total }}</div>
              <div style="width:100%;background:var(--primary);border-radius:4px 4px 0 0;min-height:4px"
                   [style.height]="pct(m.total, maxMes) * 0.7 + 'px'"></div>
              <div style="font-size:.6rem;color:var(--g400);text-align:center">{{ m.nombreMes.slice(0,3) }}</div>
            </div>
          }
        </div>
      </div>
    }
  }

  <!-- ── MÉDICOS ────────────────────────────────────────────────── -->
  @if (tab === 'medicos') {
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:flex-end">
      <div class="fg" style="margin:0"><label class="lbl">Desde</label>
        <input type="date" class="fc" style="width:160px" [(ngModel)]="medDesde"></div>
      <div class="fg" style="margin:0"><label class="lbl">Hasta</label>
        <input type="date" class="fc" style="width:160px" [(ngModel)]="medHasta"></div>
      <button class="btn btn-primary" type="button" (click)="cargar()">Consultar</button>
    </div>

    @if (cargando) { <div class="empty"><div class="sm muted">Cargando reporte…</div></div> }
    @else if (rm) {
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr><th>Médico</th><th>Especialidad</th><th>Total citas</th><th>Completadas</th><th>Canceladas</th><th>% Asistencia</th><th>Notas</th><th>Recetas</th></tr>
          </thead>
          <tbody>
            @for (m of rm.rendimiento; track m.medicoId) {
              <tr>
                <td style="font-weight:500">{{ m.medicoNombre }}</td>
                <td class="sm muted">{{ m.especialidad || '—' }}</td>
                <td style="text-align:center;font-weight:600">{{ m.totalCitas }}</td>
                <td style="text-align:center"><span class="badge b-green">{{ m.completadas }}</span></td>
                <td style="text-align:center"><span class="badge b-red">{{ m.canceladas }}</span></td>
                <td style="text-align:center">
                  <span class="badge" [class.b-green]="m.porcentajeAsistencia>=70" [class.b-amber]="m.porcentajeAsistencia>=40&&m.porcentajeAsistencia<70" [class.b-red]="m.porcentajeAsistencia<40">
                    {{ m.porcentajeAsistencia }}%
                  </span>
                </td>
                <td style="text-align:center">{{ m.totalNotas }}</td>
                <td style="text-align:center">{{ m.totalRecetas }}</td>
              </tr>
            }
            @empty {
              <tr><td colspan="8"><div class="empty"><h3>Sin datos en el período</h3></div></td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Vista móvil: tarjetas de médico -->
      <div class="m-cards">
        @for (m of rm.rendimiento; track m.medicoId) {
          <div class="m-med-card">
            <div class="m-med-head">
              <div class="m-med-nombre">{{ m.medicoNombre }}</div>
              <div class="m-med-esp">{{ m.especialidad || '—' }}</div>
            </div>
            <div class="m-med-stats">
              <div>
                <div class="m-stat-lbl">Total citas</div>
                <div class="m-stat-val">{{ m.totalCitas }}</div>
              </div>
              <div>
                <div class="m-stat-lbl">% Asistencia</div>
                <div class="m-stat-val">
                  <span class="badge" [class.b-green]="m.porcentajeAsistencia>=70" [class.b-amber]="m.porcentajeAsistencia>=40&&m.porcentajeAsistencia<70" [class.b-red]="m.porcentajeAsistencia<40">
                    {{ m.porcentajeAsistencia }}%
                  </span>
                </div>
              </div>
              <div>
                <div class="m-stat-lbl">Completadas</div>
                <div class="m-stat-val"><span class="badge b-green">{{ m.completadas }}</span></div>
              </div>
              <div>
                <div class="m-stat-lbl">Canceladas</div>
                <div class="m-stat-val"><span class="badge b-red">{{ m.canceladas }}</span></div>
              </div>
              <div>
                <div class="m-stat-lbl">Notas</div>
                <div class="m-stat-val">{{ m.totalNotas }}</div>
              </div>
              <div>
                <div class="m-stat-lbl">Recetas</div>
                <div class="m-stat-val">{{ m.totalRecetas }}</div>
              </div>
            </div>
          </div>
        }
        @empty {
          <div class="empty"><h3>Sin datos en el período</h3></div>
        }
      </div>
    }
  }

</div>
  `,
})
export class ReportesComponent implements OnInit {
  tab: 'citas' | 'pacientes' | 'medicos' = 'citas';
  cargando = true;
  rc?: ReporteCitasDTO;
  rp?: ReportePacientesDTO;
  rm?: ReporteMedicosDTO;

  hoy = new Date().toISOString().split('T')[0];
  hace30 = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  citaDesde = this.hace30; citaHasta = this.hoy;
  medDesde  = this.inicioMes; medHasta = this.hoy;

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    if (this.tab === 'citas') {
      this.api.getReporteCitas({ desde: this.citaDesde, hasta: this.citaHasta }).subscribe({
        next: r => { this.rc = r; this.cargando = false; },
        error: () => this.cargando = false,
      });
    } else if (this.tab === 'pacientes') {
      this.api.getReportePacientes().subscribe({
        next: r => { this.rp = r; this.cargando = false; },
        error: () => this.cargando = false,
      });
    } else {
      this.api.getReporteMedicos({ desde: this.medDesde, hasta: this.medHasta }).subscribe({
        next: r => { this.rm = r; this.cargando = false; },
        error: () => this.cargando = false,
      });
    }
  }

  pct(val: number, max: number) { return max > 0 ? Math.round(val / max * 100) : 0; }

  get maxDia()     { return Math.max(1, ...(this.rc?.porDia.slice(-7).map(d => d.total) ?? [1])); }
  get maxDiag()    { return Math.max(1, ...(this.rp?.topDiagnosticos.map(d => d.frecuencia) ?? [1])); }
  get maxAlergia() { return Math.max(1, ...(this.rp?.topAlergias.map(a => a.frecuencia) ?? [1])); }
  get maxEdad()    { return Math.max(1, ...(this.rp?.porRangoEdad.map(e => e.total) ?? [1])); }
  get maxMes()     { return Math.max(1, ...(this.rp?.registrosPorMes.map(m => m.total) ?? [1])); }

  labelTipo(t: string)   { return ({ consulta:'Consulta', seguimiento:'Seguimiento', urgencia:'Urgencia', procedimiento:'Procedimiento' })[t] ?? t; }
  labelEstado(e: string) { return ({ programada:'Programada', confirmada:'Confirmada', en_curso:'En curso', completada:'Completada', cancelada:'Cancelada', no_asistio:'No asistió' })[e] ?? e; }
  colorEstado(e: string) { return ({ completada:'var(--success)', cancelada:'var(--danger)', no_asistio:'var(--warning)', en_curso:'var(--accent)' })[e] ?? 'var(--g300)'; }
  formatFechaCorta(iso: string) { return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day:'2-digit', month:'short' }); }

  // ── Exportar Excel (CSV con BOM para compatibilidad Excel) ────────
  private descargar(nombre: string, filas: (string | number | undefined)[][]): void {
    const sep    = ',';
    const bom    = '\uFEFF';
    const escape = (v: string | number | undefined) => {
      const s = String(v ?? '');
      return s.includes(sep) || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv  = bom + filas.map(r => r.map(escape).join(sep)).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = nombre; a.click();
    URL.revokeObjectURL(url);
  }

  exportarCitas(): void {
    if (!this.rc) return;
    const filas: (string | number | undefined)[][] = [
      ['Reporte de Citas — mDental'],
      [`Período: ${this.citaDesde} a ${this.citaHasta}`],
      [],
      ['Métrica', 'Valor'],
      ['Total citas',      this.rc.totalCitas],
      ['Completadas',      this.rc.completadas],
      ['% Completadas',    this.rc.porcentajeCompletadas + '%'],
      ['Canceladas',       this.rc.canceladas],
      ['No asistió',       this.rc.noAsistio],
      ['Pendientes',       this.rc.pendientes],
      [],
      ['Por Médico', 'Total'],
      ...this.rc.porMedico.map(m => [m.medicoNombre, m.total]),
      [],
      ['Por Tipo', 'Total'],
      ...this.rc.porTipo.map(t => [this.labelTipo(t.tipo), t.total]),
      [],
      ['Por Estado', 'Total'],
      ...this.rc.porEstado.map(e => [this.labelEstado(e.estado), e.total]),
      [],
      ['Fecha', 'Total citas'],
      ...this.rc.porDia.map(d => [d.fecha, d.total]),
    ];
    this.descargar(`reporte-citas-${this.citaDesde}_${this.citaHasta}.csv`, filas);
  }

  exportarPacientes(): void {
    if (!this.rp) return;
    const filas: (string | number | undefined)[][] = [
      ['Reporte de Pacientes — mDental'],
      [],
      ['Métrica', 'Valor'],
      ['Total activos',    this.rp.totalActivos],
      ['Total inactivos',  this.rp.totalInactivos],
      ['Nuevos este mes',  this.rp.nuevosMes],
      ['Nuevos este año',  this.rp.nuevosAnio],
      [],
      ['Por Sexo', 'Total'],
      ...this.rp.porSexo.map(s => [s.sexo, s.total]),
      [],
      ['Rango de Edad', 'Total'],
      ...this.rp.porRangoEdad.map(e => [e.rango, e.total]),
      [],
      ['Top Diagnósticos', 'Frecuencia'],
      ...this.rp.topDiagnosticos.map(d => [d.diagnostico, d.frecuencia]),
      [],
      ['Top Alergias', 'Frecuencia'],
      ...this.rp.topAlergias.map(a => [a.alergia, a.frecuencia]),
    ];
    this.descargar('reporte-pacientes.csv', filas);
  }

  exportarMedicos(): void {
    if (!this.rm) return;
    const filas: (string | number | undefined)[][] = [
      ['Reporte de Odontólogos — mDental'],
      [`Período: ${this.medDesde} a ${this.medHasta}`],
      [],
      ['Odontólogo', 'Especialidad', 'Total citas', 'Completadas', 'Canceladas', '% Asistencia', 'Notas', 'Recetas'],
      ...this.rm.rendimiento.map(m => [
        m.medicoNombre, m.especialidad ?? '', m.totalCitas, m.completadas,
        m.canceladas, m.porcentajeAsistencia + '%', m.totalNotas, m.totalRecetas,
      ]),
    ];
    this.descargar(`reporte-odontologos-${this.medDesde}_${this.medHasta}.csv`, filas);
  }
}
