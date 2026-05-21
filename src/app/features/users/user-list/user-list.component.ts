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
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTooltipModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage administrators and technicians</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/users/new">
          <mat-icon>person_add</mat-icon> Add User
        </a>
      </div>

      <mat-card class="list-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search by name or username</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">manage_accounts</mat-icon>
            {{ filtered.length }} users
          </span>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table mat-table [dataSource]="filtered" class="data-table">

            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Full Name</th>
              <td mat-cell *matCellDef="let u">
                <div class="name-cell">
                  <div class="avatar-circle" [class.orange]="u.role === 'ADMIN'">
                    {{ u.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ u.fullName }}</span>
                    <span class="user-sub">{{ u.username }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let u">
                <span class="mono-text">{{ u.username }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u">
                <span class="role-badge" [class.admin]="u.role === 'ADMIN'">
                  <mat-icon>{{ u.role === 'ADMIN' ? 'admin_panel_settings' : 'engineering' }}</mat-icon>
                  {{ u.role }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let u" class="actions-cell">
                <a mat-icon-button color="primary" [routerLink]="['/users/edit', u.id]" matTooltip="Edit User">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn"
                        (click)="delete(u)"
                        [disabled]="u.username === 'admin'"
                        matTooltip="{{ u.username === 'admin' ? 'Cannot delete default admin' : 'Delete User' }}">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">manage_accounts</mat-icon>
                  <h3>No users found</h3>
                  <p>{{ searchQuery ? 'Try adjusting your search.' : 'Add a new user to get started.' }}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-info { display: flex; flex-direction: column; }
    .user-name  { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-sub   { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: rgba(139,148,158,.15);
      color: #8b949e;

      mat-icon { font-size: 13px; width: 13px; height: 13px; }

      &.admin {
        background: rgba(88,166,255,.15);
        color: #58a6ff;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  searchQuery = '';
  displayedColumns = ['fullName', 'username', 'role', 'actions'];

  constructor(
    private svc: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getAll().subscribe(u => {
      this.users = u;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.users;
      return;
    }
    this.filtered = this.users.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.role?.toLowerCase() ?? '').includes(q)
    );
  }

  delete(u: User): void {
    if (u.username === 'admin') {
      this.snackBar.open('Cannot delete the default admin account.', 'OK', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Are you sure you want to delete user "${u.fullName}" (@${u.username})?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(u.id!).subscribe(() => {
          this.snackBar.open('User deleted successfully.', 'OK', { duration: 3000 });
          this.load();
        });
      }
    });
  }
}
