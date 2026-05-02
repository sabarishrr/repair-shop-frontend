import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage administrators and technicians</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/users/new">
          <mat-icon>person_add</mat-icon>
          Add User
        </a>
      </div>

      <mat-card class="user-card">
        <div class="table-wrapper">
          <table mat-table [dataSource]="users" class="user-table">

            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Full Name</th>
              <td mat-cell *matCellDef="let u">
                <div class="name-cell">
                  <div class="avatar">{{ u.fullName.charAt(0).toUpperCase() }}</div>
                  <span>{{ u.fullName }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let u">{{ u.username }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u">
                <span class="role-badge" [class.admin]="u.role === 'ADMIN'">{{ u.role }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let u" class="actions-cell">
                <a mat-icon-button [routerLink]="['/users/edit', u.id]" color="primary" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(u)"
                        [disabled]="u.username === 'admin'" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>group</mat-icon>
                  <p>No users found.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-card {
      padding: 24px !important;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .user-table { width: 100%; }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #047857);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(139, 148, 158, 0.15);
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.04em;

      &.admin {
        background: rgba(88, 166, 255, 0.15);
        color: #58a6ff;
      }
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
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns = ['fullName', 'username', 'role', 'actions'];

  constructor(
    private svc: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getAll().subscribe(u => this.users = u);
  }

  delete(u: User): void {
    if (u.username === 'admin') {
      this.snackBar.open('Cannot delete the default admin account.', 'OK', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Are you sure you want to delete "${u.username}"?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(u.id!).subscribe(() => {
          this.snackBar.open('User deleted.', 'OK', { duration: 3000 });
          this.load();
        });
      }
    });
  }
}
