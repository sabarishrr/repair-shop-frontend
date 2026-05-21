import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CompanyDetailsService, CompanyDetails } from '../../core/services/company-details.service';
import { DataManagementDialogComponent } from '../../features/settings/data-management-dialog.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatSnackBarModule, MatDialogModule,
    DataManagementDialogComponent
  ],
  template: `
    <mat-sidenav-container class="app-shell">

      <!-- Sidebar -->
      <mat-sidenav #sidenav
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="!isMobile"
        class="sidebar no-print"
        [fixedInViewport]="isMobile"
        fixedTopGap="0">

        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-logo">
            <mat-icon>build</mat-icon>
          </div>
          <span class="brand-name">{{ company?.companyName || 'TECHFIX PRO' }}</span>
        </div>

        <mat-divider></mat-divider>

        <!-- Navigation -->
        <mat-nav-list class="nav-list">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/jobs" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>handyman</mat-icon>
            <span matListItemTitle>Job Sheets</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Customers</span>
          </a>
          <a mat-list-item routerLink="/suppliers" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>store</mat-icon>
            <span matListItemTitle>Vendors</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/quotations" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>request_quote</mat-icon>
            <span matListItemTitle>Quotations</span>
          </a>
          <a mat-list-item routerLink="/invoices" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Sales Invoices</span>
          </a>
          <a mat-list-item routerLink="/receipts" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>receipt</mat-icon>
            <span matListItemTitle>Customer Receipts</span>
          </a>
          <a mat-list-item routerLink="/purchases" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Purchases</span>
          </a>
          <a mat-list-item routerLink="/payments" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>payments</mat-icon>
            <span matListItemTitle>Supplier Payments</span>
          </a>
          <a mat-list-item *ngIf="user?.role === 'ADMIN'" routerLink="/users" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>manage_accounts</mat-icon>
            <span matListItemTitle>User Management</span>
          </a>
          <a mat-list-item *ngIf="user?.role === 'ADMIN'" routerLink="/settings" routerLinkActive="active-link" (click)="closeMobile()">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Company Settings</span>
          </a>
          
          <a mat-list-item *ngIf="user?.role === 'ADMIN'" (click)="openDataManagement(); closeMobile()" style="cursor: pointer;">
            <mat-icon matListItemIcon>storage</mat-icon>
            <span matListItemTitle>Data Management</span>
          </a>
        </mat-nav-list>

        <!-- Footer -->
        <div class="sidebar-footer">
          <mat-divider></mat-divider>
          <div class="user-block">
            <div class="user-avatar">{{ user?.fullName?.charAt(0)?.toUpperCase() || 'U' }}</div>
            <div class="user-details">
              <span class="user-name">{{ user?.fullName || 'User' }}</span>
              <span class="user-role">{{ user?.role === 'ADMIN' ? 'Administrator' : 'Technician' }}</span>
            </div>
          </div>
          <button mat-stroked-button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        <!-- Mobile toolbar -->
        <mat-toolbar *ngIf="isMobile" class="mobile-toolbar no-print">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-brand">{{ company?.companyName || 'TECHFIX PRO' }}</span>
        </mat-toolbar>

        <main>
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .app-shell {
      height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: #0d1117;
      display: flex;
      flex-direction: column;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 16px;
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      background: var(--gradient-1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }

    .nav-list {
      padding: 8px 8px;
      flex: 1;

      a.mat-mdc-list-item {
        border-radius: 8px;
        margin-bottom: 2px;
        height: 44px;
        color: var(--text-secondary);

        &:hover {
          background: rgba(255,255,255,.05);
          color: var(--text-primary);
        }

        &.active-link {
          background: rgba(88,166,255,.1);
          color: var(--accent-blue);
          mat-icon { color: var(--accent-blue); }
        }

        mat-icon {
          color: var(--text-secondary);
          margin-right: 12px;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .sidebar-footer {
      padding: 12px 16px 16px;
    }

    .user-block {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 4px;
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a371f7, #6e40c9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 15px;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .user-role {
      font-size: 12px;
      color: var(--text-muted);
    }

    .logout-btn {
      width: 100%;
      margin-top: 8px;
      color: var(--text-secondary) !important;
      border-color: var(--border) !important;
      mat-icon { margin-right: 8px; font-size: 18px; width: 18px; height: 18px; }
    }

    .main-content {
      background: var(--bg-base);
    }

    .mobile-toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .toolbar-brand {
      font-weight: 700;
      font-size: 18px;
      margin-left: 8px;
    }

    @media print {
      .sidebar { display: none !important; }
      .app-shell, mat-sidenav-container { 
        height: auto !important; 
        display: block !important; 
        position: static !important; 
        overflow: visible !important; 
      }
      .main-content, mat-sidenav-content { 
        margin-left: 0 !important;
        margin-right: 0 !important;
        transform: none !important;
        position: static !important;
        display: block !important;
        overflow: visible !important; 
        background: #fff !important; 
      }
      .mobile-toolbar { display: none !important; }
      main { display: block !important; position: static !important; overflow: visible !important; }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  user: any;
  company?: CompanyDetails;
  isMobile = false;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private companyService: CompanyDetailsService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.companyService.get().subscribe(c => this.company = c);
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeMobile(): void {
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
    }
  }

  openDataManagement(): void {
    this.dialog.open(DataManagementDialogComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container'
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
