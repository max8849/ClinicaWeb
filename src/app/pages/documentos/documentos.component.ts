import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { ActivatedRoute }    from '@angular/router';
import { ApiService }        from '../../core/services/api.service';
import { AuthService }       from '../../core/services/auth.service';
import { PacienteDetalleDTO, UsuarioDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    /* ── Pantalla ── */
    .doc-grid { display:grid; grid-template-columns:280px 1fr; gap:20px; align-items:start; }
    .doc-list { display:flex; flex-direction:column; gap:6px; }
    .doc-item {
      display:flex; align-items:center; gap:10px; padding:12px 14px;
      border-radius:var(--r); border:1px solid var(--border); cursor:pointer;
      transition: all .15s; background:var(--white);
    }
    .doc-item:hover { border-color:var(--primary); }
    .doc-item.active { background:var(--primary-lt); border-color:var(--primary); }
    .doc-item .doc-ico {
      width:36px; height:36px; border-radius:8px; display:flex;
      align-items:center; justify-content:center; flex-shrink:0;
    }
    .doc-preview {
      background:var(--white); border:1px solid var(--border); border-radius:var(--rl);
      padding:48px 56px; min-height:700px; position:relative;
    }

    /* ── Impresión ── */
    @media print {
      .no-print { display:none !important; }
      .doc-grid { display:block !important; }
      .doc-list { display:none !important; }
      .doc-preview {
        border:none !important; padding:20px !important;
        box-shadow:none !important; min-height:auto !important;
      }
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }

    /* ── Estilos del documento ── */
    .doc-header { text-align:center; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid var(--g200); }
    .doc-header h2 { font-size:1.1rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--g900); margin:0; }
    .doc-header .sub { font-size:.78rem; color:var(--g500); margin-top:4px; }
    .doc-section { margin-bottom:20px; }
    .doc-section h3 { font-size:.82rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; color:var(--primary); margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid var(--g100); }
    .doc-field { display:flex; gap:6px; margin-bottom:8px; font-size:.85rem; line-height:1.6; }
    .doc-field .label { font-weight:600; color:var(--g700); min-width:140px; flex-shrink:0; }
    .doc-field .value { color:var(--g900); border-bottom:1px solid var(--g300); flex:1; min-height:1.5em; }
    .doc-body { font-size:.82rem; line-height:1.75; color:var(--g800); text-align:justify; }
    .doc-body p { margin-bottom:12px; }
    .doc-firma { margin-top:60px; display:flex; justify-content:space-between; gap:40px; }
    .firma-box { text-align:center; flex:1; }
    .firma-line { border-top:1px solid var(--g900); margin-top:60px; padding-top:8px; font-size:.8rem; font-weight:600; color:var(--g700); }
    .firma-sub { font-size:.72rem; color:var(--g500); margin-top:2px; }

    .doc-field-editable {
      border:1px dashed var(--g300); border-radius:4px; padding:4px 8px;
      min-height:1.5em; flex:1; font-size:.85rem; outline:none;
      transition:border-color .15s;
    }
    .doc-field-editable:focus { border-color:var(--primary); }

    @media(max-width:768px) {
      .doc-grid { grid-template-columns:1fr; }
      .doc-preview { padding:24px 20px; }
    }
  `],
  template: `
<div class="page fade-in">

  <div class="ph no-print">
    <div>
      <h1>Documentos</h1>
      <p>Formatos e impresos clínicos</p>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" type="button" (click)="imprimir()">
        <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Imprimir
      </button>
    </div>
  </div>

  <!-- Selector de paciente -->
  <div class="no-print" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:flex-end">
    <div class="fg" style="margin:0;flex:1;max-width:340px">
      <label class="lbl">Paciente</label>
      <div class="search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="fc" placeholder="Buscar paciente…" [(ngModel)]="qPaciente" (ngModelChange)="filtrarPacientes()">
      </div>
    </div>
    @if (pacientesFiltrados.length > 0 && qPaciente && !paciente) {
      <div style="position:relative;flex:1;max-width:340px">
        <div style="position:absolute;top:0;left:0;right:0;background:white;border:1px solid var(--border);border-radius:var(--r);max-height:200px;overflow-y:auto;z-index:10;box-shadow:var(--sh-lg)">
          @for (p of pacientesFiltrados; track p.id) {
            <div style="padding:10px 14px;cursor:pointer;font-size:.85rem;border-bottom:1px solid var(--g50)" (click)="seleccionarPaciente(p)">
              <strong>{{ p.nombre }} {{ p.apellidoPaterno }}</strong>
              <span class="muted" style="margin-left:8px">{{ p.folio }}</span>
            </div>
          }
        </div>
      </div>
    }
    @if (paciente) {
      <div style="display:flex;align-items:center;gap:8px;background:var(--primary-lt);padding:6px 14px;border-radius:var(--r)">
        <span style="font-size:.85rem;font-weight:500;color:var(--primary)">{{ paciente.nombre }} {{ paciente.apellidoPaterno }} {{ paciente.apellidoMaterno }}</span>
        <button style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:16px;font-weight:bold" (click)="limpiarPaciente()">×</button>
      </div>
    }
  </div>

  <div class="doc-grid">

    <!-- Lista de documentos -->
    <div class="doc-list no-print">
      @for (doc of documentos; track doc.id) {
        <div class="doc-item" [class.active]="docActivo === doc.id" (click)="docActivo = doc.id">
          <div class="doc-ico" [style.background]="doc.color + '20'" [style.color]="doc.color">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              @if (doc.icon === 'file-text') {
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              }
              @if (doc.icon === 'shield') {
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              }
              @if (doc.icon === 'clipboard') {
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
              }
              @if (doc.icon === 'heart') {
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              }
              @if (doc.icon === 'alert') {
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              }
            </svg>
          </div>
          <div>
            <div style="font-size:.83rem;font-weight:600;color:var(--g800)">{{ doc.nombre }}</div>
            <div style="font-size:.7rem;color:var(--g400)">{{ doc.desc }}</div>
          </div>
        </div>
      }
    </div>

    <!-- Preview del documento -->
    <div class="doc-preview">

      <!-- ═══════ CONSENTIMIENTO INFORMADO ═══════ -->
      @if (docActivo === 'consentimiento') {
        <div class="doc-header">
          <h2>Consentimiento informado para tratamiento odontológico</h2>
          <div class="sub">{{ clinicaNombre }} · {{ clinicaDireccion }}</div>
        </div>
        <div class="doc-section">
          <h3>Datos del paciente</h3>
          <div class="doc-field"><span class="label">Nombre completo:</span><span class="value">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno + ' ' + (paciente.apellidoMaterno || '')) : '' }}</span></div>
          <div class="doc-field"><span class="label">Fecha de nacimiento:</span><span class="value">{{ paciente ? formatFecha(paciente.fechaNacimiento) : '' }}</span></div>
          <div class="doc-field"><span class="label">Edad:</span><span class="value">{{ paciente ? paciente.edad + ' años' : '' }}</span></div>
          <div class="doc-field"><span class="label">Teléfono:</span><span class="value">{{ paciente?.telefono || '' }}</span></div>
          <div class="doc-field"><span class="label">CURP:</span><span class="value">{{ paciente?.curp || '' }}</span></div>
        </div>
        <div class="doc-section">
          <h3>Declaración de consentimiento</h3>
          <div class="doc-body">
            <p>Yo, <strong>{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno + ' ' + (paciente.apellidoMaterno || '')) : '________________________________' }}</strong>, por medio del presente documento declaro que:</p>
            <p>1. He sido informado(a) de manera clara y suficiente sobre el diagnóstico, el tratamiento odontológico propuesto, las alternativas terapéuticas, los riesgos inherentes al procedimiento y las posibles complicaciones.</p>
            <p>2. He tenido la oportunidad de hacer todas las preguntas necesarias y estas han sido respondidas a mi entera satisfacción por el profesional odontológico tratante.</p>
            <p>3. Comprendo que todo procedimiento odontológico conlleva riesgos que incluyen, pero no se limitan a: dolor, inflamación, infección, sangrado, reacciones alérgicas, daño a estructuras adyacentes, y resultados estéticos que pueden variar.</p>
            <p>4. Comprendo que los resultados del tratamiento dependen de diversos factores, incluyendo mi colaboración en el cumplimiento de las indicaciones postoperatorias y citas de seguimiento.</p>
            <p>5. Autorizo la toma de fotografías clínicas y radiografías necesarias para el diagnóstico y seguimiento de mi tratamiento, mismas que serán manejadas con estricta confidencialidad.</p>
            <p>6. Manifiesto que la información proporcionada sobre mi historia clínica y antecedentes médicos es veraz y completa. Reconozco que ocultar información puede afectar el resultado del tratamiento y poner en riesgo mi salud.</p>
            <p>7. Entiendo que tengo el derecho de revocar este consentimiento en cualquier momento, previo a la realización del procedimiento, sin que esto afecte mi relación con el profesional tratante.</p>
          </div>
        </div>
        <div class="doc-section">
          <h3>Procedimiento(s) autorizado(s)</h3>
          <div class="doc-field">
            <span class="label">Tratamiento:</span>
            <span class="doc-field-editable" contenteditable="true" data-placeholder="Describir procedimiento…"></span>
          </div>
          <div class="doc-field" style="margin-top:10px">
            <span class="label">Observaciones:</span>
            <span class="doc-field-editable" contenteditable="true" data-placeholder="Observaciones adicionales…"></span>
          </div>
        </div>
        <div class="doc-field" style="margin-top:24px"><span class="label">Fecha:</span><span class="value">{{ fechaHoy }}</span></div>
        <div class="doc-firma">
          <div class="firma-box">
            <div class="firma-line">Firma del paciente</div>
            <div class="firma-sub">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno) : 'Nombre del paciente' }}</div>
          </div>
          <div class="firma-box">
            <div class="firma-line">Firma del odontólogo</div>
            <div class="firma-sub">{{ medicoLogueado }}</div>
          </div>
          <div class="firma-box">
            <div class="firma-line">Testigo</div>
            <div class="firma-sub">Nombre y firma</div>
          </div>
        </div>
      }

      <!-- ═══════ CARTA RESPONSIVA ═══════ -->
      @if (docActivo === 'responsiva') {
        <div class="doc-header">
          <h2>Carta de responsabilidad y deslinde</h2>
          <div class="sub">{{ clinicaNombre }} · {{ clinicaDireccion }}</div>
        </div>
        <div class="doc-section">
          <h3>Datos del paciente</h3>
          <div class="doc-field"><span class="label">Nombre completo:</span><span class="value">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno + ' ' + (paciente.apellidoMaterno || '')) : '' }}</span></div>
          <div class="doc-field"><span class="label">Edad:</span><span class="value">{{ paciente ? paciente.edad + ' años' : '' }}</span></div>
          <div class="doc-field"><span class="label">Teléfono:</span><span class="value">{{ paciente?.telefono || '' }}</span></div>
          <div class="doc-field"><span class="label">Domicilio:</span><span class="value">{{ paciente?.domicilio || '' }} {{ paciente?.colonia || '' }}</span></div>
        </div>
        <div class="doc-section">
          <div class="doc-body">
            <p>Por medio de la presente, yo <strong>{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno + ' ' + (paciente.apellidoMaterno || '')) : '________________________________' }}</strong>, mayor de edad, en pleno uso de mis facultades mentales y por mi propia voluntad, manifiesto lo siguiente:</p>
            <p>1. Que acudo a <strong>{{ clinicaNombre }}</strong> para recibir tratamiento odontológico de manera voluntaria.</p>
            <p>2. Que he sido informado(a) sobre los procedimientos, riesgos y alternativas de tratamiento por el profesional dental a cargo.</p>
            <p>3. Que acepto y me comprometo a seguir todas las indicaciones médicas pre y postoperatorias proporcionadas por el odontólogo tratante, y entiendo que el incumplimiento de las mismas puede afectar los resultados del tratamiento.</p>
            <p>4. Que asumo la responsabilidad de informar de manera veraz y completa sobre mi estado de salud general, medicamentos que consumo, alergias y cualquier otra condición que pueda afectar el tratamiento.</p>
            <p>5. Que eximo de toda responsabilidad a <strong>{{ clinicaNombre }}</strong> y a su equipo profesional por cualquier complicación derivada de: información médica incompleta o falsa proporcionada por mi persona, incumplimiento de las indicaciones postoperatorias, inasistencia a citas de seguimiento, o uso inadecuado de prótesis, aparatos u otros dispositivos proporcionados.</p>
            <p>6. Que autorizo la realización de los procedimientos odontológicos acordados y que entiendo que los procedimientos se realizarán conforme a la normatividad sanitaria vigente.</p>
            <p>7. Reconozco haber leído y comprendido la totalidad de este documento, firmando de conformidad.</p>
          </div>
        </div>
        <div class="doc-field" style="margin-top:24px"><span class="label">Fecha y lugar:</span><span class="value">{{ clinicaCiudad }}, a {{ fechaHoy }}</span></div>
        <div class="doc-firma">
          <div class="firma-box">
            <div class="firma-line">Firma del paciente o tutor</div>
            <div class="firma-sub">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno) : 'Nombre' }}</div>
          </div>
          <div class="firma-box">
            <div class="firma-line">Testigo 1</div>
            <div class="firma-sub">Nombre y firma</div>
          </div>
          <div class="firma-box">
            <div class="firma-line">Testigo 2</div>
            <div class="firma-sub">Nombre y firma</div>
          </div>
        </div>
      }

      <!-- ═══════ HISTORIA CLÍNICA DENTAL ═══════ -->
      @if (docActivo === 'historia') {
        <div class="doc-header">
          <h2>Historia clínica odontológica</h2>
          <div class="sub">{{ clinicaNombre }} · Conforme a NOM-004-SSA3-2012</div>
        </div>
        <div class="doc-section">
          <h3>I. Ficha de identificación</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px">
            <div class="doc-field"><span class="label">Nombre:</span><span class="value">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno + ' ' + (paciente.apellidoMaterno || '')) : '' }}</span></div>
            <div class="doc-field"><span class="label">Folio:</span><span class="value">{{ paciente?.folio || '' }}</span></div>
            <div class="doc-field"><span class="label">Fecha nacimiento:</span><span class="value">{{ paciente ? formatFecha(paciente.fechaNacimiento) : '' }}</span></div>
            <div class="doc-field"><span class="label">Edad:</span><span class="value">{{ paciente ? paciente.edad + ' años' : '' }}</span></div>
            <div class="doc-field"><span class="label">Sexo:</span><span class="value">{{ paciente ? (paciente.sexo === 'F' ? 'Femenino' : 'Masculino') : '' }}</span></div>
            <div class="doc-field"><span class="label">Grupo sanguíneo:</span><span class="value">{{ paciente?.grupoSanguineo || '' }}</span></div>
            <div class="doc-field"><span class="label">CURP:</span><span class="value">{{ paciente?.curp || '' }}</span></div>
            <div class="doc-field"><span class="label">Teléfono:</span><span class="value">{{ paciente?.telefono || '' }}</span></div>
            <div class="doc-field"><span class="label">Email:</span><span class="value">{{ paciente?.email || '' }}</span></div>
            <div class="doc-field"><span class="label">Domicilio:</span><span class="value">{{ paciente?.domicilio || '' }} {{ paciente?.colonia || '' }}</span></div>
          </div>
        </div>
        <div class="doc-section">
          <h3>II. Antecedentes heredofamiliares</h3>
          <div class="doc-field"><span class="value" style="min-height:3em">{{ paciente?.antecedentesHF || '' }}</span></div>
        </div>
        <div class="doc-section">
          <h3>III. Antecedentes personales no patológicos</h3>
          <div class="doc-field"><span class="value" style="min-height:3em">{{ paciente?.antecedentesNP || '' }}</span></div>
        </div>
        <div class="doc-section">
          <h3>IV. Antecedentes personales patológicos</h3>
          <div class="doc-field"><span class="value" style="min-height:3em">{{ paciente?.antecedentesPatologicos || '' }}</span></div>
        </div>
        <div class="doc-section">
          <h3>V. Alergias</h3>
          <div class="doc-field"><span class="value" [style.color]="tieneAlergia ? 'var(--danger)' : 'inherit'" [style.font-weight]="tieneAlergia ? '600' : 'normal'">{{ paciente?.alergias || 'Ninguna conocida' }}</span></div>
        </div>
        <div class="doc-section">
          <h3>VI. Motivo de consulta</h3>
          <div class="doc-field"><span class="doc-field-editable" contenteditable="true" data-placeholder="Describir motivo de consulta…"></span></div>
        </div>
        <div class="doc-section">
          <h3>VII. Exploración dental</h3>
          <div class="doc-body">
            <p style="color:var(--g400);font-style:italic">Utilizar odontograma adjunto para registro de hallazgos por pieza dental.</p>
          </div>
          <div class="doc-field"><span class="label">Observaciones:</span><span class="doc-field-editable" contenteditable="true" data-placeholder="Hallazgos relevantes…" style="min-height:4em"></span></div>
        </div>
        <div class="doc-section">
          <h3>VIII. Diagnóstico</h3>
          <div class="doc-field"><span class="doc-field-editable" contenteditable="true" data-placeholder="Diagnósticos…"></span></div>
        </div>
        <div class="doc-section">
          <h3>IX. Plan de tratamiento</h3>
          <div class="doc-field"><span class="doc-field-editable" contenteditable="true" data-placeholder="Plan de tratamiento propuesto…" style="min-height:4em"></span></div>
        </div>
        <div class="doc-field" style="margin-top:24px"><span class="label">Fecha:</span><span class="value">{{ fechaHoy }}</span></div>
        <div class="doc-firma" style="margin-top:40px">
          <div class="firma-box">
            <div class="firma-line">Odontólogo tratante</div>
            <div class="firma-sub">{{ medicoLogueado }}</div>
          </div>
          <div class="firma-box">
            <div class="firma-line">Paciente</div>
            <div class="firma-sub">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno) : '' }}</div>
          </div>
        </div>
      }

      <!-- ═══════ AVISO DE PRIVACIDAD ═══════ -->
      @if (docActivo === 'privacidad') {
        <div class="doc-header">
          <h2>Aviso de privacidad integral</h2>
          <div class="sub">{{ clinicaNombre }}</div>
        </div>
        <div class="doc-section">
          <div class="doc-body">
            <p><strong>{{ clinicaNombre }}</strong>, con domicilio en {{ clinicaDireccion }}, es responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:</p>

            <p><strong>Finalidades del tratamiento de datos:</strong> Sus datos personales serán utilizados para: prestación de servicios de salud dental, elaboración de expediente clínico conforme a la NOM-004-SSA3-2012, agendamiento y seguimiento de citas, emisión de recetas y documentos clínicos, comunicación de información relevante sobre su tratamiento, y facturación de servicios.</p>

            <p><strong>Datos personales recabados:</strong> Para las finalidades anteriores, recabamos los siguientes datos personales: nombre completo, fecha de nacimiento, sexo, CURP, domicilio, teléfono, correo electrónico, y datos sensibles como antecedentes médicos, alergias, grupo sanguíneo e historial clínico dental.</p>

            <p><strong>Datos sensibles:</strong> Le informamos que para cumplir con las finalidades de salud descritas, será necesario tratar datos personales considerados como sensibles, tales como su estado de salud, antecedentes médicos, alergias y datos de su historial clínico. Nos comprometemos a que los mismos serán tratados bajo estrictas medidas de seguridad y confidencialidad.</p>

            <p><strong>Derechos ARCO:</strong> Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, puede comunicarse directamente en la clínica o al correo electrónico que le será proporcionado.</p>

            <p><strong>Consentimiento:</strong> Al firmar este aviso de privacidad, usted otorga su consentimiento para el tratamiento de sus datos personales, incluyendo datos sensibles, conforme a los términos aquí descritos.</p>
          </div>
        </div>
        <div class="doc-field" style="margin-top:24px"><span class="label">Fecha:</span><span class="value">{{ fechaHoy }}</span></div>
        <div class="doc-firma" style="margin-top:40px">
          <div class="firma-box">
            <div class="firma-line">Firma del paciente o tutor</div>
            <div class="firma-sub">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno) : 'Nombre del paciente' }}</div>
          </div>
        </div>
      }

      <!-- ═══════ AUTORIZACIÓN MENORES ═══════ -->
      @if (docActivo === 'menores') {
        <div class="doc-header">
          <h2>Autorización de tratamiento para menores de edad</h2>
          <div class="sub">{{ clinicaNombre }}</div>
        </div>
        <div class="doc-section">
          <h3>Datos del menor</h3>
          <div class="doc-field"><span class="label">Nombre:</span><span class="value">{{ paciente ? (paciente.nombre + ' ' + paciente.apellidoPaterno + ' ' + (paciente.apellidoMaterno || '')) : '' }}</span></div>
          <div class="doc-field"><span class="label">Edad:</span><span class="value">{{ paciente ? paciente.edad + ' años' : '' }}</span></div>
          <div class="doc-field"><span class="label">Fecha de nacimiento:</span><span class="value">{{ paciente ? formatFecha(paciente.fechaNacimiento) : '' }}</span></div>
        </div>
        <div class="doc-section">
          <h3>Datos del padre, madre o tutor</h3>
          <div class="doc-field"><span class="label">Nombre completo:</span><span class="doc-field-editable" contenteditable="true" data-placeholder="Nombre del tutor…"></span></div>
          <div class="doc-field"><span class="label">Parentesco:</span><span class="doc-field-editable" contenteditable="true" data-placeholder="Padre / Madre / Tutor"></span></div>
          <div class="doc-field"><span class="label">Identificación oficial:</span><span class="doc-field-editable" contenteditable="true" data-placeholder="INE, pasaporte, etc."></span></div>
          <div class="doc-field"><span class="label">Teléfono:</span><span class="doc-field-editable" contenteditable="true" data-placeholder="Teléfono de contacto"></span></div>
        </div>
        <div class="doc-section">
          <div class="doc-body">
            <p>Yo, el/la abajo firmante, en mi calidad de padre, madre o tutor legal del menor de edad arriba mencionado, por medio del presente documento:</p>
            <p>1. <strong>Autorizo</strong> al equipo odontológico de {{ clinicaNombre }} a realizar el tratamiento dental que sea necesario para mi hijo(a) o menor a mi cargo.</p>
            <p>2. <strong>Declaro</strong> haber sido informado(a) sobre el diagnóstico, el procedimiento propuesto, los riesgos y las alternativas de tratamiento.</p>
            <p>3. <strong>Me comprometo</strong> a acompañar al menor en sus citas de seguimiento y a supervisar el cumplimiento de las indicaciones médicas.</p>
            <p>4. <strong>Acepto</strong> que en caso de emergencia durante el procedimiento, el profesional dental podrá tomar las decisiones clínicas necesarias para preservar la salud del menor.</p>
          </div>
        </div>
        <div class="doc-field" style="margin-top:24px"><span class="label">Fecha:</span><span class="value">{{ fechaHoy }}</span></div>
        <div class="doc-firma">
          <div class="firma-box">
            <div class="firma-line">Firma del padre/madre/tutor</div>
            <div class="firma-sub">Nombre completo</div>
          </div>
          <div class="firma-box">
            <div class="firma-line">Firma del odontólogo</div>
            <div class="firma-sub">{{ medicoLogueado }}</div>
          </div>
        </div>
      }

      <!-- Sin documento seleccionado o sin paciente -->
      @if (!docActivo) {
        <div class="empty" style="padding:80px 0">
          <div class="empty-ico">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3>Selecciona un documento</h3>
          <p class="sm muted">Elige un formato de la lista para visualizarlo</p>
        </div>
      }

    </div>

  </div>

</div>
  `,
})
export class DocumentosComponent implements OnInit {
  paciente?: PacienteDetalleDTO;
  pacientes: PacienteDetalleDTO[] = [];
  pacientesFiltrados: PacienteDetalleDTO[] = [];
  qPaciente = '';
  docActivo: string = 'consentimiento';
  fechaHoy = '';
  medicoLogueado = '';

  // Configuración de la clínica — se puede mover a un servicio/config
  clinicaNombre   = 'mDental';
  clinicaDireccion = 'Dirección de la clínica';
  clinicaCiudad    = 'Monterrey, N.L.';

  documentos = [
    { id: 'consentimiento', nombre: 'Consentimiento informado',   desc: 'Autorización de tratamiento',    icon: 'file-text', color: '#2563eb' },
    { id: 'responsiva',     nombre: 'Carta responsiva',           desc: 'Deslinde de responsabilidad',    icon: 'shield',    color: '#dc2626' },
    { id: 'historia',       nombre: 'Historia clínica dental',    desc: 'Formato NOM-004',                icon: 'clipboard', color: '#0d9488' },
    { id: 'privacidad',     nombre: 'Aviso de privacidad',        desc: 'Protección de datos personales', icon: 'heart',     color: '#7c3aed' },
    { id: 'menores',        nombre: 'Autorización menores',       desc: 'Consentimiento padre/tutor',     icon: 'alert',     color: '#d97706' },
  ];

  get tieneAlergia(): boolean {
    const a = this.paciente?.alergias ?? '';
    return !!a && a !== 'Ninguna' && a !== 'Ninguna conocida';
  }

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.fechaHoy = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    const usr = this.auth.usuario();
    this.medicoLogueado = usr ? `Dr(a). ${usr.nombreCompleto}` : '';

    // Si viene pacienteId como query param
    const pid = this.route.snapshot.queryParamMap.get('pacienteId');
    if (pid) {
      this.api.getPaciente(+pid).subscribe({
        next: p => { this.paciente = p; this.qPaciente = p.nombre + ' ' + p.apellidoPaterno; },
      });
    }

    // Cargar lista de pacientes para el buscador
    this.api.getPacientes({ pageSize: 500 }).subscribe({
      next: r => {
        this.pacientes = r.items as any[];
      },
    });
  }

  filtrarPacientes(): void {
    if (!this.qPaciente || this.qPaciente.length < 2) {
      this.pacientesFiltrados = [];
      return;
    }
    const q = this.qPaciente.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(p =>
      (p.nombre + ' ' + p.apellidoPaterno).toLowerCase().includes(q) ||
      (p as any).folio?.toLowerCase().includes(q)
    ).slice(0, 8) as any[];
  }

  seleccionarPaciente(p: any): void {
    this.api.getPaciente(p.id).subscribe({
      next: detalle => {
        this.paciente = detalle;
        this.qPaciente = detalle.nombre + ' ' + detalle.apellidoPaterno;
        this.pacientesFiltrados = [];
      },
    });
  }

  limpiarPaciente(): void {
    this.paciente = undefined;
    this.qPaciente = '';
    this.pacientesFiltrados = [];
  }

  imprimir(): void {
    window.print();
  }

  formatFecha(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
