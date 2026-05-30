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
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, MatDialogModule,
    MatProgressBarModule
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

      <!-- Premium Drag & Drop Uploader -->
      <div class="uploader-container no-print" *ngIf="!editMode" style="margin-bottom: 24px;">
        <mat-card class="uploader-card">
          <div class="uploader-body" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <div class="upload-text">
              <h3>Auto-Fill Form from Invoice PDF</h3>
              <p>Drag and drop your vendor invoice PDF here, or click to browse (100% Offline & Private)</p>
            </div>
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="application/pdf" style="display: none;">
            <div class="extracting-spinner" *ngIf="extracting">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              <span>Analyzing PDF layout & mapping items...</span>
            </div>
          </div>
        </mat-card>
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
    
    .uploader-container { max-width: 900px; margin: 0 auto; }
    .uploader-card { border: 2px dashed var(--border) !important; background: var(--bg-card) !important; cursor: pointer; transition: border-color 0.2s, background-color 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .uploader-card:hover { border-color: var(--accent-blue) !important; background: rgba(88, 166, 255, 0.03) !important; }
    .uploader-body { display: flex; align-items: center; justify-content: center; padding: 24px; gap: 16px; min-height: 80px; position: relative; }
    .upload-icon { font-size: 32px !important; width: 32px !important; height: 32px !important; color: var(--accent-blue); }
    .upload-text h3 { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .upload-text p { margin: 0; font-size: 12px; color: var(--text-secondary); }
    .extracting-spinner { position: absolute; inset: 0; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-radius: 8px; font-size: 12px; color: var(--text-secondary); padding: 0 20px; }
    .extracting-spinner mat-progress-bar { width: 250px; border-radius: 4px; }
  `]
})
export class PurchaseFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  extracting = false;
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
    this.productService.getActive().subscribe(p => this.products = p);
    this.supplierService.getActive().subscribe(s => this.suppliers = s);

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
        this.supplierService.getActive().subscribe(all => {
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
        this.productService.getActive().subscribe(all => {
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

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        this.processFile(file);
      } else {
        this.snackBar.open('Please select a valid PDF file.', 'OK', { duration: 3000 });
      }
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.processFile(event.target.files[0]);
    }
  }

  processFile(file: File) {
    this.extracting = true;
    this.purchaseService.extractInvoice(file).subscribe({
      next: (res) => {
        this.extracting = false;
        
        // Patch main form controls
        this.form.patchValue({
          invoiceNumber: res.invoiceNumber || '',
          invoiceDate: res.invoiceDate || new Date().toISOString().substring(0,10),
          supplierId: res.supplierId || ''
        });

        // Patch FormArray
        if (res.items && res.items.length > 0) {
          this.items.clear();
          res.items.forEach((item: any) => {
            this.items.push(this.fb.group({
              productId: [item.productId || '', Validators.required],
              quantity: [item.quantity || 1, [Validators.required, Validators.min(1)]],
              rate: [item.rate || 0, [Validators.required, Validators.min(0)]],
              discount: [0]
            }));
          });
        }
        this.calculateTotals();

        // Check if any items are unmatched to DB products
        const hasUnmatched = res.items && res.items.some((item: any) => !item.productId);
        if (hasUnmatched) {
          this.snackBar.open('Invoice extracted! Please select matching products manually for unmatched items to complete.', 'OK', { duration: 6000 });
        } else {
          this.snackBar.open('Invoice extracted and mapped successfully!', 'OK', { duration: 3000 });
        }
      },
      error: (err) => {
        this.extracting = false;
        console.error('Extraction error', err);
        const errMsg = err.error?.message || 'Offline parser failed to find text layers.';
        this.snackBar.open('Extraction failed: ' + errMsg, 'OK', { duration: 5000 });
      }
    });
  }
}
