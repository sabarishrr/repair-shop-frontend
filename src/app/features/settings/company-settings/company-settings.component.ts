import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';
import { StateService, State } from '../../../core/services/state.service';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatSnackBarModule, MatSelectModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Company Settings</h1>
          <p>Manage your company information</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">

        <!-- Company Info Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">business</mat-icon>
            <h3>Company Information</h3>
          </div>

          <div class="form-grid">
            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Company Name</mat-label>
                <input matInput formControlName="companyName" placeholder="e.g. TechFix Pro">
                <mat-icon matPrefix>store</mat-icon>
                <mat-error>Company name is required</mat-error>
              </mat-form-field>
            </div>

            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Address</mat-label>
                <textarea matInput formControlName="address" rows="3"
                          placeholder="e.g. 123 Repair Street, Tech City, State - 600001"></textarea>
                <mat-icon matPrefix>location_on</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" placeholder="e.g. +91 98765 43210">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="e.g. support@techfix.pro">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error>Enter a valid email</mat-error>
            </mat-form-field>
          </div>
        </mat-card>

        <!-- Tax & Branding Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">receipt_long</mat-icon>
            <h3>Tax & Branding</h3>
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>GST Number</mat-label>
              <input matInput formControlName="gstNumber" placeholder="e.g. 29AAACB1234F1Z5">
              <mat-icon matPrefix>badge</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>State</mat-label>
              <mat-select formControlName="state" [compareWith]="compareState">
                <mat-option *ngFor="let s of states" [value]="s">
                  {{ s.name }} ({{ s.gstCode }})
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>map</mat-icon>
            </mat-form-field>

            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Logo URL</mat-label>
                <input matInput formControlName="logoUrl" placeholder="https://example.com/logo.png">
                <mat-icon matPrefix>image</mat-icon>
              </mat-form-field>
            </div>

            <div class="span-2 logo-preview-container" *ngIf="form.get('logoUrl')?.value">
              <label class="preview-label">Logo Preview</label>
              <div class="logo-preview">
                <img [src]="form.get('logoUrl')?.value"
                     alt="Company Logo"
                     (error)="onLogoError($event)"
                     class="logo-img">
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Serial Numbers Configuration Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">format_list_numbered</mat-icon>
            <h3>Serialized Document Numbering</h3>
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Invoice Number Prefix</mat-label>
              <input matInput formControlName="invoicePrefix" placeholder="e.g. INV-">
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Invoice Number (Starting No)</mat-label>
              <input matInput type="number" formControlName="nextInvoiceNo" min="1">
              <mat-icon matPrefix>pin</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Receipt Number Prefix</mat-label>
              <input matInput formControlName="receiptPrefix" placeholder="e.g. RCP-">
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Receipt Number (Starting No)</mat-label>
              <input matInput type="number" formControlName="nextReceiptNo" min="1">
              <mat-icon matPrefix>pin</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Payment Number Prefix</mat-label>
              <input matInput formControlName="paymentPrefix" placeholder="e.g. PMT-">
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Payment Number (Starting No)</mat-label>
              <input matInput type="number" formControlName="nextPaymentNo" min="1">
              <mat-icon matPrefix>pin</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Credit Note Prefix</mat-label>
              <input matInput formControlName="creditNotePrefix" placeholder="e.g. CN-">
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Credit Note Number</mat-label>
              <input matInput type="number" formControlName="nextCreditNoteNo" min="1">
              <mat-icon matPrefix>pin</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Debit Note Prefix</mat-label>
              <input matInput formControlName="debitNotePrefix" placeholder="e.g. DN-">
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Next Debit Note Number</mat-label>
              <input matInput type="number" formControlName="nextDebitNoteNo" min="1">
              <mat-icon matPrefix>pin</mat-icon>
            </mat-form-field>
          </div>
        </mat-card>

        <!-- Bank Details Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">account_balance</mat-icon>
            <h3>Bank Details (For Invoices)</h3>
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Bank Name</mat-label>
              <input matInput formControlName="bankName" placeholder="e.g. HDFC Bank">
              <mat-icon matPrefix>account_balance</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Account Number</mat-label>
              <input matInput formControlName="accountNumber" placeholder="e.g. 50100234567890">
              <mat-icon matPrefix>pin</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Branch & IFS Code</mat-label>
              <input matInput formControlName="branchIfsCode" placeholder="e.g. MG Road, HDFC0001234">
              <mat-icon matPrefix>account_tree</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>UPI ID</mat-label>
              <input matInput formControlName="upiId" placeholder="e.g. shopname@upi">
              <mat-icon matPrefix>qr_code_2</mat-icon>
              <mat-hint>Used to generate a payment QR on invoices & job sheets</mat-hint>
            </mat-form-field>

            <div class="span-2 upi-preview" *ngIf="form.get('upiId')?.value">
              <label class="preview-label">UPI QR Preview (generic — amount filled at print time)</label>
              <img [src]="getUpiQrPreview()" alt="UPI QR" style="width:120px;height:120px;border:1px solid var(--border);border-radius:8px;background:#fff;padding:4px;">
              <p style="font-size:11px;color:var(--text-muted);margin-top:6px;">{{ form.get('upiId')?.value }}</p>
            </div>
          </div>
        </mat-card>

        <!-- Actions -->
        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="reset()">
            <mat-icon>undo</mat-icon>
            Reset
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="saving || form.pristine">
            <mat-icon>save</mat-icon>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

      </form>

      <!-- Info Card -->
      <mat-card class="info-card" *ngIf="lastUpdated">
        <mat-icon>info_outline</mat-icon>
        <span>Last updated: {{ lastUpdated | date:'medium' }}</span>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
      padding: 24px !important;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .section-icon {
      color: var(--accent-blue);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .section-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }

    .span-2 { grid-column: span 2; }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo-preview-container {
      margin-top: 4px;
    }

    .preview-label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .logo-preview {
      background: var(--bg-elevated);
      border: 1px dashed var(--border);
      border-radius: var(--radius-md);
      padding: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }

    .logo-img {
      max-height: 80px;
      max-width: 240px;
      object-fit: contain;
    }

    .info-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px !important;
      font-size: 13px;
      color: var(--text-secondary);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--accent-blue);
      }
    }
  `]
})
export class CompanySettingsComponent implements OnInit {
  saving = false;
  lastUpdated?: string;
  states: State[] = [];
  private originalValues: any;

  form = this.fb.group({
    companyName: ['', Validators.required],
    address:     [''],
    phone:       [''],
    email:       ['', Validators.email],
    logoUrl:     [''],
    gstNumber:   [''],
    state:       [null as State | null],
    bankName:      [''],
    accountNumber: [''],
    branchIfsCode: [''],
    upiId:         [''],
    nextInvoiceNo: [1, [Validators.required, Validators.min(1)]],
    nextReceiptNo: [1, [Validators.required, Validators.min(1)]],
    nextPaymentNo: [1, [Validators.required, Validators.min(1)]],
    nextCreditNoteNo: [1, [Validators.required, Validators.min(1)]],
    nextDebitNoteNo: [1, [Validators.required, Validators.min(1)]],
    invoicePrefix: ['INV-', Validators.required],
    receiptPrefix: ['REC-', Validators.required],
    paymentPrefix: ['PAY-', Validators.required],
    creditNotePrefix: ['CN-', Validators.required],
    debitNotePrefix: ['DN-', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private svc: CompanyDetailsService,
    private stateSvc: StateService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.stateSvc.getAll().subscribe(data => this.states = data);
    this.load();
  }

  load(): void {
    this.svc.get().subscribe(details => {
      this.form.patchValue({
        companyName: details.companyName || '',
        address:     details.address || '',
        phone:       details.phone || '',
        email:       details.email || '',
        logoUrl:     details.logoUrl || '',
        gstNumber:   details.gstNumber || '',
        state:       details.state || null,
        bankName:      details.bankName || '',
        accountNumber: details.accountNumber || '',
        branchIfsCode: details.branchIfsCode || '',
        upiId:         details.upiId || '',
        nextInvoiceNo: details.nextInvoiceNo || 1,
        nextReceiptNo: details.nextReceiptNo || 1,
        nextPaymentNo: details.nextPaymentNo || 1,
        nextCreditNoteNo: details.nextCreditNoteNo || 1,
        nextDebitNoteNo: details.nextDebitNoteNo || 1,
        invoicePrefix: details.invoicePrefix || 'INV-',
        receiptPrefix: details.receiptPrefix || 'REC-',
        paymentPrefix: details.paymentPrefix || 'PAY-',
        creditNotePrefix: details.creditNotePrefix || 'CN-',
        debitNotePrefix: details.debitNotePrefix || 'DN-'
      });
      this.lastUpdated = details.updatedAt;
      this.originalValues = this.form.value;
      this.form.markAsPristine();
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload = this.form.value as CompanyDetails;
    this.svc.update(payload).subscribe({
      next: (result) => {
        this.saving = false;
        this.lastUpdated = result.updatedAt;
        this.originalValues = this.form.value;
        this.form.markAsPristine();
        this.snackBar.open('Company details saved successfully!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error saving company details.', 'OK', { duration: 3000 });
      },
    });
  }

  reset(): void {
    if (this.originalValues) {
      this.form.patchValue(this.originalValues);
      this.form.markAsPristine();
    }
  }

  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getUpiQrPreview(): string {
    const upiId = this.form.get('upiId')?.value || '';
    const name = encodeURIComponent(this.form.get('companyName')?.value || 'Shop');
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${name}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=000000`;
  }

  compareState(s1: State, s2: State): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }
}
