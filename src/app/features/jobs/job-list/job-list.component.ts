import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JobSheetService } from '../../../core/services/job-sheet.service';
import { JobSheet, JOB_STATUSES, JobStatus } from '../../../core/models/job-sheet.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Job Sheets</h1>
          <p>Track and manage repair jobs</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/jobs/new">
          <mat-icon>add_circle</mat-icon>
          New Job
        </a>
      </div>

      <mat-card class="job-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Search jobs, customers</mat-label>
            <input matInput (input)="onSearch($event)">
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select (selectionChange)="onStatusFilter($event.value)">
              <mat-option value="">All Statuses</mat-option>
              <mat-option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="jobs" class="job-table">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Job ID</th>
              <td mat-cell *matCellDef="let job">
                <strong class="job-id">#JOB-{{ job.id }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let job">{{ job.customer?.name || 'Unknown' }}</td>
            </ng-container>

            <ng-container matColumnDef="device">
              <th mat-header-cell *matHeaderCellDef>Device</th>
              <td mat-cell *matCellDef="let job">
                {{ job.deviceType }}
                <span class="brand-tag" *ngIf="job.brand">({{ job.brand }})</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let job">
                <span class="status-badge {{ job.status }}">{{ job.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Received</th>
              <td mat-cell *matCellDef="let job">{{ job.receivedDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="deliveredDate">
              <th mat-header-cell *matHeaderCellDef>Delivered</th>
              <td mat-cell *matCellDef="let job">
                <span *ngIf="job.deliveredDate">{{ job.deliveredDate | date:'mediumDate' }}</span>
                <span *ngIf="!job.deliveredDate" class="text-muted">—</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let job" class="actions-cell">
                <a mat-icon-button [routerLink]="['/jobs', job.id]" color="accent" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </a>
                <a mat-icon-button [routerLink]="['/jobs', job.id, 'edit']" color="primary" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(job)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>assignment</mat-icon>
                  <p>No job sheets found.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .job-card {
      padding: 24px !important;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0 8px;
      flex-wrap: wrap;
    }

    .search-field { flex: 1; min-width: 200px; max-width: 320px; }
    .filter-field { width: 180px; }

    .table-wrapper {
      overflow-x: auto;
    }

    .job-table { width: 100%; }

    .job-id { color: var(--accent-blue); }

    .brand-tag {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .text-muted {
      color: var(--text-muted);
    }

    .actions-header { text-align: right !important; }
    .actions-cell { text-align: right; white-space: nowrap; }

    .empty-state {
      text-align: center;
      padding: 48px 0;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-secondary); font-size: 14px; }
    }
  `]
})
export class JobListComponent implements OnInit {
  jobs: JobSheet[] = [];
  statuses = JOB_STATUSES;
  displayedColumns = ['id', 'customer', 'device', 'status', 'date', 'deliveredDate', 'actions'];
  searchQ = '';
  statusQ = '';

  constructor(
    private svc: JobSheetService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getAll(this.searchQ, (this.statusQ as JobStatus) || undefined).subscribe(data => this.jobs = data);
  }

  onSearch(e: Event): void {
    this.searchQ = (e.target as HTMLInputElement).value.trim();
    this.load();
  }

  onStatusFilter(value: string): void {
    this.statusQ = value;
    this.load();
  }

  delete(job: JobSheet): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Job', message: `Are you sure you want to delete Job #JOB-${job.id}?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(job.id!).subscribe(() => {
          this.snackBar.open('Job deleted.', 'OK', { duration: 3000 });
          this.load();
        });
      }
    });
  }
}
