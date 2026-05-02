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

  compareState(s1: State, s2: State): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }
}
