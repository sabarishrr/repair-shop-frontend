import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockAdjustmentDialogComponent } from '../stock-adjustment-dialog/stock-adjustment-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule, MatCardModule,
    MatFormFieldModule, MatInputModule, RouterModule, MatSlideToggleModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog and services</p>
        </div>
        <div style="display:flex;gap:12px;">
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
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let p">
                <div class="name-cell">
                  <div class="avatar-circle square orange">
                    <mat-icon style="font-size:18px;width:18px;height:18px;">inventory_2</mat-icon>
                  </div>
                  <div>
                    <strong>{{p.name}}</strong>
                    <div style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" *ngIf="p.description">{{p.description}}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="hsn">
              <th mat-header-cell *matHeaderCellDef>HSN</th>
              <td mat-cell *matCellDef="let p">{{p.hsn || '—'}}</td>
            </ng-container>

            <ng-container matColumnDef="rate">
              <th mat-header-cell *matHeaderCellDef>Rate</th>
              <td mat-cell *matCellDef="let p">Rs. {{p.rate}}</td>
            </ng-container>

            <ng-container matColumnDef="gstPercentage">
              <th mat-header-cell *matHeaderCellDef>GST %</th>
              <td mat-cell *matCellDef="let p">{{p.gstPercentage}}%</td>
            </ng-container>

            <ng-container matColumnDef="stockQuantity">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let p">
                <span [style.color]="p.stockQuantity === 0 ? '#ef4444' : p.stockQuantity <= (p.reorderLevel || 0) ? '#f59e0b' : 'inherit'"
                      [style.fontWeight]="p.stockQuantity === 0 ? '700' : '400'">
                  {{p.stockQuantity || 0}} <small>{{p.uom || 'NOS'}}</small>
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="toggle-cell">Status</th>
              <td mat-cell *matCellDef="let p" class="toggle-cell">
                <mat-slide-toggle
                  [checked]="p.active !== false"
                  (change)="toggleActive(p)"
                  color="primary"
                  [matTooltip]="p.active !== false ? 'Active — click to deactivate' : 'Inactive — click to activate'">
                </mat-slide-toggle>
                <span class="pill-badge" [class.active]="p.active !== false" [class.inactive]="p.active === false">
                  {{ p.active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
              <td mat-cell *matCellDef="let p" class="actions-cell">
                <button mat-icon-button color="accent" (click)="adjustStock(p)" matTooltip="Adjust Stock">
                  <mat-icon>published_with_changes</mat-icon>
                </button>
                <a mat-icon-button color="primary" [routerLink]="['/products', p.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deleteProduct(p)" matTooltip="Delete"
                        *ngIf="isAdmin()">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.row-inactive]="row.active === false"></tr>

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
  styles: []
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'hsn', 'rate', 'gstPercentage', 'stockQuantity', 'status', 'actions'];

  constructor(
    private svc: ProductService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts(search?: string) {
    this.svc.getAll(search).subscribe(data => this.products = data);
  }

  onSearch(e: Event): void {
    const q = (e.target as HTMLInputElement).value.trim();
    this.loadProducts(q || undefined);
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
  }

  toggleActive(p: Product): void {
    this.svc.toggleActive(p.id!).subscribe(updated => {
      p.active = updated.active;
      this.snackBar.open(
        `Product "${p.name}" ${updated.active ? 'activated' : 'deactivated'}.`,
        'OK', { duration: 3000 }
      );
    });
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
      if (success) this.loadProducts();
    });
  }
}
