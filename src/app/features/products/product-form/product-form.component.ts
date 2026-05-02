import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, MatDividerModule, MatCardModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h1>
          <p>{{ isEdit ? 'Update product details' : 'Add a new product or service' }}</p>
        </div>
        <a mat-stroked-button routerLink="/products">
          <mat-icon>arrow_back</mat-icon>
          Back
        </a>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="product-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Name</mat-label>
              <input matInput formControlName="name" autofocus required>
              <mat-icon matPrefix>inventory_2</mat-icon>
              <mat-error>Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
              <mat-icon matPrefix>description</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Base Rate</mat-label>
              <input matInput type="number" formControlName="rate" required>
              <span matTextPrefix>Rs.&nbsp;</span>
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>HSN Code</mat-label>
                <input matInput formControlName="hsn">
                <mat-icon matPrefix>tag</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="gst-field">
                <mat-label>GST Percentage (%)</mat-label>
                <mat-select formControlName="gstPercentage" required>
                  <mat-option *ngFor="let rate of gstRates" [value]="rate">
                    {{ rate }}%
                  </mat-option>
                  <mat-divider></mat-divider>
                  <div class="add-gst-btn" (click)="addNewGst()">
                    <mat-icon>add</mat-icon> Add New GST %
                  </div>
                </mat-select>
                <mat-icon matPrefix>percent</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <a mat-stroked-button routerLink="/products">Cancel</a>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card { max-width: 600px; margin: 0 auto; }
    .product-form { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .add-gst-btn { display: flex; align-items: center; padding: 12px 16px; cursor: pointer; color: var(--primary-color, #3f51b5); font-weight: 500; }
    .add-gst-btn:hover { background: rgba(0,0,0,0.04); }
    .add-gst-btn mat-icon { margin-right: 8px; font-size: 20px; width: 20px; height: 20px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
  `]
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  productId?: number;
  loading = false;
  gstRates: number[] = [0, 5, 12, 18, 28];

  constructor(
    private fb: FormBuilder,
    private svc: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      rate: [0, [Validators.required, Validators.min(0)]],
      hsn: [''],
      gstPercentage: [18, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('customGstRates');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.gstRates = [...new Set([...this.gstRates, ...parsed])].sort((a, b) => a - b);
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productId = +idParam;
      this.loadProduct();
    }
  }

  loadProduct(): void {
    this.svc.getById(this.productId!).subscribe({
      next: (product) => {
        if (product.gstPercentage && !this.gstRates.includes(product.gstPercentage)) {
          this.gstRates.push(product.gstPercentage);
          this.gstRates.sort((a, b) => a - b);
        }
        this.form.patchValue(product);
      },
      error: () => {
        this.snackBar.open('Product not found', 'OK', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  addNewGst() {
    const rateStr = prompt('Enter new GST Percentage (e.g., 15):');
    if (rateStr && !isNaN(+rateStr)) {
      const rate = parseFloat(rateStr);
      if (!this.gstRates.includes(rate)) {
        this.gstRates.push(rate);
        this.gstRates.sort((a, b) => a - b);
        
        const customRates = JSON.parse(localStorage.getItem('customGstRates') || '[]');
        customRates.push(rate);
        localStorage.setItem('customGstRates', JSON.stringify(customRates));
      }
      this.form.patchValue({ gstPercentage: rate });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const req = this.isEdit 
      ? this.svc.update(this.productId!, this.form.value as Product)
      : this.svc.create(this.form.value as Product);

    req.subscribe({
      next: () => {
        this.snackBar.open(`Product ${this.isEdit ? 'updated' : 'added'} successfully!`, 'OK', { duration: 3000 });
        this.router.navigate(['/products']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error saving product.', 'OK', { duration: 3000 });
      }
    });
  }
}
