import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card" appearance="outlined">
        <div class="brand-header">
          <div class="logo-circle">
            <mat-icon>build</mat-icon>
          </div>
          <h1>UPGRADE COMPUTERS</h1>
          <p>Sign in to your account</p>
        </div>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="login()">

            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="username" autofocus>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="form.get('username')?.hasError('required')">Username is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div class="error-banner" *ngIf="error">
              <mat-icon>error_outline</mat-icon>
              {{ error }}
            </div>

            <button mat-raised-button color="primary" type="submit" class="login-btn"
                    [disabled]="loading || form.invalid">
              <mat-spinner *ngIf="loading" diameter="20" class="spinner-inline"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading">Signing in...</span>
            </button>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-base);
      background-image:
        radial-gradient(ellipse at top left, rgba(63,81,181,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(0,188,212,0.1) 0%, transparent 50%);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px 36px 36px;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .logo-circle {
      width: 60px;
      height: 60px;
      background: var(--gradient-1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 4px 20px rgba(63,81,181,0.4);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #fff; }
    }

    .brand-header h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .brand-header p {
      color: var(--text-secondary);
      font-size: 14px;
      margin-top: 4px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(248,81,73,0.1);
      border: 1px solid rgba(248,81,73,0.3);
      border-radius: 8px;
      color: var(--accent-red);
      font-size: 13px;
      margin-bottom: 8px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    }

    .login-btn {
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-top: 4px;
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
    }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  loading = false;
  error = '';
  hidePassword = true;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }

  login() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.value;

    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
