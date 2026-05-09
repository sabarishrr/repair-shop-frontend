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
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { StateService, State } from '../../../core/services/state.service';

@Component({
  selector: 'app-customer-form',
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

            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" autofocus>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error>Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
              <mat-icon matPrefix>phone</mat-icon>
              <mat-error>Phone is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>
            
             <mat-form-field appearance="outline">
               <mat-label>Address</mat-label>
               <textarea matInput formControlName="address" rows="3"></textarea>
               <mat-icon matPrefix>location_on</mat-icon>
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
      max-width: 600px;
      margin: 0 auto;
    }
    
    .dialog-card {
      box-shadow: none !important;
      background: transparent !important;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 10px;
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

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    state: [null as State | null],
    address: [''],
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
      next: (customer) => this.form.patchValue(customer),
      error: () => {
        this.snackBar.open('Customer not found', 'OK', { duration: 3000 });
        if (!this.isDialog) this.router.navigate(['/customers']);
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
