import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import {
  ApiResponse, PagedResult,
  DashboardStats,
  UsuarioDTO, UsuarioAdminDTO, UsuarioCreateDTO, UsuarioUpdateDTO,
  ResetPasswordDTO, CambiarPasswordDTO,
  PacienteListDTO, PacienteDetalleDTO, PacienteCreateDTO,
  CitaDTO, CitaCreateDTO, CitaEstadoUpdateDTO,
  ExpedienteDTO, NotaEvolucionDTO, NotaCreateDTO,
  RecetaDTO, RecetaCreateDTO,
  ReporteCitasDTO, ReportePacientesDTO, ReporteMedicosDTO,
} from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private unwrap<T>(obs: ReturnType<typeof this.http.get<ApiResponse<T>>>) {
    return obs.pipe(map(r => {
      if (!r.success || r.data == null) throw new Error(r.message ?? 'Error desconocido');
      return r.data as T;
    }));
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  getDashboardStats() {
    return this.unwrap(this.http.get<ApiResponse<DashboardStats>>(`${this.base}/dashboard/stats`));
  }

  // ── Médicos (público) ─────────────────────────────────────────────
  getMedicos() {
    return this.unwrap(this.http.get<ApiResponse<UsuarioDTO[]>>(`${this.base}/medicos`));
  }

  // ── Usuarios (admin) ──────────────────────────────────────────────
  getUsuarios(params: { q?: string; rol?: string; activo?: boolean; page?: number; pageSize?: number } = {}) {
    let p = new HttpParams();
    if (params.q)        p = p.set('q', params.q);
    if (params.rol)      p = p.set('rol', params.rol);
    if (params.activo !== undefined) p = p.set('activo', params.activo.toString());
    if (params.page)     p = p.set('page', params.page.toString());
    if (params.pageSize) p = p.set('pageSize', params.pageSize.toString());
    return this.unwrap(this.http.get<ApiResponse<PagedResult<UsuarioAdminDTO>>>(`${this.base}/usuarios`, { params: p }));
  }

  getUsuario(id: number) {
    return this.unwrap(this.http.get<ApiResponse<UsuarioAdminDTO>>(`${this.base}/usuarios/${id}`));
  }

  getMe() {
    return this.unwrap(this.http.get<ApiResponse<UsuarioAdminDTO>>(`${this.base}/usuarios/me`));
  }

  createUsuario(dto: UsuarioCreateDTO) {
    return this.unwrap(this.http.post<ApiResponse<UsuarioAdminDTO>>(`${this.base}/usuarios`, dto));
  }

  updateUsuario(id: number, dto: UsuarioUpdateDTO) {
    return this.unwrap(this.http.put<ApiResponse<UsuarioAdminDTO>>(`${this.base}/usuarios/${id}`, dto));
  }

  activarUsuario(id: number) {
    return this.unwrap(this.http.patch<ApiResponse<UsuarioAdminDTO>>(`${this.base}/usuarios/${id}/activar`, {}));
  }

  desactivarUsuario(id: number) {
    return this.unwrap(this.http.patch<ApiResponse<UsuarioAdminDTO>>(`${this.base}/usuarios/${id}/desactivar`, {}));
  }

  resetPassword(id: number, dto: ResetPasswordDTO) {
    return this.http.patch<ApiResponse<null>>(`${this.base}/usuarios/${id}/reset-password`, dto);
  }

  cambiarPasswordPropia(dto: CambiarPasswordDTO) {
    return this.http.patch<ApiResponse<null>>(`${this.base}/usuarios/me/password`, dto);
  }

  // ── Pacientes ─────────────────────────────────────────────────────
  getPacientes(params: { q?: string; sexo?: string; page?: number; pageSize?: number } = {}) {
    let p = new HttpParams();
    if (params.q)        p = p.set('q', params.q);
    if (params.sexo)     p = p.set('sexo', params.sexo);
    if (params.page)     p = p.set('page', params.page.toString());
    if (params.pageSize) p = p.set('pageSize', params.pageSize.toString());
    return this.unwrap(this.http.get<ApiResponse<PagedResult<PacienteListDTO>>>(`${this.base}/pacientes`, { params: p }));
  }

  getPaciente(id: number) {
    return this.unwrap(this.http.get<ApiResponse<PacienteDetalleDTO>>(`${this.base}/pacientes/${id}`));
  }

  createPaciente(dto: PacienteCreateDTO) {
    return this.unwrap(this.http.post<ApiResponse<PacienteDetalleDTO>>(`${this.base}/pacientes`, dto));
  }

  updatePaciente(id: number, dto: PacienteCreateDTO) {
    return this.unwrap(this.http.put<ApiResponse<PacienteDetalleDTO>>(`${this.base}/pacientes/${id}`, dto));
  }

  deletePaciente(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.base}/pacientes/${id}`);
  }

  getCitasByPaciente(id: number) {
    return this.unwrap(this.http.get<ApiResponse<CitaDTO[]>>(`${this.base}/pacientes/${id}/citas`));
  }

  // ── Citas ─────────────────────────────────────────────────────────
  getCitas(params: { fecha?: string; estado?: string; medicoId?: number; q?: string; page?: number; pageSize?: number } = {}) {
    let p = new HttpParams();
    if (params.fecha)    p = p.set('fecha', params.fecha);
    if (params.estado)   p = p.set('estado', params.estado);
    if (params.medicoId) p = p.set('medicoId', params.medicoId.toString());
    if (params.q)        p = p.set('q', params.q);
    if (params.page)     p = p.set('page', params.page.toString());
    if (params.pageSize) p = p.set('pageSize', params.pageSize.toString());
    return this.unwrap(this.http.get<ApiResponse<PagedResult<CitaDTO>>>(`${this.base}/citas`, { params: p }));
  }

  createCita(dto: CitaCreateDTO) {
    return this.unwrap(this.http.post<ApiResponse<CitaDTO>>(`${this.base}/citas`, dto));
  }

  updateCitaEstado(id: number, estado: string) {
    return this.unwrap(this.http.patch<ApiResponse<CitaDTO>>(`${this.base}/citas/${id}/estado`, { estado }));
  }

  cancelarCita(id: number) {
    return this.unwrap(this.http.delete<ApiResponse<CitaDTO>>(`${this.base}/citas/${id}`));
  }

  // ── Expedientes ───────────────────────────────────────────────────
  getExpediente(pacienteId: number) {
    return this.unwrap(this.http.get<ApiResponse<ExpedienteDTO>>(`${this.base}/expedientes/${pacienteId}`));
  }

  createNota(pacienteId: number, dto: NotaCreateDTO) {
    return this.unwrap(this.http.post<ApiResponse<NotaEvolucionDTO>>(`${this.base}/expedientes/${pacienteId}/notas`, dto));
  }

  createReceta(pacienteId: number, dto: RecetaCreateDTO) {
    return this.unwrap(this.http.post<ApiResponse<RecetaDTO>>(`${this.base}/expedientes/${pacienteId}/recetas`, dto));
  }

  marcarRecetaImpresa(recetaId: number, impresa: boolean) {
    return this.unwrap(this.http.patch<ApiResponse<RecetaDTO>>(`${this.base}/recetas/${recetaId}/imprimir`, { impresa }));
  }

  // ── Reportes ──────────────────────────────────────────────────────
  getReporteCitas(params: { desde?: string; hasta?: string; medicoId?: number } = {}) {
    let p = new HttpParams();
    if (params.desde)    p = p.set('desde', params.desde);
    if (params.hasta)    p = p.set('hasta', params.hasta);
    if (params.medicoId) p = p.set('medicoId', params.medicoId.toString());
    return this.unwrap(this.http.get<ApiResponse<ReporteCitasDTO>>(`${this.base}/reportes/citas`, { params: p }));
  }

  getReportePacientes() {
    return this.unwrap(this.http.get<ApiResponse<ReportePacientesDTO>>(`${this.base}/reportes/pacientes`));
  }

  getReporteMedicos(params: { desde?: string; hasta?: string } = {}) {
    let p = new HttpParams();
    if (params.desde) p = p.set('desde', params.desde);
    if (params.hasta) p = p.set('hasta', params.hasta);
    return this.unwrap(this.http.get<ApiResponse<ReporteMedicosDTO>>(`${this.base}/reportes/medicos`, { params: p }));
  }
}
