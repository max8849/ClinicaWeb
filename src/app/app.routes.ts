import { Routes } from '@angular/router';
import { authGuard }  from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./modules/pacientes/pacientes.component').then(m => m.PacientesComponent),
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./modules/pacientes/paciente-detalle.component').then(m => m.PacienteDetalleComponent),
      },
      {
        path: 'expediente/:id',
        loadComponent: () => import('./pages/expediente/expediente.component').then(m => m.ExpedienteComponent),
      },
      {
        path: 'citas',
        loadComponent: () => import('./pages/citas/citas.component').then(m => m.CitasComponent),
      },
      {
        path: 'documentos',
        loadComponent: () => import('./pages/documentos/documentos.component').then(m => m.DocumentosComponent),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./modules/reportes/reportes.component').then(m => m.ReportesComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./modules/auth/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./modules/admin/usuarios.component').then(m => m.UsuariosComponent),
      },
    ],
  },
  {
    path: 'sala-espera',
    loadComponent: () => import('./pages/sala-espera/sala-espera.component').then(m => m.SalaEsperaComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
