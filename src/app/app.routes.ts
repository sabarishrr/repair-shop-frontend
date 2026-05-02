import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent),
      },
      {
        path: 'customers/new',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
      },
      {
        path: 'customers/edit/:id',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/job-list/job-list.component').then(m => m.JobListComponent),
      },
      {
        path: 'jobs/new',
        loadComponent: () => import('./features/jobs/job-form/job-form.component').then(m => m.JobFormComponent),
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () => import('./features/jobs/job-form/job-form.component').then(m => m.JobFormComponent),
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./features/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard],
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard],
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
        canActivate: [roleGuard],
      },
      {
        path: 'products',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) },
          { path: 'new', loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) }
        ]
      },
      {
        path: 'quotations',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/quotations/quotation-list/quotation-list.component').then(m => m.QuotationListComponent) },
          { path: 'new', loadComponent: () => import('./features/quotations/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/quotations/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent) },
          { path: ':id', loadComponent: () => import('./features/quotations/quotation-detail/quotation-detail.component').then(m => m.QuotationDetailComponent) }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/company-settings/company-settings.component').then(m => m.CompanySettingsComponent),
        canActivate: [roleGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
