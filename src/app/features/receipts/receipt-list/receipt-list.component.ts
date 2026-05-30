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
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { EmailDialogComponent } from '../../../shared/email-dialog/email-dialog.component';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

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
                <button mat-icon-button color="accent" (click)="sendEmail(r)"
                  matTooltip="Send Email" [disabled]="!r.customer?.email">
                  <mat-icon>email</mat-icon>
                </button>
                <button mat-icon-button class="wa-icon-btn" (click)="sendWhatsApp(r)"
                  matTooltip="WhatsApp" [disabled]="!r.customer?.phone">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.102 1.518 5.826L0 24l6.336-1.491A11.933 11.933 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.385 14.518c-.295-.147-1.745-.86-2.016-.957-.27-.098-.467-.147-.663.147-.196.295-.76.957-.932 1.154-.172.196-.344.22-.638.074-.295-.147-1.244-.459-2.368-1.462-.875-.78-1.466-1.744-1.637-2.039-.172-.295-.018-.454.129-.6.132-.132.295-.344.442-.517.147-.172.196-.295.295-.491.098-.196.049-.368-.025-.515-.074-.147-.663-1.598-.908-2.187-.239-.574-.483-.496-.663-.505l-.565-.01c-.196 0-.516.074-.786.368-.27.295-1.032 1.008-1.032 2.459s1.057 2.852 1.204 3.048c.147.196 2.08 3.177 5.042 4.457.705.305 1.255.486 1.684.623.708.225 1.352.193 1.861.117.568-.085 1.745-.713 1.991-1.402.245-.688.245-1.277.172-1.402-.074-.123-.27-.196-.565-.344z"/></svg>
                </button>
                <a mat-icon-button color="primary" [routerLink]="['/receipts/edit', r.id]" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deleteReceipt(r)" matTooltip="Delete"
                        *ngIf="isAdmin()">
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
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private whatsapp: WhatsAppService
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

  sendEmail(r: Receipt) {
    this.dialog.open(EmailDialogComponent, {
      data: {
        toEmail: r.customer?.email || '',
        subject: `Payment Receipt ${r.receiptNumber}`,
        message: `Dear ${r.customer?.name || 'Customer'},\n\nThank you for your payment! Please find attached your receipt ${r.receiptNumber} for ₹${r.amount}.\n\nWe appreciate your business!`,
        documentType: 'RECEIPT',
        documentId: r.id!,
        documentLabel: `Receipt ${r.receiptNumber}`
      },
      width: '620px'
    });
  }

  sendWhatsApp(r: Receipt) {
    if (!r.customer?.phone) return;
    this.whatsapp.sendReceipt(
      r.customer.phone,
      r.customer.name || 'Customer',
      r.receiptNumber!,
      r.amount ?? 0,
      'Us'
    );
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
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
