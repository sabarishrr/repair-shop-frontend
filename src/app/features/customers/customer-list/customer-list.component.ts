import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatSlideToggleModule, MatTooltipModule,
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

      <mat-card class="list-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search name or phone</mat-label>
              <input matInput (input)="onSearch($event)">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">people</mat-icon>
            {{ customers.length }} customers
          </span>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="customers" class="data-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let c">
                <div class="name-cell">
                  <div class="avatar-circle">{{ c.name.charAt(0).toUpperCase() }}</div>
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

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="toggle-cell">Status</th>
              <td mat-cell *matCellDef="let c" class="toggle-cell">
                <mat-slide-toggle
                  [checked]="c.active !== false"
                  (change)="toggleActive(c)"
                  color="primary"
                  [matTooltip]="c.active !== false ? 'Active — click to deactivate' : 'Inactive — click to activate'">
                </mat-slide-toggle>
                <span class="pill-badge" [class.active]="c.active !== false" [class.inactive]="c.active === false">
                  {{ c.active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let c" class="actions-cell">
                <a mat-icon-button [routerLink]="['/customers/edit', c.id]" color="primary" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(c)" matTooltip="Delete"
                        *ngIf="isAdmin()">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.row-inactive]="row.active === false"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">people_outline</mat-icon>
                  <h3>No customers found</h3>
                  <p>Try adjusting your search or add a new customer.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: []
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  displayedColumns = ['name', 'phone', 'email', 'address', 'status', 'actions'];

  constructor(
    private svc: CustomerService,
    private authService: AuthService,
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

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
  }

  toggleActive(c: Customer): void {
    this.svc.toggleActive(c.id!).subscribe(updated => {
      c.active = updated.active;
      this.snackBar.open(
        `Customer "${c.name}" ${updated.active ? 'activated' : 'deactivated'}.`,
        'OK', { duration: 3000 }
      );
    });
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
