import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Product } from '../../../core/services/product.service';
import { StockAdjustmentService } from '../../../core/services/stock-adjustment.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stock-adjustment-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatRadioModule, MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>published_with_changes</mat-icon>
        </div>
        <div>
          <h2>Adjust Stock</h2>
          <p class="subtitle">{{ product.name }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="info-strip">
            <span class="info-label">Current Stock:</span>
            <strong class="info-value">{{ product.stockQuantity || 0 }} {{ product.uom || 'NOS' }}</strong>
          </div>

          <div class="form-grid">
            <div class="span-2">
              <label class="radio-label">Adjustment Type</label>
              <mat-radio-group formControlName="adjustmentType" class="adjustment-type-group">
                <mat-radio-button value="ADD" color="primary">
                  <div class="radio-content">
                    <mat-icon class="add-icon">add_circle</mat-icon>
                    <span>Stock In (Addition)</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="SUBTRACT" color="warn">
                  <div class="radio-content">
                    <mat-icon class="sub-icon">remove_circle</mat-icon>
                    <span>Stock Out (Reduction / Loss)</span>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Adjustment Quantity</mat-label>
              <input matInput type="number" formControlName="quantity" min="1" placeholder="e.g. 5">
              <mat-icon matPrefix>pin</mat-icon>
              <mat-error *ngIf="form.get('quantity')?.hasError('required')">Quantity is required</mat-error>
              <mat-error *ngIf="form.get('quantity')?.hasError('min')">Quantity must be 1 or more</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Reason for Adjustment</mat-label>
              <mat-select formControlName="reason">
                <mat-option value="PHYSICAL_COUNT">Physical Count Audit</mat-option>
                <mat-option value="DAMAGED">Damaged Inventory</mat-option>
                <mat-option value="LOST">Lost Item</mat-option>
                <mat-option value="FOUND">Found Extra Item</mat-option>
                <mat-option value="REPARATION">Repair Usage Correction</mat-option>
                <mat-option value="OTHER">Other Reason</mat-option>
              </mat-select>
              <mat-icon matPrefix>info</mat-icon>
              <mat-error>Reason is required</mat-error>
            </mat-form-field>

            <div class="span-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Remarks / Notes</mat-label>
                <textarea matInput formControlName="notes" rows="2" placeholder="Explain details (optional)..."></textarea>
                <mat-icon matPrefix>description</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Live Preview Box -->
          <div class="preview-box" *ngIf="form.valid">
            <div class="preview-title">Projected Outcome Preview</div>
            <div class="preview-flow">
              <div class="flow-step">
                <span class="flow-lbl">Current</span>
                <span class="flow-val">{{ product.stockQuantity || 0 }}</span>
              </div>
              <div class="flow-arrow">
                <mat-icon>arrow_forward</mat-icon>
                <span class="flow-diff" [class.diff-add]="isAdd()" [class.diff-sub]="!isAdd()">
                  {{ isAdd() ? '+' : '-' }}{{ form.get('quantity')?.value }}
                </span>
              </div>
              <div class="flow-step">
                <span class="flow-lbl">Projected</span>
                <span class="flow-val" [class.val-add]="isAdd()" [class.val-sub]="!isAdd()" [class.val-negative]="projectedStock() < 0">
                  {{ projectedStock() }} {{ product.uom || 'NOS' }}
                </span>
              </div>
            </div>
            <div class="warning-text" *ngIf="projectedStock() < 0">
              <mat-icon>warning</mat-icon>
              <span>Warning: Projected stock will fall below zero!</span>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" mat-dialog-close>Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting">
            {{ submitting ? 'Saving...' : 'Save Adjustment' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 8px; }
    .dialog-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .header-icon { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; }
    .header-icon mat-icon { font-size: 24px; width: 24px; height: 24px; }
    h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--text-primary); }
    .subtitle { margin: 2px 0 0; font-size: 13px; color: var(--text-secondary); }

    .info-strip { background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
    .info-label { color: var(--text-secondary); }
    .info-value { color: var(--accent-blue); font-size: 15px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin-bottom: 16px; }
    .span-2 { grid-column: span 2; }
    .full-width { width: 100%; }

    .radio-label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em; }
    .adjustment-type-group { display: flex; gap: 16px; width: 100%; }
    .adjustment-type-group mat-radio-button { flex: 1; border: 1px solid var(--border); border-radius: 8px; padding: 12px; transition: all 0.2s ease; background: var(--bg-card); }
    .adjustment-type-group mat-radio-button.mat-mdc-radio-checked { border-color: var(--mdc-radio-selected-focus-icon-color, #3b82f6); background: rgba(59, 130, 246, 0.03); }
    .radio-content { display: flex; align-items: center; gap: 8px; }
    .radio-content mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .add-icon { color: #10b981; }
    .sub-icon { color: #f59e0b; }

    .preview-box { background: var(--bg-elevated); border: 1px dashed var(--border); border-radius: 12px; padding: 16px; margin-top: 16px; }
    .preview-title { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: bold; margin-bottom: 12px; letter-spacing: 0.05em; }
    .preview-flow { display: flex; align-items: center; justify-content: center; gap: 24px; }
    .flow-step { display: flex; flex-direction: column; align-items: center; }
    .flow-lbl { font-size: 10px; color: var(--text-secondary); margin-bottom: 4px; }
    .flow-val { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .flow-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
    .flow-arrow mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .flow-diff { font-size: 12px; font-weight: bold; margin-top: 2px; }
    .diff-add { color: #10b981; }
    .diff-sub { color: #ef4444; }

    .val-add { color: #10b981; }
    .val-sub { color: #f59e0b; }
    .val-negative { color: #ef4444 !important; }

    .warning-text { display: flex; align-items: center; gap: 6px; color: #ef4444; font-size: 11px; justify-content: center; margin-top: 12px; font-weight: 500; }
    .warning-text mat-icon { font-size: 14px; width: 14px; height: 14px; }

    mat-dialog-actions { padding: 12px 0 0; }
  `]
})
export class StockAdjustmentDialogComponent implements OnInit {
  product: Product;
  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private svc: StockAdjustmentService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<StockAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {
    this.product = data.product;
    this.form = this.fb.group({
      adjustmentType: ['ADD', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      reason: ['PHYSICAL_COUNT', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {}

  isAdd(): boolean {
    return this.form.get('adjustmentType')?.value === 'ADD';
  }

  projectedStock(): number {
    const current = this.product.stockQuantity || 0;
    const qty = this.form.get('quantity')?.value || 0;
    return this.isAdd() ? current + qty : current - qty;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    const payload = {
      product: { id: this.product.id },
      adjustmentType: this.form.value.adjustmentType,
      quantity: this.form.value.quantity,
      reason: this.form.value.reason,
      notes: this.form.value.notes
    };

    this.svc.create(payload as any).subscribe({
      next: (res) => {
        this.submitting = false;
        this.snackBar.open('Stock adjusted successfully!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Failed to adjust stock. Please try again.', 'OK', { duration: 3000 });
      }
    });
  }
}
