import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmailService, EmailRequest } from '../../core/services/email.service';

export interface EmailDialogData {
  toEmail: string;
  subject: string;
  message: string;
  documentType: string;
  documentId: number;
  documentLabel: string; // e.g. "Invoice INV-001"
}

@Component({
  selector: 'app-email-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="email-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>mail</mat-icon>
        </div>
        <div class="header-text">
          <h2>Send {{ data.documentLabel }}</h2>
          <p>A formatted PDF will be attached automatically</p>
        </div>
      </div>

      <div class="dialog-body">
        <!-- To -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>To (Recipient Email)</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput [(ngModel)]="form.toEmail" type="email" placeholder="recipient@example.com" [disabled]="sending">
          <mat-hint>The PDF document will be attached to this email</mat-hint>
        </mat-form-field>

        <!-- Subject -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Subject</mat-label>
          <mat-icon matPrefix>subject</mat-icon>
          <input matInput [(ngModel)]="form.subject" [disabled]="sending">
        </mat-form-field>

        <!-- Message -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cover Message</mat-label>
          <mat-icon matPrefix>message</mat-icon>
          <textarea matInput [(ngModel)]="form.message" rows="4" [disabled]="sending"
            placeholder="Add a personalized message..."></textarea>
          <mat-hint>This message appears in the email body above the PDF attachment</mat-hint>
        </mat-form-field>

        <!-- PDF Attachment indicator -->
        <div class="attachment-badge">
          <mat-icon class="pdf-icon">picture_as_pdf</mat-icon>
          <div class="attachment-info">
            <span class="attachment-name">{{ getPdfFileName() }}</span>
            <span class="attachment-desc">Formatted PDF — auto-generated</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()" [disabled]="sending">
          <mat-icon>close</mat-icon> Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSend()"
          [disabled]="sending || !form.toEmail || !form.subject">
          <mat-spinner *ngIf="sending" diameter="18" class="btn-spinner"></mat-spinner>
          <mat-icon *ngIf="!sending">send</mat-icon>
          {{ sending ? 'Sending...' : 'Send Email' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .email-dialog {
      min-width: 520px;
      max-width: 620px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      background: linear-gradient(135deg, #1e40af08 0%, #2563eb08 100%);
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1e40af, #2563eb);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon mat-icon {
      color: #fff;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
    }

    .header-text p {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--text-secondary, #64748b);
    }

    .dialog-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }

    .attachment-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 8px;
    }

    .pdf-icon {
      color: #dc2626;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .attachment-info {
      display: flex;
      flex-direction: column;
    }

    .attachment-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .attachment-desc {
      font-size: 11px;
      color: #64748b;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }

    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-spinner {
      display: inline-block;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .email-dialog { min-width: unset; width: 100%; }
    }
  `]
})
export class EmailDialogComponent {
  form: EmailRequest;
  sending = false;

  constructor(
    public dialogRef: MatDialogRef<EmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmailDialogData,
    private emailService: EmailService,
    private snackBar: MatSnackBar
  ) {
    this.form = {
      toEmail: data.toEmail || '',
      subject: data.subject || '',
      message: data.message || '',
      documentType: data.documentType,
      documentId: data.documentId
    };
  }

  getPdfFileName(): string {
    switch (this.data.documentType) {
      case 'INVOICE':   return `Invoice_${this.data.documentId}.pdf`;
      case 'QUOTATION': return `Quotation_QT-${this.data.documentId}.pdf`;
      case 'RECEIPT':   return `Receipt_${this.data.documentId}.pdf`;
      case 'PAYMENT':   return `Payment_${this.data.documentId}.pdf`;
      case 'JOBSHEET':  return `JobSheet_JOB-${this.data.documentId}.pdf`;
      default:          return `Document_${this.data.documentId}.pdf`;
    }
  }

  onSend(): void {
    if (!this.form.toEmail || !this.form.subject) return;
    this.sending = true;
    this.emailService.sendEmail(this.form).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'Email sent successfully!', 'OK', {
          duration: 4000,
          panelClass: ['snack-success']
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.sending = false;
        const errMsg = err.error?.error || 'Failed to send email. Check SMTP settings.';
        this.snackBar.open(errMsg, 'Dismiss', {
          duration: 6000,
          panelClass: ['snack-error']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
