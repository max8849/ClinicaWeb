import { Component, OnInit }           from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule }                  from '@angular/forms';
import { ApiService }                   from '../../core/services/api.service';
import {
  ExpedienteDTO, PacienteDetalleDTO,
  NotaEvolucionDTO, NotaCreateDTO,
  RecetaDTO, RecetaCreateDTO, MedicamentoDTO,
  UsuarioDTO,
} from '../../core/models/api.models';

@Component({
  selector: 'app-expediente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    .tab-btn { padding:6px 14px; border:none; background:transparent; border-radius:6px; font-family:var(--font); font-size:.83rem; cursor:pointer; color:var(--g500); transition:all .15s; }
    .tab-btn.on { background:var(--white); color:var(--primary); font-weight:500; box-shadow:var(--sh); }
    .soap { background:var(--g50); border-radius:var(--r); padding:12px; }
    .soap-tag { font-size:.67rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
  `],
  template: `
@if (cargando) {
  <div class="page"><div class="empty" style="margin-top:80px"><div class="sm muted">Cargando expediente…</div></div></div>
} @else if (exp && pac) {
<div class="page fade-in">

  <!-- Header -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:22px">
    <a class="btn btn-ghost btn-sm btn-icon" routerLink="/pacientes">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </a>
    <div class="av av-lg" [class.av-blue]="pac.sexo === 'F'" [class.av-green]="pac.sexo === 'M'">
      {{ pac.nombre[0] }}{{ pac.apellidoPaterno[0] }}
    </div>
    <div style="flex:1">
      <h1 style="font-size:1.2rem">{{ pac.nombre }} {{ pac.apellidoPaterno }} {{ pac.apellidoMaterno }}</h1>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:3px">
        <span class="chip">{{ pac.folio }}</span>
        <span class="sm muted">{{ pac.edad }} años · {{ pac.sexo === 'F' ? 'Femenino' : 'Masculino' }}</span>
        @if (pac.grupoSanguineo) { <span class="badge b-red">{{ pac.grupoSanguineo }}</span> }
        @if (tieneAlergia) { <span class="badge b-red">⚠ {{ pac.alergias }}</span> }
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-secondary btn-sm" type="button" (click)="modalNota = true">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva nota
      </button>
      <button class="btn btn-primary btn-sm" type="button" (click)="modalReceta = true">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
        Nueva receta
      </button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:280px 1fr;gap:18px;align-items:start">

    <!-- Ficha -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card">
        <div class="sec">Identificación</div>
        <div class="ir"><span class="irl">Folio</span><span class="irv chip">{{ pac.folio }}</span></div>
        <div class="ir"><span class="irl">Nacimiento</span><span class="irv">{{ formatFecha(pac.fechaNacimiento) }}</span></div>
        <div class="ir"><span class="irl">Edad</span><span class="irv">{{ pac.edad }} años</span></div>
        <div class="ir"><span class="irl">Sexo</span><span class="irv">{{ pac.sexo === 'F' ? 'Femenino' : 'Masculino' }}</span></div>
        @if (pac.curp) { <div class="ir"><span class="irl">CURP</span><span class="irv mono xs">{{ pac.curp }}</span></div> }
        @if (pac.grupoSanguineo) { <div class="ir"><span class="irl">Grupo sang.</span><span class="irv"><span class="badge b-red">{{ pac.grupoSanguineo }}</span></span></div> }
      </div>
      <div class="card">
        <div class="sec">Contacto</div>
        <div class="ir"><span class="irl">Teléfono</span><span class="irv">{{ pac.telefono }}</span></div>
        @if (pac.email) { <div class="ir"><span class="irl">Email</span><span class="irv xs" style="word-break:break-all">{{ pac.email }}</span></div> }
      </div>
      <div class="card">
        <div class="sec">Antecedentes</div>
        @if (pac.alergias) {
          <div class="mb-2">
            <div class="ilbl">Alergias</div>
            <p class="sm" [style.color]="tieneAlergia ? 'var(--danger)' : 'var(--g400)'" style="font-weight:500;margin-top:2px">{{ pac.alergias }}</p>
          </div>
        }
        @if (pac.antecedentesHF) {
          <div class="mb-2"><div class="ilbl">HF</div><p class="sm" style="margin-top:2px;line-height:1.5">{{ pac.antecedentesHF }}</p></div>
        }
        @if (pac.antecedentesNP) {
          <div class="mb-2"><div class="ilbl">No patológicos</div><p class="sm" style="margin-top:2px;line-height:1.5">{{ pac.antecedentesNP }}</p></div>
        }
        @if (pac.antecedentesPatologicos) {
          <div><div class="ilbl">Patológicos</div><p class="sm" style="margin-top:2px;line-height:1.5">{{ pac.antecedentesPatologicos }}</p></div>
        }
      </div>
    </div>

    <!-- Expediente -->
    <div>
      <div class="tab-group mb-3">
        <button class="tab-btn" [class.on]="tab === 'notas'"   (click)="tab = 'notas'"   type="button">
          Notas de evolución
          @if (exp.notas.length) { <span style="background:var(--primary);color:white;font-size:.68rem;padding:1px 6px;border-radius:20px;margin-left:4px">{{ exp.notas.length }}</span> }
        </button>
        <button class="tab-btn" [class.on]="tab === 'recetas'" (click)="tab = 'recetas'" type="button">
          Recetas
          @if (exp.recetas.length) { <span style="background:var(--primary);color:white;font-size:.68rem;padding:1px 6px;border-radius:20px;margin-left:4px">{{ exp.recetas.length }}</span> }
        </button>
        <button class="tab-btn" [class.on]="tab === 'labs'"    (click)="tab = 'labs'"    type="button">Laboratorios</button>
      </div>

      <!-- Notas -->
      @if (tab === 'notas') {
        @if (exp.notas.length === 0) {
          <div class="empty">
            <div class="empty-ico"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <h3>Sin notas de evolución</h3>
            <button class="btn btn-primary btn-sm mt-2" type="button" (click)="modalNota = true">Agregar primera nota</button>
          </div>
        }
        @for (n of exp.notas; track n.id) {
          <div class="card mb-3">
            <div style="display:flex;justify-content:space-between;margin-bottom:14px">
              <div>
                <div style="font-weight:600;font-size:.95rem">Nota de evolución</div>
                <div class="xs muted">{{ formatFecha(n.fecha) }} {{ n.hora }} — {{ n.medicoNombre }}, Cédula {{ n.medicoCedula }}</div>
              </div>
              @if (n.peso) {
                <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                  <span class="badge b-gray">{{ n.peso }} kg</span>
                  <span class="badge b-gray">{{ n.talla }} cm</span>
                  <span class="badge b-gray">IMC {{ n.imc }}</span>
                  @if (n.tensionArterial) { <span class="badge b-blue">TA {{ n.tensionArterial }}</span> }
                  @if (n.saturacionO2) { <span class="badge b-teal">SpO₂ {{ n.saturacionO2 }}%</span> }
                </div>
              }
            </div>
            <div class="g2" style="gap:10px">
              <div class="soap"><div class="soap-tag" style="color:var(--primary)">S — Subjetivo</div><p class="sm" style="line-height:1.55">{{ n.motivoConsulta }}</p></div>
              <div class="soap"><div class="soap-tag" style="color:#0A7A64">O — Objetivo</div><p class="sm" style="line-height:1.55">{{ n.exploracionFisica }}</p></div>
              <div class="soap" style="background:var(--primary-lt)"><div class="soap-tag" style="color:var(--primary-dk)">A — Diagnóstico</div><p class="sm" style="font-weight:500;color:var(--primary-dk);line-height:1.45">{{ n.diagnostico }}</p></div>
              <div class="soap" style="background:var(--accent-lt)"><div class="soap-tag" style="color:#0A7A64">P — Plan</div><p class="sm" style="line-height:1.55">{{ n.plan }}</p></div>
            </div>
          </div>
        }
      }

      <!-- Recetas -->
      @if (tab === 'recetas') {
        @if (exp.recetas.length === 0) {
          <div class="empty">
            <div class="empty-ico"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <h3>Sin recetas</h3>
            <button class="btn btn-primary btn-sm mt-2" type="button" (click)="modalReceta = true">Emitir primera receta</button>
          </div>
        }
        @for (rx of exp.recetas; track rx.id) {
          <div class="card mb-3">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
              <div>
                <span class="chip" style="background:var(--primary-lt);color:var(--primary)">{{ rx.folio }}</span>
                <div class="xs muted" style="margin-top:4px">{{ formatFecha(rx.fecha) }} — {{ rx.firmadoPor }}, Cédula {{ rx.cedula }}</div>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <span class="badge" [class.b-amber]="!rx.impresa" [class.b-green]="rx.impresa">{{ rx.impresa ? 'Impresa' : 'Pendiente' }}</span>
                <button class="btn btn-secondary btn-sm" type="button" (click)="marcarImpresa(rx)">
                  <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Imprimir
                </button>
              </div>
            </div>
            <div class="mb-2">
              <div class="ilbl">Diagnóstico</div>
              <p class="sm" style="font-weight:500;color:var(--g800);margin-top:3px">{{ rx.diagnostico }}</p>
            </div>
            <div class="mb-2">
              <div class="ilbl" style="margin-bottom:6px">Medicamentos</div>
              @for (med of rx.medicamentos; track med.nombre) {
                <div style="display:flex;gap:10px;padding:9px 12px;background:var(--g50);border-radius:var(--r);margin-bottom:6px">
                  <div class="av av-sm av-blue" style="flex-shrink:0">Rx</div>
                  <div>
                    <div class="sm" style="font-weight:600;color:var(--g900)">{{ med.nombre }} — {{ med.presentacion }}</div>
                    <div class="xs muted">{{ med.dosis }} · {{ med.duracion }} · Vía {{ med.viaAdministracion }}</div>
                  </div>
                </div>
              }
            </div>
            @if (rx.indicaciones) {
              <div><div class="ilbl">Indicaciones</div><p class="sm" style="margin-top:3px;line-height:1.55">{{ rx.indicaciones }}</p></div>
            }
          </div>
        }
      }

      <!-- Labs -->
      @if (tab === 'labs') {
        <div class="empty">
          <div class="empty-ico"><svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h10m0-11v11"/></svg></div>
          <h3>Sin resultados de laboratorio</h3>
          <p>Aquí aparecerán los estudios del paciente</p>
        </div>
      }
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

<!-- Modal nueva nota SOAP -->
@if (modalNota) {
  <div class="backdrop" (click)="closeOnBackdrop($event)">
    <div class="modal modal-xl">
      <div class="m-head">
        <h3>Nueva nota de evolución — {{ pac?.nombre }} {{ pac?.apellidoPaterno }}</h3>
        <button class="close-btn" type="button" (click)="modalNota = false">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="m-body">
        <div class="sec">Signos vitales</div>
        <div class="fr5 mb-3">
          <div class="fg"><label class="lbl">Peso (kg)</label><input type="number" class="fc" [(ngModel)]="nn.peso" (ngModelChange)="calcImc()" placeholder="70"></div>
          <div class="fg"><label class="lbl">Talla (cm)</label><input type="number" class="fc" [(ngModel)]="nn.talla" (ngModelChange)="calcImc()" placeholder="170"></div>
          <div class="fg"><label class="lbl">IMC</label><input class="fc" [value]="imcVal || '—'" disabled></div>
          <div class="fg"><label class="lbl">Temp. °C</label><input type="number" class="fc" [(ngModel)]="nn.temperatura" placeholder="36.5"></div>
          <div class="fg"><label class="lbl">T.A. mmHg</label><input class="fc" [(ngModel)]="nn.tensionArterial" placeholder="120/80"></div>
          <div class="fg"><label class="lbl">FC lpm</label><input type="number" class="fc" [(ngModel)]="nn.frecuenciaCardiaca" placeholder="80"></div>
          <div class="fg"><label class="lbl">FR rpm</label><input type="number" class="fc" [(ngModel)]="nn.frecuenciaRespiratoria" placeholder="16"></div>
          <div class="fg"><label class="lbl">SpO₂ %</label><input type="number" class="fc" [(ngModel)]="nn.saturacionO2" placeholder="98"></div>
        </div>
        <div class="sec">Nota SOAP (NOM-004)</div>
        <div class="g2" style="gap:12px">
          <div class="fg">
            <label class="lbl" style="color:var(--primary)">S — Motivo / Subjetivo <span class="req">*</span></label>
            <textarea class="fc" style="min-height:90px" [(ngModel)]="nn.motivoConsulta" placeholder="¿Qué refiere el paciente?…"></textarea>
          </div>
          <div class="fg">
            <label class="lbl" style="color:#0A7A64">O — Exploración / Objetivo <span class="req">*</span></label>
            <textarea class="fc" style="min-height:90px" [(ngModel)]="nn.exploracionFisica" placeholder="Hallazgos físicos, signos…"></textarea>
          </div>
          <div class="fg">
            <label class="lbl" style="color:var(--primary-dk)">A — Diagnóstico <span class="req">*</span></label>
            <textarea class="fc" style="min-height:90px" [(ngModel)]="nn.diagnostico" placeholder="CIE-10 recomendado…"></textarea>
          </div>
          <div class="fg">
            <label class="lbl" style="color:#0A7A64">P — Plan <span class="req">*</span></label>
            <textarea class="fc" style="min-height:90px" [(ngModel)]="nn.plan" placeholder="Medicamentos, estudios…"></textarea>
          </div>
        </div>
        <div class="fr2">
          <div class="fg">
            <label class="lbl">Médico <span class="req">*</span></label>
            <select class="fc" [(ngModel)]="nn.medicoId">
              <option [ngValue]="0">— Seleccionar —</option>
              @for (m of medicos; track m.id) {
                <option [ngValue]="m.id">Dr. {{ m.nombreCompleto }} — {{ m.especialidad }}</option>
              }
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Cédula profesional</label>
            <input class="fc" [value]="cedulaSelected" disabled>
          </div>
        </div>
        @if (errorNota) { <p style="color:var(--danger);font-size:.85rem;margin-top:8px">{{ errorNota }}</p> }
      </div>
      <div class="m-foot">
        <button class="btn btn-secondary" type="button" (click)="modalNota = false">Cancelar</button>
        <button class="btn btn-primary" type="button" (click)="guardarNota()" [disabled]="!notaValida() || guardandoNota">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          {{ guardandoNota ? 'Guardando…' : 'Guardar nota' }}
        </button>
      </div>
    </div>
  </div>
}

<!-- Modal nueva receta -->
@if (modalReceta) {
  <div class="backdrop" (click)="closeOnBackdrop($event)">
    <div class="modal modal-lg">
      <div class="m-head">
        <h3>Nueva receta — {{ pac?.nombre }} {{ pac?.apellidoPaterno }}</h3>
        <button class="close-btn" type="button" (click)="modalReceta = false">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="m-body">
        <div class="fg">
          <label class="lbl">Diagnóstico <span class="req">*</span></label>
          <input class="fc" [(ngModel)]="nr.diagnostico" placeholder="Diagnóstico principal…">
        </div>
        <div class="fg">
          <label class="lbl">Médico <span class="req">*</span></label>
          <select class="fc" [(ngModel)]="nr.medicoId">
            <option [ngValue]="0">— Seleccionar —</option>
            @for (m of medicos; track m.id) {
              <option [ngValue]="m.id">Dr. {{ m.nombreCompleto }}</option>
            }
          </select>
        </div>
        <div class="sec mt-2">Medicamentos</div>
        @for (med of nr.medicamentos; track med; let i = $index) {
          <div style="background:var(--g50);border-radius:var(--r);padding:12px;margin-bottom:8px;position:relative">
            <button type="button" (click)="quitarMed(i)" style="position:absolute;top:6px;right:8px;background:none;border:none;cursor:pointer;color:var(--g400);font-size:16px">×</button>
            <div class="fr2">
              <div class="fg" style="margin-bottom:8px"><label class="lbl">Nombre</label><input class="fc" [(ngModel)]="med.nombre" placeholder="Amoxicilina"></div>
              <div class="fg" style="margin-bottom:8px"><label class="lbl">Presentación</label><input class="fc" [(ngModel)]="med.presentacion" placeholder="Cápsulas 500mg"></div>
            </div>
            <div class="fr3">
              <div class="fg" style="margin-bottom:0"><label class="lbl">Dosis</label><input class="fc" [(ngModel)]="med.dosis" placeholder="1 cáp. cada 8h"></div>
              <div class="fg" style="margin-bottom:0"><label class="lbl">Duración</label><input class="fc" [(ngModel)]="med.duracion" placeholder="7 días"></div>
              <div class="fg" style="margin-bottom:0">
                <label class="lbl">Vía</label>
                <select class="fc" [(ngModel)]="med.viaAdministracion">
                  <option>Oral</option><option>IM</option><option>IV</option><option>Sublingual</option><option>Tópico</option><option>Inhalado</option>
                </select>
              </div>
            </div>
          </div>
        }
        <button class="btn btn-secondary btn-sm" type="button" (click)="agregarMed()">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar medicamento
        </button>
        <div class="fg mt-3">
          <label class="lbl">Indicaciones generales</label>
          <textarea class="fc" [(ngModel)]="nr.indicaciones" placeholder="Instrucciones para el paciente…"></textarea>
        </div>
        @if (errorReceta) { <p style="color:var(--danger);font-size:.85rem;margin-top:8px">{{ errorReceta }}</p> }
      </div>
      <div class="m-foot">
        <button class="btn btn-secondary" type="button" (click)="modalReceta = false">Cancelar</button>
        <button class="btn btn-primary" type="button" (click)="guardarReceta()" [disabled]="guardandoReceta">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          {{ guardandoReceta ? 'Emitiendo…' : 'Emitir receta' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class ExpedienteComponent implements OnInit {
  exp?: ExpedienteDTO;
  pac?: PacienteDetalleDTO;
  medicos:   UsuarioDTO[] = [];
  tab: 'notas' | 'recetas' | 'labs' = 'notas';
  cargando     = true;
  modalNota    = false;
  modalReceta  = false;
  guardandoNota   = false;
  guardandoReceta = false;
  errorNota    = '';
  errorReceta  = '';
  imcVal?: number;

  nn: NotaCreateDTO = { medicoId: 0, motivoConsulta: '', exploracionFisica: '', diagnostico: '', plan: '' };
  nr: RecetaCreateDTO & { indicaciones?: string } = { medicoId: 0, diagnostico: '', indicaciones: '', medicamentos: [this.medVacio()] };

  get tieneAlergia(): boolean {
    const a = this.pac?.alergias ?? '';
    return !!a && a !== 'Ninguna' && a !== 'Ninguna conocida';
  }

  get cedulaSelected(): string {
    return this.medicos.find(m => m.id === this.nn.medicoId)?.cedula ?? '';
  }

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.api.getExpediente(id).subscribe({
      next: e => { this.exp = e; this.pac = e.paciente; this.cargando = false; },
      error: () => this.cargando = false,
    });
    this.api.getMedicos().subscribe({ next: ms => this.medicos = ms });
  }

  calcImc(): void {
    if (this.nn.peso && this.nn.talla) {
      this.imcVal = Math.round((this.nn.peso / Math.pow((this.nn.talla as number) / 100, 2)) * 10) / 10;
    }
  }

  notaValida(): boolean {
    return !!(this.nn.motivoConsulta && this.nn.exploracionFisica && this.nn.diagnostico && this.nn.plan && this.nn.medicoId > 0);
  }

  guardarNota(): void {
    if (!this.notaValida() || !this.exp) return;
    this.guardandoNota = true;
    this.errorNota     = '';
    this.api.createNota(this.exp.pacienteId, this.nn).subscribe({
      next: nota => {
        this.exp!.notas.unshift(nota);
        this.modalNota     = false;
        this.guardandoNota = false;
        this.nn = { medicoId: 0, motivoConsulta: '', exploracionFisica: '', diagnostico: '', plan: '' };
        this.imcVal = undefined;
      },
      error: (e) => { this.errorNota = e?.error?.message ?? 'Error al guardar nota'; this.guardandoNota = false; },
    });
  }

  medVacio(): MedicamentoDTO {
    return { nombre: '', presentacion: '', dosis: '', duracion: '', cantidad: 1, viaAdministracion: 'Oral' };
  }

  agregarMed(): void { this.nr.medicamentos.push(this.medVacio()); }
  quitarMed(i: number): void { this.nr.medicamentos.splice(i, 1); }

  guardarReceta(): void {
    if (!this.exp || !this.nr.diagnostico) return;
    this.guardandoReceta = true;
    this.errorReceta     = '';
    const dto: RecetaCreateDTO = {
      medicoId:     this.nr.medicoId,
      diagnostico:  this.nr.diagnostico,
      indicaciones: this.nr.indicaciones ?? '',
      medicamentos: this.nr.medicamentos.filter(m => !!m.nombre),
    };
    this.api.createReceta(this.exp.pacienteId, dto).subscribe({
      next: rx => {
        this.exp!.recetas.unshift(rx);
        this.modalReceta     = false;
        this.guardandoReceta = false;
        this.nr = { medicoId: 0, diagnostico: '', indicaciones: '', medicamentos: [this.medVacio()] };
      },
      error: (e) => { this.errorReceta = e?.error?.message ?? 'Error al emitir receta'; this.guardandoReceta = false; },
    });
  }

  marcarImpresa(rx: RecetaDTO): void {
    this.api.marcarRecetaImpresa(rx.id, true).subscribe({
      next: updated => { rx.impresa = updated.impresa; window.print(); },
    });
  }

  closeOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      this.modalNota = false; this.modalReceta = false;
    }
  }

  formatFecha(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
  }
}
