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
import { SalesInvoiceService } from '../../../core/services/sales-invoice.service';
import { SalesInvoice } from '../../../core/models/sales-invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Sales Invoices</h1>
          <p>Generate and manage tax invoices</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/invoices/new">
          <mat-icon>add</mat-icon> Create Invoice
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by invoice # or customer</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">receipt_long</mat-icon>
            {{ filtered.length }} invoices
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="invoiceNumber">
              <th mat-header-cell *matHeaderCellDef>Invoice #</th>
              <td mat-cell *matCellDef="let inv">
                <span class="mono-text">{{ inv.invoiceNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let inv">{{ inv.invoiceDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let inv">
                <div class="name-cell" *ngIf="inv.customer; else noCust">
                  <div class="avatar-circle">{{ inv.customer.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ inv.customer.name }}</span>
                </div>
                <ng-template #noCust><span style="color:var(--text-muted)">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="salesType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let inv">
                <span class="pill-badge"
                      [class.cash]="(inv.salesType || 'CASH') === 'CASH'"
                      [class.credit]="inv.salesType === 'CREDIT'">
                  {{ inv.salesType || 'CASH' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Total Amount</th>
              <td mat-cell *matCellDef="let inv">
                <strong>₹ {{ inv.grandTotal | number:'1.2-2' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Payment Status</th>
              <td mat-cell *matCellDef="let inv">
                <span class="pill-badge"
                      [class.paid]="inv.status === 'PAID'"
                      [class.unpaid]="inv.status === 'UNPAID'">
                  {{ inv.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let inv" class="actions-cell">
                <a mat-icon-button color="primary" [routerLink]="['/invoices', inv.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <a mat-icon-button color="accent" [routerLink]="['/invoices', inv.id]" matTooltip="View & Print">
                  <mat-icon>print</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="columns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">receipt_long</mat-icon>
                  <h3>No invoices found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Create your first invoice to get started.' }}</p>
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
export class InvoiceListComponent implements OnInit {
  invoices: SalesInvoice[] = [];
  filtered: SalesInvoice[] = [];
  searchQuery = '';
  columns = ['invoiceNumber', 'date', 'customer', 'salesType', 'amount', 'status', 'actions'];

  constructor(private invoiceService: SalesInvoiceService) {}

  ngOnInit(): void {
    this.invoiceService.getAll().subscribe(data => {
      this.invoices = data;
      this.applyFilter();
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.invoices;
      return;
    }
    this.filtered = this.invoices.filter(inv =>
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.customer?.name || '').toLowerCase().includes(q) ||
      (inv.customer?.phone || '').includes(q)
    );
  }
}
