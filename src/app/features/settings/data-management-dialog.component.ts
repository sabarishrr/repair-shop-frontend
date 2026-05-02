import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BackupService } from '../../core/services/backup.service';

@Component({
  selector: 'app-data-management-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, MatSnackBarModule],
  template: `
    <div class="data-mgmt-container">
      <div class="dialog-header">
        <div class="header-title">
          <mat-icon>storage</mat-icon>
          <h2>Data Management Center</h2>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-content">
        <p class="description">Manage your system data, create secure encrypted backups, or restore your database from a previous state.</p>

        <div class="action-cards">
          <!-- Backup Card -->
          <div class="mgmt-card">
            <div class="card-icon backup-icon">
              <mat-icon>cloud_download</mat-icon>
            </div>
            <div class="card-info">
              <h3>Secure Data Backup</h3>
              <p>Generate a full AES-128 encrypted snapshot of your database. Keep this file safe for future recovery.</p>
              <button mat-flat-button color="primary" (click)="downloadBackup()">
                <mat-icon>download</mat-icon>
                Create Backup
              </button>
            </div>
          </div>

          <!-- Restore Card -->
          <div class="mgmt-card">
            <div class="card-icon restore-icon">
              <mat-icon>history_edu</mat-icon>
            </div>
            <div class="card-info">
              <h3>Database Restoration</h3>
              <p>Restore your database from an encrypted backup file. <span class="warn-text">This will overwrite all current data.</span></p>
              <button mat-stroked-button color="warn" (click)="fileInput.click()">
                <mat-icon>upload_file</mat-icon>
                Upload & Restore
              </button>
              <input type="file" #fileInput style="display: none" accept=".sql" (change)="onFileSelected($event)">
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <span class="status-text">Encryption Status: <span class="status-active">AES-128 Active</span></span>
        <button mat-button (click)="close()">Dismiss</button>
      </div>
    </div>
  `,
  styles: [`
    .data-mgmt-container {
      background: #1c2128;
      color: #adbac7;
      border-radius: 12px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      mat-icon { color: var(--accent-blue); font-size: 28px; width: 28px; height: 28px; }
      h2 { margin: 0; font-size: 20px; font-weight: 600; color: #f0f6fc; }
    }

    .close-btn { color: #768390; }

    .dialog-content {
      padding: 24px;
    }

    .description {
      margin-bottom: 24px;
      font-size: 14px;
      color: #768390;
      line-height: 1.5;
    }

    .action-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mgmt-card {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--accent-blue);
      }
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 26px; width: 26px; height: 26px; }
    }

    .backup-icon { background: rgba(56, 139, 253, 0.15); color: #58a6ff; }
    .restore-icon { background: rgba(248, 81, 73, 0.15); color: #ff7b72; }

    .card-info {
      flex: 1;
      h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #f0f6fc; }
      p { margin: 0 0 16px; font-size: 13px; color: #768390; line-height: 1.4; }
    }

    .warn-text { color: #ff7b72; font-weight: 500; }

    .dialog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.2);
    }

    .status-text { font-size: 12px; color: #768390; }
    .status-active { color: #3fb950; font-weight: 600; }

    button[mat-flat-button] {
      background: var(--gradient-1) !important;
      color: white !important;
    }
  `]
})
export class DataManagementDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DataManagementDialogComponent>,
    private backupService: BackupService,
    private snackBar: MatSnackBar
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  downloadBackup(): void {
    this.snackBar.open('Preparing secure backup...', 'Close', { duration: 3000 });
    
    this.backupService.downloadBackup().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `repair_shop_secure_backup_${timestamp}.bin`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.snackBar.open('Encrypted backup downloaded!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('Backup failed', err);
        this.snackBar.open('Backup failed. Please check server logs.', 'OK', { duration: 5000 });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (confirm('CRITICAL WARNING: This will overwrite ALL current data in the system. Are you absolutely sure?')) {
        this.snackBar.open('Restoring and decrypting data...', 'Close', { duration: 5000 });
        this.backupService.restoreBackup(file).subscribe({
          next: () => {
            this.snackBar.open('Restore successful! Application will reload.', 'OK', { duration: 5000 });
            setTimeout(() => window.location.reload(), 3000);
          },
          error: (err) => {
            console.error('Restore failed', err);
            this.snackBar.open('Restore failed. Invalid file or corrupted encryption.', 'OK', { duration: 10000 });
          }
        });
      }
    }
    event.target.value = '';
  }
}
