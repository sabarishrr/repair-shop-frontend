import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your repair customers</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/customers/new">
          <mat-icon>person_add</mat-icon>
          Add Customer
        </a>
      </div>

      <mat-card class="customer-card">
        <!-- Search toolbar -->
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Search name or phone</mat-label>
            <input matInput (input)="onSearch($event)" placeholder="Search...">
          </mat-form-field>
          <span class="count-badge">{{ customers.length }} customers</span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="customers" class="customer-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let c">
                <div class="name-cell">
                  <div class="avatar">{{ c.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ c.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let c">{{ c.phone }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let c">{{ c.email || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Address</th>
              <td mat-cell *matCellDef="let c">{{ c.address || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let c" class="actions-cell">
                <a mat-icon-button [routerLink]="['/customers/edit', c.id]" color="primary" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(c)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>people_outline</mat-icon>
                  <p>No customers found.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .customer-card {
      padding: 24px !important;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0 8px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      width: 320px;
      max-width: 100%;
    }

    .count-badge {
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--bg-elevated);
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 500;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .customer-table {
      width: 100%;
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .actions-header {
      text-align: right !important;
    }

    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 48px 0;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-secondary); font-size: 14px; }
    }
  `]
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  displayedColumns = ['name', 'phone', 'email', 'address', 'actions'];

  constructor(
    private svc: CustomerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(search?: string): void {
    this.svc.getAll(search).subscribe(c => this.customers = c);
  }

  onSearch(e: Event): void {
    const q = (e.target as HTMLInputElement).value.trim();
    this.load(q || undefined);
  }

  delete(c: Customer): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Customer', message: `Are you sure you want to delete "${c.name}"?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(c.id!).subscribe(() => {
          this.snackBar.open('Customer deleted.', 'OK', { duration: 3000 });
          this.load();
        });
      }
    });
  }
}
