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
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatSlideToggleModule, MatTooltipModule,
    MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Vendors &amp; Suppliers</h1>
          <p>Manage your product and spare parts suppliers</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/suppliers/new">
          <mat-icon>store</mat-icon>
          Add Vendor
        </a>
      </div>

      <mat-card class="list-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search vendor name or phone</mat-label>
              <input matInput (input)="onSearch($event)">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">store</mat-icon>
            {{ suppliers.length }} vendors
          </span>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="suppliers" class="data-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Vendor Name</th>
              <td mat-cell *matCellDef="let s">
                <div class="name-cell">
                  <div class="avatar-circle green">{{ s.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ s.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let s">{{ s.phone || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let s">{{ s.email || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="gstin">
              <th mat-header-cell *matHeaderCellDef>GSTIN</th>
              <td mat-cell *matCellDef="let s">
                <span class="mono-text" *ngIf="s.gstin">{{ s.gstin }}</span>
                <span *ngIf="!s.gstin">—</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Address</th>
              <td mat-cell *matCellDef="let s">
                {{ s.address || '—' }}<span *ngIf="s.state">, {{ s.state.name }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="toggle-cell">Status</th>
              <td mat-cell *matCellDef="let s" class="toggle-cell">
                <mat-slide-toggle
                  [checked]="s.active !== false"
                  (change)="toggleActive(s)"
                  color="primary"
                  [matTooltip]="s.active !== false ? 'Active — click to deactivate' : 'Inactive — click to activate'">
                </mat-slide-toggle>
                <span class="pill-badge" [class.active]="s.active !== false" [class.inactive]="s.active === false">
                  {{ s.active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let s" class="actions-cell">
                <a mat-icon-button [routerLink]="['/suppliers', s.id, 'edit']" color="primary" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(s)" matTooltip="Delete"
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
                  <mat-icon class="empty-icon">storefront</mat-icon>
                  <h3>No vendors found</h3>
                  <p>Try adjusting your search or add a new vendor.</p>
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
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  displayedColumns = ['name', 'phone', 'email', 'gstin', 'address', 'status', 'actions'];

  constructor(
    private svc: SupplierService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(search?: string): void {
    this.svc.getAll().subscribe(all => {
      if (search) {
        const q = search.toLowerCase();
        this.suppliers = all.filter(s =>
          s.name.toLowerCase().includes(q) ||
          (s.phone && s.phone.includes(q))
        );
      } else {
        this.suppliers = all;
      }
    });
  }

  onSearch(e: Event): void {
    const q = (e.target as HTMLInputElement).value.trim();
    this.load(q || undefined);
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
  }

  toggleActive(s: Supplier): void {
    this.svc.toggleActive(s.id!).subscribe(updated => {
      s.active = updated.active;
      this.snackBar.open(
        `Vendor "${s.name}" ${updated.active ? 'activated' : 'deactivated'}.`,
        'OK', { duration: 3000 }
      );
    });
  }

  delete(s: Supplier): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Vendor', message: `Are you sure you want to delete "${s.name}"?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(s.id!).subscribe(() => {
          this.snackBar.open('Vendor deleted successfully.', 'OK', { duration: 3000 });
          this.load();
        });
      }
    });
  }
}
