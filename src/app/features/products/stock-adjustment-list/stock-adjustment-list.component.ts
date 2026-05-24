import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { StockAdjustmentService } from '../../../core/services/stock-adjustment.service';
import { StockAdjustment } from '../../../core/models/stock-adjustment.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockAdjustmentDialogComponent } from '../stock-adjustment-dialog/stock-adjustment-dialog.component';
import { ProductService, Product } from '../../../core/services/product.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stock-adjustment-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatSnackBarModule, RouterModule,
    MatFormFieldModule, MatSelectModule, ReactiveFormsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Stock Adjustments Ledger</h1>
          <p>Manual stock additions, subtractions, and damage audits</p>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/products">
            <mat-icon>arrow_back</mat-icon> Back to Products
          </a>
          <button mat-raised-button color="primary" (click)="openAdjustmentDialog()">
            <mat-icon>published_with_changes</mat-icon> New Adjustment
          </button>
        </div>
      </div>

      <mat-card class="list-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <form [formGroup]="filterForm" class="filter-form">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-field">
                <mat-label>Reason Filter</mat-label>
                <mat-select formControlName="reason" (selectionChange)="applyFilters()">
                  <mat-option value="">All Reasons</mat-option>
                  <mat-option value="PHYSICAL_COUNT">Physical Count Audit</mat-option>
                  <mat-option value="DAMAGED">Damaged Inventory</mat-option>
                  <mat-option value="LOST">Lost Item</mat-option>
                  <mat-option value="FOUND">Found Extra Item</mat-option>
                  <mat-option value="REPARATION">Repair Usage Correction</mat-option>
                  <mat-option value="OTHER">Other Reason</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-field">
                <mat-label>Type Filter</mat-label>
                <mat-select formControlName="type" (selectionChange)="applyFilters()">
                  <mat-option value="">All Types</mat-option>
                  <mat-option value="ADD">Stock In (+)</mat-option>
                  <mat-option value="SUBTRACT">Stock Out (-)</mat-option>
                </mat-select>
              </mat-form-field>
            </form>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">history</mat-icon>
            {{ filteredAdjustments.length }} adjustments logged
          </span>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="filteredAdjustments" class="data-table">

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date &amp; Time </th>
              <td mat-cell *matCellDef="let a"> {{ a.adjustmentDate | date:'medium' }} </td>
            </ng-container>

            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef> Product </th>
              <td mat-cell *matCellDef="let a"> 
                <strong>{{ a.product?.name }}</strong>
                <div class="product-sub" *ngIf="a.product?.hsn">HSN: {{ a.product.hsn }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef> Type </th>
              <td mat-cell *matCellDef="let a"> 
                <span class="type-pill" [class.type-add]="a.adjustmentType === 'ADD'" [class.type-sub]="a.adjustmentType === 'SUBTRACT'">
                  <mat-icon>{{ a.adjustmentType === 'ADD' ? 'add_circle' : 'remove_circle' }}</mat-icon>
                  {{ a.adjustmentType === 'ADD' ? 'Stock In' : 'Stock Out' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef> Quantity </th>
              <td mat-cell *matCellDef="let a"> 
                <strong [class.qty-add]="a.adjustmentType === 'ADD'" [class.qty-sub]="a.adjustmentType === 'SUBTRACT'">
                  {{ a.adjustmentType === 'ADD' ? '+' : '-' }}{{ a.quantity }} {{ a.product?.uom || 'NOS' }}
                </strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef> Reason </th>
              <td mat-cell *matCellDef="let a"> {{ formatReason(a.reason) }} </td>
            </ng-container>

            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef> Notes / Remarks </th>
              <td mat-cell *matCellDef="let a" class="notes-cell"> {{ a.notes || '—' }} </td>
            </ng-container>

            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef> Adjusted By </th>
              <td mat-cell *matCellDef="let a"> 
                <div class="user-cell">
                  <mat-icon class="user-icon">account_circle</mat-icon>
                  <span>{{ a.createdBy || 'System' }}</span>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">history</mat-icon>
                  <h3>No adjustments found</h3>
                  <p>Try resetting filters or click New Adjustment to create one.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; gap: 12px; }
    .filter-form { display: flex; gap: 12px; }
    .filter-field { width: 180px; }
    .product-sub { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
    
    .type-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .type-pill mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .type-add { background: rgba(16, 185, 129, 0.08); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.15); }
    .type-sub { background: rgba(245, 158, 11, 0.08); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.15); }
    
    .qty-add { color: #10b981; }
    .qty-sub { color: #ef4444; }
    
    .notes-cell { font-size: 12px; color: var(--text-secondary); max-width: 250px; white-space: normal; word-break: break-word; }
    
    .user-cell { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-primary); }
    .user-icon { font-size: 16px; width: 16px; height: 16px; color: var(--text-muted); }
  `]
})
export class StockAdjustmentListComponent implements OnInit {
  adjustments: StockAdjustment[] = [];
  filteredAdjustments: StockAdjustment[] = [];
  products: Product[] = [];
  displayedColumns: string[] = ['date', 'product', 'type', 'quantity', 'reason', 'notes', 'user'];
  
  filterForm: FormGroup;

  constructor(
    private svc: StockAdjustmentService,
    private productSvc: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      reason: [''],
      type: ['']
    });
  }

  ngOnInit() {
    this.loadAdjustments();
    this.loadProducts();
  }

  loadAdjustments() {
    this.svc.getAll().subscribe(data => {
      this.adjustments = data;
      this.applyFilters();
    });
  }

  loadProducts() {
    this.productSvc.getAll().subscribe(data => this.products = data);
  }

  applyFilters() {
    const { reason, type } = this.filterForm.value;
    this.filteredAdjustments = this.adjustments.filter(a => {
      const matchReason = !reason || a.reason === reason;
      const matchType = !type || a.adjustmentType === type;
      return matchReason && matchType;
    });
  }

  formatReason(reason: string): string {
    const map: Record<string, string> = {
      PHYSICAL_COUNT: 'Physical Count Audit',
      DAMAGED: 'Damaged Inventory',
      LOST: 'Lost Item',
      FOUND: 'Found Extra Item',
      REPARATION: 'Repair Usage Correction',
      OTHER: 'Other Reason'
    };
    return map[reason] || reason;
  }

  openAdjustmentDialog() {
    if (this.products.length === 0) {
      this.snackBar.open('No products available to adjust.', 'OK', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ProductSelectorDialogComponent, {
      width: '420px',
      data: { products: this.products }
    });

    dialogRef.afterClosed().subscribe(selectedProduct => {
      if (selectedProduct) {
        const adjRef = this.dialog.open(StockAdjustmentDialogComponent, {
          width: '560px',
          data: { product: selectedProduct }
        });
        
        adjRef.afterClosed().subscribe(success => {
          if (success) {
            this.loadAdjustments();
          }
        });
      }
    });
  }
}

// Quick inline dialog component to select a product
import { Component as DialogComponent, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef as SelectorRef, MatDialogModule as SelectorModule } from '@angular/material/dialog';
import { ReactiveFormsModule as SelectorFormModule, FormBuilder as SelectorBuilder, FormGroup as SelectorGroup, Validators as SelectorValidators } from '@angular/forms';

@DialogComponent({
  selector: 'app-product-selector-dialog',
  standalone: true,
  imports: [CommonModule, SelectorModule, MatButtonModule, MatFormFieldModule, MatSelectModule, SelectorFormModule, MatIconModule],
  template: `
    <div class="dialog-container" style="padding: 10px;">
      <h3 style="margin-top:0;margin-bottom:8px;font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px;">
        <mat-icon color="primary">inventory</mat-icon> Select Product
      </h3>
      <p style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;">Choose which product's stock levels you want to adjust.</p>
      
      <form [formGroup]="selectForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Product</mat-label>
          <mat-select formControlName="product">
            <mat-option *ngFor="let p of products" [value]="p">
              {{ p.name }} (Current: {{ p.stockQuantity || 0 }} {{ p.uom || 'NOS' }})
            </mat-option>
          </mat-select>
          <mat-error>Product is required</mat-error>
        </mat-form-field>
        
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
          <button mat-button type="button" mat-dialog-close>Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="selectForm.invalid">Continue</button>
        </div>
      </form>
    </div>
  `
})
export class ProductSelectorDialogComponent {
  products: Product[] = [];
  selectForm: SelectorGroup;

  constructor(
    private fb: SelectorBuilder,
    private dialogRef: SelectorRef<ProductSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] }
  ) {
    this.products = data.products;
    this.selectForm = this.fb.group({
      product: [null, SelectorValidators.required]
    });
  }

  onSubmit() {
    if (this.selectForm.invalid) return;
    this.dialogRef.close(this.selectForm.value.product);
  }
}
