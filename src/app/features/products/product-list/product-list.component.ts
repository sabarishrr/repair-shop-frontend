import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../core/services/product.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockAdjustmentDialogComponent } from '../stock-adjustment-dialog/stock-adjustment-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule, MatCardModule,
    MatFormFieldModule, MatInputModule, RouterModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog and services</p>
        </div>
        <div class="header-actions" style="display:flex;gap:12px;">
          <a mat-stroked-button routerLink="/products/adjustments">
            <mat-icon>history</mat-icon> Adjustments Log
          </a>
          <a mat-raised-button color="primary" routerLink="/products/new">
            <mat-icon>add</mat-icon> Add Product
          </a>
        </div>
      </div>

      <mat-card class="list-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic" floatLabel="always">
              <mat-icon matPrefix>search</mat-icon>
              <mat-label>Search products</mat-label>
              <input matInput (input)="onSearch($event)">
            </mat-form-field>
          </div>
          <span class="count-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">inventory_2</mat-icon>
            {{ products.length }} products
          </span>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="products" class="data-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Name </th>
              <td mat-cell *matCellDef="let p"> 
                <div class="name-cell">
                  <div class="avatar"><mat-icon>inventory_2</mat-icon></div>
                  <div class="name-text">
                    <strong>{{p.name}}</strong>
                    <div class="desc-text" *ngIf="p.description">{{p.description}}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="hsn">
              <th mat-header-cell *matHeaderCellDef> HSN </th>
              <td mat-cell *matCellDef="let p"> {{p.hsn || '—'}} </td>
            </ng-container>

            <ng-container matColumnDef="rate">
              <th mat-header-cell *matHeaderCellDef> Rate </th>
              <td mat-cell *matCellDef="let p"> Rs. {{p.rate}} </td>
            </ng-container>

            <ng-container matColumnDef="gstPercentage">
              <th mat-header-cell *matHeaderCellDef> GST % </th>
              <td mat-cell *matCellDef="let p"> {{p.gstPercentage}}% </td>
            </ng-container>

            <ng-container matColumnDef="stockQuantity">
              <th mat-header-cell *matHeaderCellDef> Stock </th>
              <td mat-cell *matCellDef="let p"> 
                <span [class.low-stock]="p.stockQuantity !== undefined && p.stockQuantity <= (p.reorderLevel || 0)" [class.out-of-stock]="p.stockQuantity === 0">
                  {{p.stockQuantity || 0}} <small>{{p.uom || 'NOS'}}</small>
                </span> 
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
              <td mat-cell *matCellDef="let p" class="actions-cell">
                <button mat-icon-button color="accent" (click)="adjustStock(p)" matTooltip="Adjust Stock">
                  <mat-icon>published_with_changes</mat-icon>
                </button>
                <a mat-icon-button color="primary" [routerLink]="['/products', p.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deleteProduct(p)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="empty-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">inventory</mat-icon>
                  <h3>No products found</h3>
                  <p>Try adjusting your search or add a new product.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .name-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #3b82f6); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
    .avatar mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .name-text { display: flex; flex-direction: column; }
    .desc-text { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .low-stock { color: #f59e0b; font-weight: 500; }
    .out-of-stock { color: #ef4444; font-weight: 700; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'hsn', 'rate', 'gstPercentage', 'stockQuantity', 'actions'];

  constructor(
    private svc: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(search?: string) {
    this.svc.getAll(search).subscribe(data => this.products = data);
  }

  onSearch(e: Event): void {
    const q = (e.target as HTMLInputElement).value.trim();
    this.loadProducts(q || undefined);
  }

  deleteProduct(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Product', message: `Are you sure you want to delete "${product.name}"?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.svc.delete(product.id!).subscribe(() => {
          this.snackBar.open('Product deleted', 'OK', { duration: 3000 });
          this.loadProducts();
        });
      }
    });
  }

  adjustStock(product: Product) {
    const dialogRef = this.dialog.open(StockAdjustmentDialogComponent, {
      width: '560px',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.loadProducts();
      }
    });
  }
}
