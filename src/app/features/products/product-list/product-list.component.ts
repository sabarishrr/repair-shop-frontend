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
        <a mat-raised-button color="primary" routerLink="/products/new">
          <mat-icon>add</mat-icon> Add Product
        </a>
      </div>

      <mat-card class="data-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Search products</mat-label>
            <input matInput (input)="onSearch($event)" placeholder="Search...">
          </mat-form-field>
          <span class="count-badge">{{ products.length }} products</span>
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

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
              <td mat-cell *matCellDef="let p" class="actions-cell">
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
                  <mat-icon>inventory</mat-icon>
                  <p>No products found.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .data-card { padding: 24px !important; }
    .table-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 0 8px; gap: 16px; flex-wrap: wrap; }
    .search-field { width: 320px; max-width: 100%; }
    .count-badge { font-size: 13px; color: var(--text-secondary); background: var(--bg-elevated); padding: 6px 14px; border-radius: 20px; font-weight: 500; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; }
    
    .name-cell { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #3b82f6); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
    .avatar mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .name-text { display: flex; flex-direction: column; }
    .desc-text { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    
    .actions-header { text-align: right !important; }
    .actions-cell { text-align: right; white-space: nowrap; }
    
    .empty-state { text-align: center; padding: 48px 0; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px; }
    .empty-state p { color: var(--text-secondary); font-size: 14px; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'hsn', 'rate', 'gstPercentage', 'actions'];

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
}
