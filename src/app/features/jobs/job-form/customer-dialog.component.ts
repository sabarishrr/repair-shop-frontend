import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">person_add</mat-icon>
      Add New Customer
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="save()" id="customerDialogForm">

        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
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

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" type="submit" form="customerDialogForm" [disabled]="saving">
        {{ saving ? 'Saving...' : 'Save Customer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .title-icon {
      color: var(--accent-blue);
      vertical-align: middle;
      margin-right: 8px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 340px;
    }
  `]
})
export class CustomerDialogComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    address: ['']
  });
  saving = false;

  constructor(
    private fb: FormBuilder,
    private custSvc: CustomerService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.custSvc.create(this.form.value as any).subscribe({
      next: (c: Customer) => {
        this.dialogRef.close(c);
      },
      error: () => {
        this.snackBar.open('Error creating customer. Check if phone/email already exists.', 'OK', { duration: 4000 });
        this.saving = false;
      }
    });
  }
}
