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
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Vendors & Suppliers</h1>
          <p>Manage your product and spare parts suppliers</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/suppliers/new">
          <mat-icon>store</mat-icon>
          Add Vendor
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Search toolbar -->
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

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="suppliers" class="data-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Vendor Name</th>
              <td mat-cell *matCellDef="let s">
                <div class="name-cell">
                  <div class="avatar">{{ s.name.charAt(0).toUpperCase() }}</div>
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
                <span class="gstin-badge" *ngIf="s.gstin">{{ s.gstin }}</span>
                <span *ngIf="!s.gstin">—</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>Address</th>
              <td mat-cell *matCellDef="let s">
                {{ s.address || '—' }}<span *ngIf="s.state">, {{ s.state.name }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let s" class="actions-cell">
                <a mat-icon-button [routerLink]="['/suppliers', s.id, 'edit']" color="primary" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(s)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

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
  styles: [`
    .name-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .gstin-badge { background: rgba(16,185,129,.1); color: #10b981; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: 600; font-size: 12px; }
  `]
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  displayedColumns = ['name', 'phone', 'email', 'gstin', 'address', 'actions'];

  constructor(
    private svc: SupplierService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

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
