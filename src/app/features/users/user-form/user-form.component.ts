import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Edit User' : 'Add New User' }}</h1>
          <p>{{ isEdit ? 'Update existing user credentials' : 'Create a new administrator or technician' }}</p>
        </div>
        <a mat-stroked-button routerLink="/users">
          <mat-icon>arrow_back</mat-icon>
          Back
        </a>
      </div>

      <mat-card class="form-card-page">
        <form [formGroup]="form" (ngSubmit)="save()" id="userForm" class="form-grid">

          <div class="section-title">
            <mat-icon>person</mat-icon>
            User Details
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <input matInput formControlName="fullName" autofocus>
            <mat-error>Full name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <mat-icon matPrefix>alternate_email</mat-icon>
            <input matInput formControlName="username">
            <mat-error>Username is required</mat-error>
          </mat-form-field>

          <div class="section-title">
            <mat-icon>security</mat-icon>
            Security & Access
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Password{{ isEdit ? ' (Leave blank to keep current)' : '' }}</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput type="password" formControlName="password">
            <mat-error>Password is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-icon matPrefix>admin_panel_settings</mat-icon>
            <mat-select formControlName="role">
              <mat-option value="ADMIN">Admin — Full access</mat-option>
              <mat-option value="TECHNICIAN">Technician — Limited access</mat-option>
            </mat-select>
          </mat-form-field>

        </form>

        <div class="form-actions-bar">
          <a mat-stroked-button routerLink="/users">Cancel</a>
          <button mat-raised-button color="primary" type="submit" form="userForm" [disabled]="loading || form.invalid">
            <mat-icon>{{ loading ? 'hourglass_empty' : (isEdit ? 'save' : 'person_add') }}</mat-icon>
            {{ loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User') }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-form-field { width: 100%; }
  `]
})
export class UserFormComponent implements OnInit {
  isEdit = false;
  userId?: number;
  isDefaultAdmin = false;
  loading = false;

  form = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    password: [''],
    role:     ['TECHNICIAN', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private svc: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.userId = +idParam;
      this.loadUser();
    } else {
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(): void {
    this.svc.getById(this.userId!).subscribe({
      next: (user) => {
        this.isDefaultAdmin = user.username === 'admin';
        this.form.patchValue({
          fullName: user.fullName,
          username: user.username,
          role: user.role
        });
        if (this.isDefaultAdmin) {
          this.form.get('username')?.disable();
          this.form.get('role')?.disable();
        }
      },
      error: () => {
        this.snackBar.open('User not found', 'OK', { duration: 3000 });
        this.router.navigate(['/users']);
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const userValue = this.form.getRawValue() as User;

    const req = this.isEdit
      ? this.svc.update(this.userId!, userValue)
      : this.svc.create(userValue);

    req.subscribe({
      next: () => {
        this.snackBar.open(`User ${this.isEdit ? 'updated' : 'created'} successfully!`, 'OK', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Error saving user.', 'OK', { duration: 4000 });
      }
    });
  }
}
