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
import { CreditNoteService } from '../../../core/services/credit-note.service';
import { CreditNote } from '../../../core/models/credit-note.model';

@Component({
  selector: 'app-credit-note-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Credit Notes</h1>
          <p>Manage sales returns, discounts, and customer billing adjustments</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/credit-notes/new">
          <mat-icon>add</mat-icon> Create Credit Note
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by note # or customer</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">receipt_long</mat-icon>
            {{ filtered.length }} credit notes
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="noteNumber">
              <th mat-header-cell *matHeaderCellDef>Credit Note #</th>
              <td mat-cell *matCellDef="let note">
                <span class="mono-text">{{ note.noteNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let note">{{ note.noteDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let note">
                <div class="name-cell" *ngIf="note.customer; else noCust">
                  <div class="avatar-circle">{{ note.customer.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ note.customer.name }}</span>
                </div>
                <ng-template #noCust><span style="color:var(--text-muted)">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="invoiceRef">
              <th mat-header-cell *matHeaderCellDef>Invoice Ref</th>
              <td mat-cell *matCellDef="let note">
                <a *ngIf="note.salesInvoice; else noRef" [routerLink]="['/invoices', note.salesInvoice.id]" class="ref-link">
                  {{ note.salesInvoice.invoiceNumber }}
                </a>
                <ng-template #noRef><span style="color:var(--text-muted)">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let note">
                <span class="pill-badge type-badge">{{ getFriendlyReason(note.reason) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Total Adjusted</th>
              <td mat-cell *matCellDef="let note">
                <strong>₹ {{ note.grandTotal | number:'1.2-2' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let note">
                <span class="pill-badge"
                      [class.paid]="note.status === 'ACTIVE'"
                      [class.cancelled]="note.status === 'CANCELLED'">
                  {{ note.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let note" class="actions-cell">
                <a mat-icon-button color="accent" [routerLink]="['/credit-notes', note.id]" matTooltip="View & Print">
                  <mat-icon>print</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="cancelNote(note)" *ngIf="note.status === 'ACTIVE'" matTooltip="Cancel Note">
                  <mat-icon>block</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteNote(note)" matTooltip="Delete Note">
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
                  <h3>No credit notes found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Create your first credit note to adjust ledger balances.' }}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .ref-link { color: #3f51b5; text-decoration: none; font-weight: 500; }
    .ref-link:hover { text-decoration: underline; }
    .cancelled { background: rgba(244, 67, 54, 0.15) !important; color: #f44336 !important; }
    .type-badge { background: rgba(0, 0, 0, 0.05); color: var(--text-primary); }
  `]
})
export class CreditNoteListComponent implements OnInit {
  notes: CreditNote[] = [];
  filtered: CreditNote[] = [];
  searchQuery = '';
  columns = ['noteNumber', 'date', 'customer', 'invoiceRef', 'reason', 'amount', 'status', 'actions'];

  constructor(
    private creditNoteService: CreditNoteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes() {
    this.creditNoteService.getAll().subscribe({
      next: (data) => {
        this.notes = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error fetching credit notes:', err)
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.notes;
      return;
    }
    this.filtered = this.notes.filter(n =>
      (n.noteNumber || '').toLowerCase().includes(q) ||
      (n.customer?.name || '').toLowerCase().includes(q) ||
      (n.salesInvoice?.invoiceNumber || '').toLowerCase().includes(q)
    );
  }

  getFriendlyReason(reason: string): string {
    switch (reason) {
      case 'SALES_RETURN': return 'Sales Return';
      case 'POST_SALES_DISCOUNT': return 'Post-Sale Discount';
      case 'CORRECTION_IN_INVOICE': return 'Invoice Correction';
      default: return 'Other Adjustment';
    }
  }

  cancelNote(note: CreditNote) {
    if (confirm(`Are you sure you want to cancel Credit Note ${note.noteNumber}? This will reverse inventory reconciliation if applicable.`)) {
      this.creditNoteService.cancel(note.id!).subscribe({
        next: () => {
          this.snackBar.open('Credit Note cancelled successfully', 'OK', { duration: 3000 });
          this.loadNotes();
        },
        error: (err) => {
          this.snackBar.open('Error cancelling credit note: ' + (err.error?.message || err.message), 'OK', { duration: 5000 });
        }
      });
    }
  }

  deleteNote(note: CreditNote) {
    if (confirm(`Are you sure you want to permanently delete Credit Note ${note.noteNumber}? This will remove it from the ledger.`)) {
      this.creditNoteService.delete(note.id!).subscribe({
        next: () => {
          this.snackBar.open('Credit Note deleted successfully', 'OK', { duration: 3000 });
          this.loadNotes();
        },
        error: (err) => {
          this.snackBar.open('Error deleting credit note: ' + (err.error?.message || err.message), 'OK', { duration: 5000 });
        }
      });
    }
  }
}
