import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PurchaseService } from '../../../core/services/purchase.service';
import { PurchaseInvoice } from '../../../core/models/purchase.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTooltipModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Purchases</h1>
          <p>Manage inward stock and vendor bills</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/purchases/new">
          <mat-icon>add</mat-icon> Add Purchase
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by invoice # or supplier</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">shopping_cart</mat-icon>
            {{ filtered.length }} purchases
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="invoiceNumber">
              <th mat-header-cell *matHeaderCellDef>Invoice #</th>
              <td mat-cell *matCellDef="let p">
                <span class="mono-text">{{ p.invoiceNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let p">{{ p.invoiceDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="supplier">
              <th mat-header-cell *matHeaderCellDef>Supplier</th>
              <td mat-cell *matCellDef="let p">
                <div class="name-cell" *ngIf="p.supplier; else noSup">
                  <div class="avatar-circle green">{{ p.supplier.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ p.supplier.name }}</span>
                </div>
                <ng-template #noSup><span class="text-muted">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Total Amount</th>
              <td mat-cell *matCellDef="let p">
                <strong>₹ {{ p.grandTotal | number:'1.2-2' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="pill-badge"
                      [class.paid]="p.status === 'RECEIVED'"
                      [class.unpaid]="p.status === 'CANCELLED'">
                  {{ p.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let p" class="actions-cell">
                <a mat-icon-button color="primary" [routerLink]="['/purchases', p.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deletePurchase(p)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="columns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">shopping_cart</mat-icon>
                  <h3>No purchases found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Add your first purchase to get started.' }}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .text-muted { color: var(--text-muted); }
  `]
})
export class PurchaseListComponent implements OnInit {
  purchases: PurchaseInvoice[] = [];
  filtered: PurchaseInvoice[] = [];
  searchQuery = '';
  columns = ['invoiceNumber', 'date', 'supplier', 'amount', 'status', 'actions'];

  constructor(
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases() {
    this.purchaseService.getAll().subscribe(data => {
      this.purchases = data;
      this.applyFilter();
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.purchases;
      return;
    }
    this.filtered = this.purchases.filter(p =>
      (p.invoiceNumber || '').toLowerCase().includes(q) ||
      (p.supplier?.name || '').toLowerCase().includes(q)
    );
  }

  deletePurchase(p: PurchaseInvoice) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Purchase', message: `Are you sure you want to delete purchase "${p.invoiceNumber}"?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.purchaseService.delete(p.id!).subscribe(() => {
          this.snackBar.open('Purchase deleted successfully', 'OK', { duration: 3000 });
          this.loadPurchases();
        });
      }
    });
  }
}
