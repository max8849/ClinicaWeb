// api.models.ts — espeja 1:1 los DTOs del backend v2

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Auth ─────────────────────────────────────────────────────────────

export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { token: string; usuario: UsuarioDTO; expiresAt: string; }

export interface UsuarioDTO {
  id: number;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  rol: 'admin' | 'medico' | 'recepcionista';
  especialidad: string | null;
  cedula: string | null;
}

// ── Admin ─────────────────────────────────────────────────────────────

export interface UsuarioAdminDTO {
  id: number;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  especialidad: string | null;
  cedula: string | null;
  activo: boolean;
  createdAt: string;
}

export interface UsuarioCreateDTO {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
  especialidad?: string | null;
  cedula?: string | null;
}

export interface UsuarioUpdateDTO {
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  especialidad?: string | null;
  cedula?: string | null;
  activo: boolean;
}

export interface ResetPasswordDTO  { nuevaPassword: string; }
export interface CambiarPasswordDTO { passwordActual: string; nuevaPassword: string; }

// ── Dashboard ─────────────────────────────────────────────────────────

export interface DashboardStats {
  citasHoy: number;
  confirmadas: number;
  pendientes: number;
  completadasMes: number;
  totalPacientes: number;
  totalMedicos: number;
  citasSemana: number;
  nuevosPacientesMes: number;
}

// ── Pacientes ─────────────────────────────────────────────────────────

export interface PacienteListDTO {
  id: number; folio: string;
  nombre: string; apellidoPaterno: string; apellidoMaterno: string | null;
  edad: number; sexo: string; telefono: string; email: string | null;
  alergias: string | null; ultimaConsulta: string | null; totalConsultas: number;
}

export interface PacienteDetalleDTO {
  id: number; folio: string;
  nombre: string; apellidoPaterno: string; apellidoMaterno: string | null;
  edad: number; sexo: string; fechaNacimiento: string; curp: string | null;
  telefono: string; email: string | null; domicilio: string | null;
  colonia: string | null; ciudad: string | null; codigoPostal: string | null;
  grupoSanguineo: string | null; alergias: string | null;
  antecedentesHF: string | null; antecedentesNP: string | null;
  antecedentesPatologicos: string | null;
  activo: boolean; createdAt: string; updatedAt: string;
  ultimaConsulta: string | null; totalConsultas: number;
}

export interface PacienteCreateDTO {
  nombre: string; apellidoPaterno: string; apellidoMaterno?: string | null;
  fechaNacimiento: string; sexo: string; curp?: string | null;
  telefono: string; email?: string | null; domicilio?: string | null;
  colonia?: string | null; ciudad?: string | null; codigoPostal?: string | null;
  grupoSanguineo?: string | null; alergias?: string | null;
  antecedentesHF?: string | null; antecedentesNP?: string | null;
  antecedentesPatologicos?: string | null;
}

// ── Citas ─────────────────────────────────────────────────────────────

export interface CitaDTO {
  id: number; folio: string;
  pacienteId: number; pacienteNombre: string;
  medicoId: number; medicoNombre: string; medicoEspecialidad: string | null;
  fecha: string; hora: string; duracionMin: number;
  motivo: string; tipo: string; estado: string; notas: string | null;
}

export interface CitaCreateDTO {
  pacienteId: number; medicoId: number;
  fecha: string; hora: string; duracionMin: number;
  motivo: string; tipo: string;
}

export interface CitaEstadoUpdateDTO { estado: string; }

// ── Expediente ────────────────────────────────────────────────────────

export interface NotaEvolucionDTO {
  id: number; pacienteId: number; citaId: number | null;
  medicoId: number; medicoNombre: string; medicoCedula: string;
  fecha: string; hora: string;
  motivoConsulta: string; exploracionFisica: string; diagnostico: string; plan: string;
  peso: number | null; talla: number | null; imc: number | null;
  temperatura: number | null; tensionArterial: string | null;
  frecuenciaCardiaca: number | null; frecuenciaRespiratoria: number | null; saturacionO2: number | null;
}

export interface NotaCreateDTO {
  citaId?: number | null; medicoId: number;
  motivoConsulta: string; exploracionFisica: string; diagnostico: string; plan: string;
  peso?: number | null; talla?: number | null; temperatura?: number | null;
  tensionArterial?: string | null; frecuenciaCardiaca?: number | null;
  frecuenciaRespiratoria?: number | null; saturacionO2?: number | null;
}

export interface MedicamentoDTO {
  nombre: string; presentacion: string; dosis: string;
  duracion: string; cantidad: number; viaAdministracion: string;
}

export interface RecetaDTO {
  id: number; folio: string; pacienteId: number;
  medicoId: number; medicoNombre: string; citaId: number | null;
  fecha: string; diagnostico: string; indicaciones: string | null;
  firmadoPor: string; cedula: string; impresa: boolean;
  medicamentos: MedicamentoDTO[];
}

export interface RecetaCreateDTO {
  medicoId: number; citaId?: number | null;
  diagnostico: string; indicaciones?: string | null;
  medicamentos: MedicamentoDTO[];
}

export interface ExpedienteDTO {
  pacienteId: number; paciente: PacienteDetalleDTO;
  notas: NotaEvolucionDTO[]; recetas: RecetaDTO[];
}

// ── Reportes ──────────────────────────────────────────────────────────

export interface ReporteCitasDTO {
  fechaDesde: string; fechaHasta: string;
  totalCitas: number; completadas: number; canceladas: number;
  noAsistio: number; pendientes: number; porcentajeCompletadas: number;
  porDia: CitasPorDiaDTO[];
  porMedico: CitasPorMedicoDTO[];
  porTipo: CitasPorTipoDTO[];
  porEstado: CitasPorEstadoDTO[];
}

export interface CitasPorDiaDTO    { fecha: string; total: number; completadas: number; canceladas: number; }
export interface CitasPorMedicoDTO { medicoId: number; medicoNombre: string; especialidad: string | null; total: number; completadas: number; canceladas: number; }
export interface CitasPorTipoDTO   { tipo: string; total: number; }
export interface CitasPorEstadoDTO { estado: string; total: number; }

export interface ReportePacientesDTO {
  totalActivos: number; totalInactivos: number; nuevosMes: number; nuevosAnio: number;
  porSexo: PorSexoDTO[]; porRangoEdad: PorEdadDTO[];
  registrosPorMes: PorMesDTO[]; topDiagnosticos: TopDiagDTO[]; topAlergias: TopAlergiaDTO[];
}

export interface PorSexoDTO    { sexo: string; total: number; }
export interface PorEdadDTO    { rango: string; total: number; }
export interface PorMesDTO     { anio: number; mes: number; nombreMes: string; total: number; }
export interface TopDiagDTO    { diagnostico: string; frecuencia: number; }
export interface TopAlergiaDTO { alergia: string; frecuencia: number; }

export interface ReporteMedicosDTO {
  totalMedicos: number;
  rendimiento: RendimientoMedicoDTO[];
}

export interface RendimientoMedicoDTO {
  medicoId: number; medicoNombre: string; especialidad: string | null;
  totalCitas: number; completadas: number; canceladas: number; noAsistio: number;
  porcentajeAsistencia: number; totalNotas: number; totalRecetas: number;
}
