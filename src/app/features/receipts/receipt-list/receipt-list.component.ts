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
import { ReceiptService } from '../../../core/services/receipt.service';
import { Receipt } from '../../../core/models/receipt.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-receipt-list',
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
          <h1>Customer Receipts</h1>
          <p>Track payments collected from customers</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/receipts/new">
          <mat-icon>add</mat-icon> Record Receipt
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by customer or receipt #</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">receipt</mat-icon>
            {{ filtered.length }} receipts
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="receiptNumber">
              <th mat-header-cell *matHeaderCellDef>Receipt #</th>
              <td mat-cell *matCellDef="let r">
                <span class="mono-text">{{ r.receiptNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{ r.receiptDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let r">
                <div class="name-cell" *ngIf="r.customer; else noCust">
                  <div class="avatar-circle">{{ r.customer.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ r.customer.name }}</span>
                </div>
                <ng-template #noCust><span class="text-muted">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="invoice">
              <th mat-header-cell *matHeaderCellDef>Invoice #</th>
              <td mat-cell *matCellDef="let r">
                <a *ngIf="r.salesInvoice; else noInv"
                   [routerLink]="['/invoices', r.salesInvoice.id]"
                   class="record-id">
                  {{ r.salesInvoice.invoiceNumber }}
                </a>
                <ng-template #noInv><span class="text-muted">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let r">
                <span class="pill-badge method">{{ r.paymentMethod }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let r">
                <strong>₹ {{ r.amount | number:'1.2-2' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let r" class="actions-cell">
                <a mat-icon-button color="primary" [routerLink]="['/receipts/edit', r.id]" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deleteReceipt(r)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="columns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">receipt_long</mat-icon>
                  <h3>No receipts found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Record a customer receipt to get started.' }}</p>
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
export class ReceiptListComponent implements OnInit {
  receipts: Receipt[] = [];
  filtered: Receipt[] = [];
  searchQuery = '';
  columns = ['receiptNumber', 'date', 'customer', 'invoice', 'method', 'amount', 'actions'];

  constructor(
    private receiptService: ReceiptService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts() {
    this.receiptService.getAll().subscribe(data => {
      this.receipts = data;
      this.applyFilter();
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.receipts;
      return;
    }
    this.filtered = this.receipts.filter(r =>
      (r.receiptNumber || '').toLowerCase().includes(q) ||
      (r.customer?.name || '').toLowerCase().includes(q) ||
      (r.salesInvoice?.invoiceNumber || '').toLowerCase().includes(q)
    );
  }

  deleteReceipt(r: Receipt) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Receipt', message: `Are you sure you want to delete receipt "${r.receiptNumber}"?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.receiptService.delete(r.id!).subscribe(() => {
          this.snackBar.open('Receipt deleted successfully', 'OK', { duration: 3000 });
          this.loadReceipts();
        });
      }
    });
  }
}
