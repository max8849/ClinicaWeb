import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule }       from '@angular/forms';
import { ApiService }        from '../../core/services/api.service';
import { ToastService }      from '../../core/services/toast.service';
import { PacienteListDTO, PacienteCreateDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="page fade-in">

  <div class="ph">
    <div>
      <h1>Pacientes</h1>
      <p>{{ total }} registros</p>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" type="button" (click)="abrirModal()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo paciente
      </button>
    </div>
  </div>

  <div class="filtros-row">
    <div class="search" style="flex:1;min-width:200px">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="fc" placeholder="Buscar nombre, folio o teléfono…" [(ngModel)]="q" (ngModelChange)="buscar()">
    </div>
    <select class="fc" style="min-width:130px;flex:1;max-width:180px" [(ngModel)]="fSexo" (ngModelChange)="buscar()">
      <option value="">Todos</option>
      <option value="F">Femenino</option>
      <option value="M">Masculino</option>
    </select>
  </div>

  @if (cargando) {
    <div class="empty" style="padding:60px"><div class="sm muted">Cargando pacientes…</div></div>
  } @else {
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Folio</th><th>Paciente</th><th>Edad / Sexo</th><th>Teléfono</th><th>Alergias</th><th>Última consulta</th><th>Consultas</th><th></th></tr>
        </thead>
        <tbody>
          @for (p of pacientes; track p.id) {
            <tr style="cursor:pointer" [routerLink]="['/pacientes', p.id]">
              <td><span class="chip">{{ p.folio }}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="av av-sm" [class.av-blue]="p.sexo === 'F'" [class.av-green]="p.sexo === 'M'">
                    {{ p.nombre[0] }}{{ p.apellidoPaterno[0] }}
                  </div>
                  <div>
                    <div style="font-weight:500;color:var(--g900)">{{ p.nombre }} {{ p.apellidoPaterno }} {{ p.apellidoMaterno }}</div>
                    <div class="xs muted">{{ p.email || '—' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span style="font-weight:500">{{ p.edad }}</span>
                <span class="muted sm"> años</span>
                <span class="badge sm" [class.b-blue]="p.sexo === 'F'" [class.b-teal]="p.sexo === 'M'" style="margin-left:6px;font-size:.68rem">
                  {{ p.sexo }}
                </span>
              </td>
              <td class="sm">{{ p.telefono }}</td>
              <td>
                @if (tieneAlergia(p)) {
                  <span class="badge b-red">{{ p.alergias }}</span>
                } @else {
                  <span class="sm muted">Ninguna</span>
                }
              </td>
              <td class="sm muted">{{ p.ultimaConsulta ? formatFecha(p.ultimaConsulta) : '—' }}</td>
              <td style="text-align:center;font-weight:600">{{ p.totalConsultas }}</td>
              <td>
                <a class="btn btn-ghost btn-sm btn-icon" [routerLink]="['/expediente', p.id]" title="Ver expediente" (click)="$event.stopPropagation()">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </a>
              </td>
            </tr>
          }
          @empty {
            <tr><td colspan="8">
              <div class="empty">
                <div class="empty-ico"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                <h3>Sin resultados</h3>
              </div>
            </td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (totalPaginas > 1) {
      <div style="display:flex;justify-content:center;gap:8px;margin-top:18px">
        <button class="btn btn-ghost btn-sm" [disabled]="page === 1" (click)="irPagina(page - 1)" type="button">← Anterior</button>
        <span class="sm muted" style="padding:6px 12px">Pág. {{ page }} / {{ totalPaginas }}</span>
        <button class="btn btn-ghost btn-sm" [disabled]="page === totalPaginas" (click)="irPagina(page + 1)" type="button">Siguiente →</button>
      </div>
    }
  }

</div>

@if (modal) {
  <div class="backdrop" (click)="closeOnBackdrop($event)">
    <div class="modal modal-lg">
      <div class="m-head">
        <h3>Registrar nuevo paciente</h3>
        <button class="close-btn" type="button" (click)="modal = false">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="m-body">
        <div class="sec">Datos de identificación</div>
        <div class="fr3">
          <div class="fg"><label class="lbl">Nombre(s) <span class="req">*</span></label><input class="fc" [(ngModel)]="np.nombre" placeholder="María"></div>
          <div class="fg"><label class="lbl">Apellido paterno <span class="req">*</span></label><input class="fc" [(ngModel)]="np.apellidoPaterno" placeholder="García"></div>
          <div class="fg"><label class="lbl">Apellido materno</label><input class="fc" [(ngModel)]="np.apellidoMaterno" placeholder="López"></div>
        </div>
        <div class="fr2">
          <div class="fg"><label class="lbl">Fecha de nacimiento <span class="req">*</span></label><input type="date" class="fc" [(ngModel)]="np.fechaNacimiento"></div>
          <div class="fg">
            <label class="lbl">Sexo <span class="req">*</span></label>
            <select class="fc" [(ngModel)]="np.sexo"><option value="F">Femenino</option><option value="M">Masculino</option></select>
          </div>
        </div>
        <div class="fr2">
          <div class="fg"><label class="lbl">CURP</label><input class="fc" [(ngModel)]="np.curp" placeholder="AAAA000000HNTRRR00" style="text-transform:uppercase"></div>
          <div class="fg">
            <label class="lbl">Grupo sanguíneo</label>
            <select class="fc" [(ngModel)]="np.grupoSanguineo">
              <option value="">—</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
            </select>
          </div>
        </div>
        <div class="sec mt-2">Contacto</div>
        <div class="fr2">
          <div class="fg"><label class="lbl">Teléfono <span class="req">*</span></label><input class="fc" [(ngModel)]="np.telefono" placeholder="81-0000-0000"></div>
          <div class="fg"><label class="lbl">Email</label><input type="email" class="fc" [(ngModel)]="np.email" placeholder="correo@email.com"></div>
        </div>
        <div class="fr2">
          <div class="fg"><label class="lbl">Domicilio</label><input class="fc" [(ngModel)]="np.domicilio" placeholder="Calle y número"></div>
          <div class="fg"><label class="lbl">Colonia</label><input class="fc" [(ngModel)]="np.colonia" placeholder="Colonia"></div>
        </div>
        <div class="sec mt-2">Antecedentes clínicos (NOM-004)</div>
        <div class="fg"><label class="lbl">Alergias</label><input class="fc" [(ngModel)]="np.alergias" placeholder="Penicilina, sulfas… o 'Ninguna conocida'"></div>
        <div class="fg"><label class="lbl">Antecedentes hereditarios y familiares</label><textarea class="fc" [(ngModel)]="np.antecedentesHF"></textarea></div>
        <div class="fg"><label class="lbl">Antecedentes no patológicos</label><textarea class="fc" [(ngModel)]="np.antecedentesNP"></textarea></div>
        <div class="fg"><label class="lbl">Antecedentes patológicos</label><textarea class="fc" [(ngModel)]="np.antecedentesPatologicos"></textarea></div>
        @if (errorModal) {
          <p style="color:var(--danger);font-size:.85rem;margin-top:8px">{{ errorModal }}</p>
        }
      </div>
      <div class="m-foot">
        <button class="btn btn-secondary" type="button" (click)="modal = false">Cancelar</button>
        <button class="btn btn-primary" type="button" (click)="guardar()" [disabled]="!valida() || guardando">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          {{ guardando ? 'Registrando…' : 'Registrar' }}
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class PacientesComponent implements OnInit {
  pacientes:    PacienteListDTO[] = [];
  total         = 0;
  page          = 1;
  pageSize      = 20;
  totalPaginas  = 1;
  cargando      = true;
  guardando     = false;
  errorModal    = '';
  q             = '';
  fSexo         = '';
  modal         = false;

  np: PacienteCreateDTO = { nombre:'', apellidoPaterno:'', fechaNacimiento:'', sexo:'F', telefono:'' };

  constructor(private api: ApiService, private toast: ToastService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) this.q = q;
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    this.api.getPacientes({ q: this.q || undefined, sexo: this.fSexo || undefined, page: this.page, pageSize: this.pageSize }).subscribe({
      next: r => { this.pacientes = r.items; this.total = r.totalCount; this.totalPaginas = r.totalPages; this.cargando = false; },
      error: () => this.cargando = false,
    });
  }

  irPagina(p: number): void { this.page = p; this.buscar(); }

  tieneAlergia(p: PacienteListDTO): boolean {
    return !!p.alergias && p.alergias !== 'Ninguna' && p.alergias !== 'Ninguna conocida';
  }

  abrirModal(): void {
    this.np = { nombre:'', apellidoPaterno:'', fechaNacimiento:'', sexo:'F', telefono:'' };
    this.errorModal = '';
    this.modal = true;
  }

  valida(): boolean {
    return !!(this.np.nombre && this.np.apellidoPaterno && this.np.fechaNacimiento && this.np.telefono);
  }

  guardar(): void {
    if (!this.valida() || this.guardando) return;
    this.guardando  = true;
    this.errorModal = '';
    this.api.createPaciente(this.np).subscribe({
      next: () => {
        this.modal = false; this.guardando = false; this.page = 1; this.buscar();
        this.toast.success('Paciente registrado correctamente');
      },
      error: (e) => {
        this.errorModal = e?.error?.message ?? 'Error al registrar paciente';
        this.toast.error(this.errorModal);
        this.guardando = false;
      },
    });
  }

  closeOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('backdrop')) this.modal = false;
  }

  formatFecha(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
  }
}
