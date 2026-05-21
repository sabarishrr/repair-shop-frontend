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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { StateService, State } from '../../../core/services/state.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule, MatDialogModule,
    MatCheckboxModule, MatExpansionModule
  ],
  template: `
    <div [class.page-container]="!isDialog">
      <div class="page-header" *ngIf="!isDialog">
        <div>
          <h1>{{ isEdit ? 'Edit Customer' : 'Add New Customer' }}</h1>
          <p>{{ isEdit ? 'Update customer details' : 'Register a new customer profile' }}</p>
        </div>
        <a mat-stroked-button routerLink="/customers">
          <mat-icon>arrow_back</mat-icon>
          Back
        </a>
      </div>

      <h2 mat-dialog-title *ngIf="isDialog">
        <mat-icon class="title-icon">person_add</mat-icon>
        {{ isEdit ? 'Edit Customer' : 'Add New Customer' }}
      </h2>

      <mat-card [class.form-card]="!isDialog" [class.dialog-card]="isDialog">
        <mat-dialog-content [class.mat-dialog-content]="isDialog">
          <form [formGroup]="form" (ngSubmit)="save()" id="customerForm">

            <div class="section-title">Business Details</div>
            
            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Customer Type</mat-label>
                <mat-select formControlName="customerType">
                  <mat-option value="UNREGISTERED">Unregistered / Consumer</mat-option>
                  <mat-option value="REGISTERED_REGULAR">Registered - Regular</mat-option>
                  <mat-option value="REGISTERED_COMPOSITION">Registered - Composition</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>GSTIN / UIN</mat-label>
                <input matInput formControlName="gstin" placeholder="15-digit GSTIN">
                <mat-icon matPrefix>verified</mat-icon>
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Company / Business Name</mat-label>
              <input matInput formControlName="companyName">
              <mat-icon matPrefix>business</mat-icon>
            </mat-form-field>

            <div class="section-title">Contact Details</div>

            <div class="row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contact Person Name</mat-label>
                <input matInput formControlName="name" autofocus required>
                <mat-icon matPrefix>person</mat-icon>
                <mat-error>Name is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mobile / Phone</mat-label>
                <input matInput formControlName="phone" required>
                <mat-icon matPrefix>phone</mat-icon>
                <mat-error>Phone is required</mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <div class="section-title">Billing Address</div>

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
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>PIN Code</mat-label>
                <input matInput formControlName="pinCode">
                <mat-icon matPrefix>pin_drop</mat-icon>
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Billing Address Line</mat-label>
              <textarea matInput formControlName="address" rows="2"></textarea>
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

            <div class="section-title">Shipping Address</div>
            
            <mat-checkbox color="primary" [checked]="sameAsBilling" (change)="toggleShipping($event.checked)" class="same-billing-checkbox">
              Shipping Address is same as Billing Address
            </mat-checkbox>

            <div *ngIf="!sameAsBilling" class="shipping-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Shipping Address Line</mat-label>
                <textarea matInput formControlName="shippingAddress" rows="2"></textarea>
                <mat-icon matPrefix>local_shipping</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Shipping PIN Code</mat-label>
                <input matInput formControlName="shippingPinCode">
                <mat-icon matPrefix>pin_drop</mat-icon>
              </mat-form-field>
            </div>

          </form>
        </mat-dialog-content>

        <mat-dialog-actions align="end" *ngIf="isDialog">
          <button mat-button (click)="dialogRef.close()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" form="customerForm" [disabled]="loading">
            <mat-icon>{{ isEdit ? 'save' : 'person_add' }}</mat-icon>
            {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Save Customer') }}
          </button>
        </mat-dialog-actions>

        <div class="form-actions" *ngIf="!isDialog">
          <a mat-stroked-button routerLink="/customers">Cancel</a>
          <button mat-raised-button color="primary" type="submit" form="customerForm" [disabled]="loading">
            <mat-icon>{{ isEdit ? 'save' : 'person_add' }}</mat-icon>
            {{ loading ? 'Saving...' : (isEdit ? 'Update Customer' : 'Add Customer') }}
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
    
    .same-billing-checkbox { margin-bottom: 8px; }
    
    .shipping-section {
      background: var(--bg-elevated);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 8px;
    }

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
      min-width: 400px;
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  isEdit = false;
  customerId?: number;
  loading = false;
  states: State[] = [];
  isDialog = false;
  sameAsBilling = true;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    companyName: [''],
    gstin: [''],
    customerType: ['UNREGISTERED'],
    state: [null as State | null],
    address: [''],
    pinCode: [''],
    shippingAddress: [''],
    shippingPinCode: ['']
  });

  constructor(
    private fb: FormBuilder,
    private svc: CustomerService,
    private stateSvc: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    @Optional() public dialogRef: MatDialogRef<CustomerFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isDialog = !!this.dialogRef;
  }

  ngOnInit(): void {
    this.stateSvc.getAll().subscribe(data => this.states = data);
    
    if (this.isDialog && this.data?.id) {
      this.isEdit = true;
      this.customerId = this.data.id;
      this.loadCustomer();
    } else {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.isEdit = true;
        this.customerId = +idParam;
        this.loadCustomer();
      }
    }
  }

  loadCustomer(): void {
    this.svc.getById(this.customerId!).subscribe({
      next: (customer) => {
        this.form.patchValue(customer);
        if (customer.shippingAddress || customer.shippingPinCode) {
          this.sameAsBilling = false;
        }
      },
      error: () => {
        this.snackBar.open('Customer not found', 'OK', { duration: 3000 });
        if (!this.isDialog) this.router.navigate(['/customers']);
        else this.dialogRef.close();
      }
    });
  }

  toggleShipping(checked: boolean) {
    this.sameAsBilling = checked;
    if (checked) {
      this.form.patchValue({ shippingAddress: '', shippingPinCode: '' });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const req = this.isEdit
      ? this.svc.update(this.customerId!, this.form.value as Customer)
      : this.svc.create(this.form.value as Customer);

    req.subscribe({
      next: (customer) => {
        this.snackBar.open(`Customer ${this.isEdit ? 'updated' : 'added'} successfully!`, 'OK', { duration: 3000 });
        if (this.isDialog) {
          this.dialogRef.close(customer);
        } else {
          this.router.navigate(['/customers']);
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error saving customer.', 'OK', { duration: 3000 });
      }
    });
  }

  compareState(s1: State, s2: State): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }
}

