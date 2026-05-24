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
import { DebitNoteService } from '../../../core/services/debit-note.service';
import { DebitNote } from '../../../core/models/debit-note.model';

@Component({
  selector: 'app-debit-note-list',
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
          <h1>Debit Notes</h1>
          <p>Manage purchase returns, rate adjustments, and supplier billing corrections</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/debit-notes/new">
          <mat-icon>add</mat-icon> Create Debit Note
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by note # or supplier</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">receipt_long</mat-icon>
            {{ filtered.length }} debit notes
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="noteNumber">
              <th mat-header-cell *matHeaderCellDef>Debit Note #</th>
              <td mat-cell *matCellDef="let note">
                <span class="mono-text">{{ note.noteNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let note">{{ note.noteDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="supplier">
              <th mat-header-cell *matHeaderCellDef>Supplier</th>
              <td mat-cell *matCellDef="let note">
                <div class="name-cell" *ngIf="note.supplier; else noSup">
                  <div class="avatar-circle" style="background: #475569;">{{ note.supplier.name.charAt(0).toUpperCase() }}</div>
                  <span>{{ note.supplier.name }}</span>
                </div>
                <ng-template #noSup><span style="color:var(--text-muted)">—</span></ng-template>
              </td>
            </ng-container>

            <ng-container matColumnDef="purchaseInvoiceRef">
              <th mat-header-cell *matHeaderCellDef>Purchase Ref</th>
              <td mat-cell *matCellDef="let note">
                <span class="mono-text" style="color: #64748b;" *ngIf="note.purchaseInvoice">
                  {{ note.purchaseInvoice.invoiceNumber }}
                </span>
                <span *ngIf="!note.purchaseInvoice" style="color:var(--text-muted)">—</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let note">
                <span class="pill-badge type-badge">{{ getFriendlyReason(note.reason) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Total Reduced</th>
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
                <a mat-icon-button color="accent" [routerLink]="['/debit-notes', note.id]" matTooltip="View & Print">
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
                  <h3>No debit notes found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Create your first debit note to adjust supplier balances.' }}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .cancelled { background: rgba(244, 67, 54, 0.15) !important; color: #f44336 !important; }
    .type-badge { background: rgba(0, 0, 0, 0.05); color: var(--text-primary); }
  `]
})
export class DebitNoteListComponent implements OnInit {
  notes: DebitNote[] = [];
  filtered: DebitNote[] = [];
  searchQuery = '';
  columns = ['noteNumber', 'date', 'supplier', 'purchaseInvoiceRef', 'reason', 'amount', 'status', 'actions'];

  constructor(
    private debitNoteService: DebitNoteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes() {
    this.debitNoteService.getAll().subscribe({
      next: (data) => {
        this.notes = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error fetching debit notes:', err)
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
      (n.supplier?.name || '').toLowerCase().includes(q)
    );
  }

  getFriendlyReason(reason: string): string {
    switch (reason) {
      case 'PURCHASE_RETURN': return 'Purchase Return';
      case 'PRICE_CORRECTION': return 'Price Adjustment';
      case 'CORRECTION_IN_INVOICE': return 'Invoice Correction';
      default: return 'Other Correction';
    }
  }

  cancelNote(note: DebitNote) {
    if (confirm(`Are you sure you want to cancel Debit Note ${note.noteNumber}? This will reverse inventory stock levels.`)) {
      this.debitNoteService.cancel(note.id!).subscribe({
        next: () => {
          this.snackBar.open('Debit Note cancelled successfully', 'OK', { duration: 3000 });
          this.loadNotes();
        },
        error: (err) => {
          this.snackBar.open('Error cancelling debit note: ' + (err.error?.message || err.message), 'OK', { duration: 5000 });
        }
      });
    }
  }

  deleteNote(note: DebitNote) {
    if (confirm(`Are you sure you want to permanently delete Debit Note ${note.noteNumber}? This will remove it from supplier books.`)) {
      this.debitNoteService.delete(note.id!).subscribe({
        next: () => {
          this.snackBar.open('Debit Note deleted successfully', 'OK', { duration: 3000 });
          this.loadNotes();
        },
        error: (err) => {
          this.snackBar.open('Error deleting debit note: ' + (err.error?.message || err.message), 'OK', { duration: 5000 });
        }
      });
    }
  }
}
