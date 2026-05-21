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
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payment-list',
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
          <h1>Supplier Payments</h1>
          <p>Track payouts made to suppliers</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/payments/new">
          <mat-icon>add</mat-icon> Record Payment
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by supplier or payment #</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">payments</mat-icon>
            {{ filtered.length }} payments
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="paymentNumber">
              <th mat-header-cell *matHeaderCellDef>Payment #</th>
              <td mat-cell *matCellDef="let p">
                <span class="mono-text">{{ p.paymentNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let p">{{ p.paymentDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="supplier">
              <th mat-header-cell *matHeaderCellDef>Supplier</th>
              <td mat-cell *matCellDef="let p">
                <div class="name-cell" *ngIf="p.supplier; else noSupplier">
                  <div class="avatar-circle green">{{ p.supplier.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ p.supplier.name }}</span>
                </div>
                <ng-template #noSupplier><span class="text-muted">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="purchase">
              <th mat-header-cell *matHeaderCellDef>Purchase Invoice</th>
              <td mat-cell *matCellDef="let p">
                <span class="record-id" *ngIf="p.purchaseInvoice; else noPurchase">
                  {{ p.purchaseInvoice.invoiceNumber }}
                </span>
                <ng-template #noPurchase><span class="text-muted">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let p">
                <span class="pill-badge method">{{ p.paymentMethod }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let p">
                <strong>₹ {{ p.amount | number:'1.2-2' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let p" class="actions-cell">
                <a mat-icon-button color="primary" [routerLink]="['/payments/edit', p.id]" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deletePayment(p)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="columns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">payments</mat-icon>
                  <h3>No payments found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Record a supplier payment to get started.' }}</p>
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
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  filtered: Payment[] = [];
  searchQuery = '';
  columns = ['paymentNumber', 'date', 'supplier', 'purchase', 'method', 'amount', 'actions'];

  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getAll().subscribe(data => {
      this.payments = data;
      this.applyFilter();
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.payments;
      return;
    }
    this.filtered = this.payments.filter(p =>
      (p.paymentNumber || '').toLowerCase().includes(q) ||
      (p.supplier?.name || '').toLowerCase().includes(q) ||
      (p.purchaseInvoice?.invoiceNumber || '').toLowerCase().includes(q)
    );
  }

  deletePayment(p: Payment) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Payment', message: `Are you sure you want to delete payment "${p.paymentNumber}"?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.paymentService.delete(p.id!).subscribe(() => {
          this.snackBar.open('Payment deleted successfully', 'OK', { duration: 3000 });
          this.loadPayments();
        });
      }
    });
  }
}
