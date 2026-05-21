import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../../core/services/purchase.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { Supplier } from '../../../core/models/supplier.model';
import { SupplierFormComponent } from '../../suppliers/supplier-form/supplier-form.component';
import { ProductFormComponent } from '../../products/product-form/product-form.component';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Add Purchase</h1>
          <p>Record a new vendor purchase to update inventory</p>
        </div>
        <a mat-stroked-button routerLink="/purchases">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row" style="align-items: center;">
            <mat-form-field appearance="outline">
              <mat-label>Invoice Number</mat-label>
              <input matInput formControlName="invoiceNumber" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput type="date" formControlName="invoiceDate" required>
            </mat-form-field>

            <div class="select-with-btn">
              <mat-form-field appearance="outline" style="flex: 1;">
                <mat-label>Supplier / Vendor</mat-label>
                <mat-select formControlName="supplierId" required>
                  <mat-option *ngFor="let s of suppliers" [value]="s.id">{{s.name}} <span *ngIf="s.phone">({{s.phone}})</span></mat-option>
                </mat-select>
                <mat-error>Supplier is required</mat-error>
              </mat-form-field>
              <button mat-icon-button color="primary" type="button" class="add-inline-btn" (click)="addSupplier()" matTooltip="Add New Vendor">
                <mat-icon>add_circle</mat-icon>
              </button>
            </div>
          </div>

          <div class="items-section">
            <div class="items-header">
              <h3>Items</h3>
              <button mat-button color="primary" type="button" (click)="addItem()">
                <mat-icon>add</mat-icon> Add Item
              </button>
            </div>

            <div formArrayName="items" class="items-list">
              <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="item-row">
                <div class="product-select-container">
                  <mat-form-field appearance="outline" class="product-field" style="flex: 1;">
                    <mat-label>Product</mat-label>
                    <mat-select formControlName="productId" (selectionChange)="onProductSelect(i, $event.value)" required>
                      <mat-option *ngFor="let p of products" [value]="p.id">{{p.name}}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button mat-icon-button color="primary" type="button" class="add-inline-btn-small" (click)="addProduct(i)" matTooltip="Add New Product">
                    <mat-icon>add_circle</mat-icon>
                  </button>
                </div>

                <mat-form-field appearance="outline" class="qty-field">
                  <mat-label>Qty</mat-label>
                  <input matInput type="number" formControlName="quantity" required min="1">
                </mat-form-field>

                <mat-form-field appearance="outline" class="rate-field">
                  <mat-label>Rate</mat-label>
                  <input matInput type="number" formControlName="rate" required min="0">
                </mat-form-field>

                <mat-form-field appearance="outline" class="rate-field">
                  <mat-label>Discount</mat-label>
                  <input matInput type="number" formControlName="discount" min="0">
                </mat-form-field>

                <button mat-icon-button color="warn" type="button" (click)="removeItem(i)" *ngIf="items.length > 1" style="margin-top: 4px;">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Live Totals Summary -->
          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {{ subTotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Estimated GST:</span>
              <span>Rs. {{ taxTotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row grand-total">
              <span>Grand Total:</span>
              <span>Rs. {{ grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
              <mat-icon>save</mat-icon> {{ loading ? 'Saving...' : (editMode ? 'Update Purchase' : 'Save Purchase') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card { padding: 24px; max-width: 900px; margin: 0 auto; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .select-with-btn { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 240px; }
    .product-select-container { display: flex; align-items: center; gap: 4px; flex: 2; min-width: 200px; }
    .add-inline-btn { margin-top: -18px; color: var(--accent-blue); transition: transform 0.2s ease; }
    .add-inline-btn:hover { transform: scale(1.15); }
    .add-inline-btn-small { margin-top: -18px; color: var(--accent-blue); transition: transform 0.2s ease; }
    .add-inline-btn-small:hover { transform: scale(1.15); }
    .items-section { margin: 24px 0; border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
    .items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .items-header h3 { margin: 0; font-size: 16px; font-weight: 500; }
    .item-row { display: flex; gap: 12px; align-items: center; }
    .qty-field, .rate-field { flex: 1; }
    .full-width { width: 100%; margin-top: 16px; }
    .summary-section { margin-top: 16px; padding: 16px; background: var(--surface-hover); border-radius: 8px; width: 300px; margin-left: auto; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .summary-row.grand-total { font-weight: 600; font-size: 18px; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class PurchaseFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  products: Product[] = [];
  suppliers: Supplier[] = [];
  editMode = false;
  editId?: number;

  subTotal = 0;
  taxTotal = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      invoiceNumber: ['', Validators.required],
      supplierId: ['', Validators.required],
      invoiceDate: [new Date().toISOString().substring(0,10), Validators.required],
      notes: [''],
      items: this.fb.array([this.createItem()])
    });
  }

  ngOnInit() {
    this.productService.getAll().subscribe(p => this.products = p);
    this.supplierService.getAll().subscribe(s => this.suppliers = s);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.editId = +id;
        this.loadPurchaseData();
      }
    });

    this.form.valueChanges.subscribe(() => this.calculateTotals());
  }

  calculateTotals() {
    let sub = 0;
    let tax = 0;
    const itemsValue = this.form.get('items')?.value || [];
    
    itemsValue.forEach((item: any) => {
      const qty = item.quantity || 0;
      const rate = item.rate || 0;
      const discount = item.discount || 0;

      const product = this.products.find(p => p.id === item.productId);
      const gst = product?.gstPercentage || 0;

      const taxable = (qty * rate) - discount;
      const taxAmt = taxable * (gst / 100);

      if (taxable > 0) {
        sub += taxable;
        tax += taxAmt;
      }
    });

    this.subTotal = sub;
    this.taxTotal = tax;
    this.grandTotal = sub + tax;
  }

  loadPurchaseData() {
    this.purchaseService.getById(this.editId!).subscribe(inv => {
      this.form.patchValue({
        invoiceNumber: inv.invoiceNumber,
        supplierId: inv.supplier?.id,
        invoiceDate: inv.invoiceDate,
        notes: inv.notes
      });
      
      this.items.clear();
      inv.items.forEach((item: any) => {
        this.items.push(this.fb.group({
          productId: [item.product?.id, Validators.required],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          rate: [item.rate, [Validators.required, Validators.min(0)]],
          discount: [item.discount || 0]
        }));
      });
      this.calculateTotals();
    });
  }

  get items() {
    return this.form.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      discount: [0]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onProductSelect(index: number, productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.items.at(index).patchValue({ rate: product.rate });
    }
  }

  addSupplier() {
    const dialogRef = this.dialog.open(SupplierFormComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      data: {}
    });

    dialogRef.afterClosed().subscribe((newSupplier: Supplier) => {
      if (newSupplier && newSupplier.id) {
        this.supplierService.getAll().subscribe(all => {
          this.suppliers = all;
          this.form.patchValue({ supplierId: newSupplier.id });
        });
      }
    });
  }

  addProduct(index: number) {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      data: {}
    });

    dialogRef.afterClosed().subscribe((newProduct: Product) => {
      if (newProduct && newProduct.id) {
        const prodId = newProduct.id;
        this.productService.getAll().subscribe(all => {
          this.products = all;
          this.items.at(index).patchValue({ productId: prodId });
          this.onProductSelect(index, prodId);
        });
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    
    const obs = this.editMode
      ? this.purchaseService.update(this.editId!, this.form.value)
      : this.purchaseService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Purchase ${this.editMode ? 'updated' : 'recorded'} successfully`, 'OK', { duration: 3000 });
        this.router.navigate(['/purchases']);
      },
      error: (err) => {
        this.snackBar.open(`Error ${this.editMode ? 'updating' : 'recording'} purchase: ` + (err.error?.message || 'Unknown error'), 'OK', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
