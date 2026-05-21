import { Component, OnInit, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../core/models/supplier.model';
import { StateService, State } from '../../../core/services/state.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule, MatDialogModule
  ],
  template: `
    <div [class.page-container]="!isDialog">
      <div class="page-header" *ngIf="!isDialog">
        <div>
          <h1>{{ isEdit ? 'Edit Vendor' : 'Add New Vendor' }}</h1>
          <p>{{ isEdit ? 'Update vendor details' : 'Register a new vendor/supplier profile' }}</p>
        </div>
        <a mat-stroked-button routerLink="/suppliers">
          <mat-icon>arrow_back</mat-icon>
          Back
        </a>
      </div>

      <h2 mat-dialog-title *ngIf="isDialog">
        <mat-icon class="title-icon">store</mat-icon>
        {{ isEdit ? 'Edit Vendor' : 'Add New Vendor' }}
      </h2>

      <mat-card [class.form-card]="!isDialog" [class.dialog-card]="isDialog">
        <mat-dialog-content [class.mat-dialog-content]="isDialog">
          <form [formGroup]="form" (ngSubmit)="save()" id="supplierForm">

            <div class="section-title">Vendor details</div>
            
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Vendor / Company Name</mat-label>
                <input matInput formControlName="name" autofocus required>
                <mat-icon matPrefix>business</mat-icon>
                <mat-error>Name is required</mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>GSTIN / UIN</mat-label>
                <input matInput formControlName="gstin" placeholder="15-digit GSTIN">
                <mat-icon matPrefix>verified</mat-icon>
              </mat-form-field>
            </div>

            <div class="section-title">Contact Information</div>

            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone / Mobile</mat-label>
                <input matInput formControlName="phone" required>
                <mat-icon matPrefix>phone</mat-icon>
                <mat-error>Phone is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email" type="email">
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>
            </div>

            <div class="section-title">Address Details</div>

            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>State (Place of Supply)</mat-label>
                <mat-select formControlName="state" [compareWith]="compareState">
                  <mat-option *ngFor="let s of states" [value]="s">
                    {{ s.name }} ({{ s.gstCode }})
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>map</mat-icon>
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Billing Address</mat-label>
              <textarea matInput formControlName="address" rows="3"></textarea>
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

          </form>
        </mat-dialog-content>

        <mat-dialog-actions align="end" *ngIf="isDialog">
          <button mat-button (click)="dialogRef.close()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" form="supplierForm" [disabled]="loading">
            <mat-icon>{{ isEdit ? 'save' : 'store' }}</mat-icon>
            {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Save Vendor') }}
          </button>
        </mat-dialog-actions>

        <div class="form-actions" *ngIf="!isDialog">
          <a mat-stroked-button routerLink="/suppliers">Cancel</a>
          <button mat-raised-button color="primary" type="submit" form="supplierForm" [disabled]="loading">
            <mat-icon>{{ isEdit ? 'save' : 'store' }}</mat-icon>
            {{ loading ? 'Saving...' : (isEdit ? 'Update Vendor' : 'Add Vendor') }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card {
      max-width: 700px;
      margin: 0 auto;
    }
    
    .dialog-card {
      box-shadow: none !important;
      background: transparent !important;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 10px;
    }
    
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }

    .section-title { font-weight: 600; font-size: 14px; color: var(--accent-blue); margin: 12px 0 4px; padding-bottom: 4px; border-bottom: 1px solid var(--border); }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding: 16px 24px;
    }

    .title-icon {
      color: var(--accent-blue);
      vertical-align: middle;
      margin-right: 8px;
    }

    mat-dialog-content {
      min-width: 450px;
    }
  `]
})
export class SupplierFormComponent implements OnInit {
  isEdit = false;
  supplierId?: number;
  loading = false;
  states: State[] = [];
  isDialog = false;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    gstin: [''],
    state: [null as State | null],
    address: ['']
  });

  constructor(
    private fb: FormBuilder,
    private svc: SupplierService,
    private stateSvc: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    @Optional() public dialogRef: MatDialogRef<SupplierFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isDialog = !!this.dialogRef;
  }

  ngOnInit(): void {
    this.stateSvc.getAll().subscribe(data => this.states = data);
    
    if (this.isDialog && this.data?.id) {
      this.isEdit = true;
      this.supplierId = this.data.id;
      this.loadSupplier();
    } else {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdit = true;
        this.supplierId = +idParam;
        this.loadSupplier();
      }
    }
  }

  loadSupplier(): void {
    this.svc.getById(this.supplierId!).subscribe({
      next: (supplier) => {
        this.form.patchValue(supplier);
      },
      error: () => {
        this.snackBar.open('Vendor not found', 'OK', { duration: 3000 });
        if (!this.isDialog) this.router.navigate(['/suppliers']);
        else this.dialogRef.close();
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const req = this.isEdit
      ? this.svc.update(this.supplierId!, this.form.value as Supplier)
      : this.svc.create(this.form.value as Supplier);

    req.subscribe({
      next: (supplier) => {
        this.snackBar.open(`Vendor ${this.isEdit ? 'updated' : 'added'} successfully!`, 'OK', { duration: 3000 });
        if (this.isDialog) {
          this.dialogRef.close(supplier);
        } else {
          this.router.navigate(['/suppliers']);
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error saving vendor.', 'OK', { duration: 3000 });
      }
    });
  }

  compareState(s1: State, s2: State): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }
}
