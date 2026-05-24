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
          { path: ':id/edit', loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) },
          { path: 'adjustments', loadComponent: () => import('./features/products/stock-adjustment-list/stock-adjustment-list.component').then(m => m.StockAdjustmentListComponent) }
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
        path: 'suppliers',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/suppliers/supplier-list/supplier-list.component').then(m => m.SupplierListComponent) },
          { path: 'new', loadComponent: () => import('./features/suppliers/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/suppliers/supplier-form/supplier-form.component').then(m => m.SupplierFormComponent) }
        ]
      },
      {
        path: 'purchases',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/purchases/purchase-list/purchase-list.component').then(m => m.PurchaseListComponent) },
          { path: 'new', loadComponent: () => import('./features/purchases/purchase-form/purchase-form.component').then(m => m.PurchaseFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/purchases/purchase-form/purchase-form.component').then(m => m.PurchaseFormComponent) }
        ]
      },
      {
        path: 'invoices',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent) },
          { path: 'new', loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent) },
          { path: ':id', loadComponent: () => import('./features/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent) }
        ]
      },
      {
        path: 'credit-notes',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/credit-notes/credit-note-list/credit-note-list.component').then(m => m.CreditNoteListComponent) },
          { path: 'new', loadComponent: () => import('./features/credit-notes/credit-note-form/credit-note-form.component').then(m => m.CreditNoteFormComponent) },
          { path: ':id', loadComponent: () => import('./features/credit-notes/credit-note-detail/credit-note-detail.component').then(m => m.CreditNoteDetailComponent) }
        ]
      },
      {
        path: 'debit-notes',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/debit-notes/debit-note-list/debit-note-list.component').then(m => m.DebitNoteListComponent) },
          { path: 'new', loadComponent: () => import('./features/debit-notes/debit-note-form/debit-note-form.component').then(m => m.DebitNoteFormComponent) },
          { path: ':id', loadComponent: () => import('./features/debit-notes/debit-note-detail/debit-note-detail.component').then(m => m.DebitNoteDetailComponent) }
        ]
      },
      {
        path: 'receipts',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/receipts/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent) },
          { path: 'new', loadComponent: () => import('./features/receipts/receipt-form/receipt-form.component').then(m => m.ReceiptFormComponent) },
          { path: 'edit/:id', loadComponent: () => import('./features/receipts/receipt-form/receipt-form.component').then(m => m.ReceiptFormComponent) }
        ]
      },
      {
        path: 'payments',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/payments/payment-list/payment-list.component').then(m => m.PaymentListComponent) },
          { path: 'new', loadComponent: () => import('./features/payments/payment-form/payment-form.component').then(m => m.PaymentFormComponent) },
          { path: 'edit/:id', loadComponent: () => import('./features/payments/payment-form/payment-form.component').then(m => m.PaymentFormComponent) }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/company-settings/company-settings.component').then(m => m.CompanySettingsComponent),
        canActivate: [roleGuard],
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent),
        canActivate: [roleGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

