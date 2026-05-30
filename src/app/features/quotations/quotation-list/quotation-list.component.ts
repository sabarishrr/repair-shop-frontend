import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { QuotationService, Quotation } from '../../../core/services/quotation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    RouterModule, MatSnackBarModule, MatCardModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Quotations</h1>
          <p>Manage and create price estimates</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/quotations/new">
          <mat-icon>add</mat-icon> Create Quotation
        </a>
      </div>

      <mat-card class="list-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search quotations</mat-label>
              <input matInput (input)="onSearch($event)">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">request_quote</mat-icon>
            {{ filteredQuotations.length }} quotations
          </span>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="filteredQuotations" class="data-table">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> Quotation ID </th>
              <td mat-cell *matCellDef="let q">
                <a [routerLink]="['/quotations', q.id]" class="clickable-id">
                  <strong class="quotation-id">#QT-{{q.id}}</strong>
                </a>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date </th>
              <td mat-cell *matCellDef="let q"> {{q.createdAt | date:'mediumDate'}} </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef> Customer </th>
              <td mat-cell *matCellDef="let q">
                {{q.customer.name}}
              </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef> Grand Total </th>
              <td mat-cell *matCellDef="let q"> <strong class="total-text">Rs. {{q.grandTotal | number:'1.2-2'}}</strong> </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
              <td mat-cell *matCellDef="let q" class="actions-cell">
                <a mat-icon-button color="accent" [routerLink]="['/quotations', q.id]" matTooltip="View / Print">
                  <mat-icon>visibility</mat-icon>
                </a>
                <a mat-icon-button color="primary" [routerLink]="['/quotations', q.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deleteQuotation(q)" matTooltip="Delete"
                        *ngIf="isAdmin()">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">request_quote</mat-icon>
                  <h3>No quotations found</h3>
                  <p>Try adjusting your search or create a new quotation.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .quotation-id { color: var(--accent-blue); }
    .clickable-id { text-decoration: none; }
    .clickable-id:hover .quotation-id { text-decoration: underline; opacity: 0.8; }
    .total-text { font-size: 15px; font-weight: 600; }
  `]
})
export class QuotationListComponent implements OnInit {
  quotations: Quotation[] = [];
  filteredQuotations: Quotation[] = [];
  displayedColumns: string[] = ['id', 'date', 'customer', 'total', 'actions'];

  constructor(
    private svc: QuotationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.svc.getAll().subscribe(data => {
      this.quotations = data;
      this.filteredQuotations = data;
    });
  }

  onSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    if (!q) {
      this.filteredQuotations = this.quotations;
      return;
    }
    this.filteredQuotations = this.quotations.filter(qt => 
      qt.customer.name.toLowerCase().includes(q) || 
      qt.customer.phone.includes(q) ||
      `#qt-${qt.id}`.includes(q)
    );
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
  }

  deleteQuotation(q: Quotation) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Quotation', message: `Are you sure you want to delete Quotation #QT-${q.id}?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(q.id!).subscribe(() => {
          this.snackBar.open('Quotation deleted', 'OK', { duration: 3000 });
          this.loadData();
        });
      }
    });
  }
}
