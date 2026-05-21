import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { PurchaseService } from '../../../core/services/purchase.service';
import { Supplier } from '../../../core/models/supplier.model';
import { PurchaseInvoice } from '../../../core/models/purchase.model';
import { CompanyDetailsService } from '../../../core/services/company-details.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ editMode ? 'Edit Payment' : 'Record Supplier Payment' }}</h1>
          <p>{{ editMode ? 'Update payment payout record' : 'Create a new outgoing payment to a supplier' }}</p>
        </div>
        <a mat-stroked-button routerLink="/payments">
          <mat-icon>arrow_back</mat-icon> Back to Payments
        </a>
      </div>

      <mat-card class="form-card-page">
        <form [formGroup]="form" (ngSubmit)="save()" id="paymentForm" class="form-grid">

          <div class="section-title">
            <mat-icon>tag</mat-icon>
            Reference Details
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Payment Number</mat-label>
              <mat-icon matPrefix>confirmation_number</mat-icon>
              <input matInput formControlName="paymentNumber" required readonly>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Payment Date</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput type="date" formControlName="paymentDate" required>
            </mat-form-field>
          </div>

          <div class="section-title">
            <mat-icon>store</mat-icon>
            Supplier & Invoice
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Supplier</mat-label>
              <mat-icon matPrefix>business</mat-icon>
              <mat-select formControlName="supplierId" required (selectionChange)="onSupplierChange($event.value)">
                <mat-option *ngFor="let s of suppliers" [value]="s.id">
                  {{ s.name }} — {{ s.phone }}
                </mat-option>
              </mat-select>
              <mat-error>Please select a supplier</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Purchase Invoice (Optional)</mat-label>
              <mat-icon matPrefix>receipt</mat-icon>
              <mat-select formControlName="purchaseInvoiceId" (selectionChange)="onPurchaseChange($event.value)">
                <mat-option [value]="null">— General / Advance Payment —</mat-option>
                <mat-option *ngFor="let pur of filteredPurchases" [value]="pur.id">
                  {{ pur.invoiceNumber }} &nbsp;(Total: ₹ {{ pur.grandTotal | number:'1.2-2' }})
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="section-title">
            <mat-icon>payments</mat-icon>
            Payment Details
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Payment Method</mat-label>
              <mat-icon matPrefix>credit_card</mat-icon>
              <mat-select formControlName="paymentMethod" required>
                <mat-option value="CASH">Cash</mat-option>
                <mat-option value="CARD">Card / POS</mat-option>
                <mat-option value="UPI">UPI / QR Code</mat-option>
                <mat-option value="BANK_TRANSFER">Bank Transfer / NEFT</mat-option>
              </mat-select>
              <mat-error>Please select a method</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Amount Paid</mat-label>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-icon matPrefix>currency_rupee</mat-icon>
              <input matInput type="number" formControlName="amount" required min="0.01">
              <mat-error>A valid amount is required</mat-error>
            </mat-form-field>
          </div>

          <div class="section-title">
            <mat-icon>notes</mat-icon>
            Additional Notes
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Notes / Comments</mat-label>
            <mat-icon matPrefix>notes</mat-icon>
            <textarea matInput formControlName="notes" rows="3" placeholder="Add any reference or notes about this payment..."></textarea>
          </mat-form-field>

        </form>

        <div class="form-actions-bar">
          <a mat-stroked-button routerLink="/payments">Cancel</a>
          <button mat-raised-button color="primary" type="submit" form="paymentForm" [disabled]="loading || form.invalid">
            <mat-icon>{{ loading ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ loading ? 'Saving...' : (editMode ? 'Update Payment' : 'Record Payment') }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-form-field { width: 100%; }
  `]
})
export class PaymentFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  editMode = false;
  editId?: number;
  suppliers: Supplier[] = [];
  purchases: PurchaseInvoice[] = [];
  filteredPurchases: PurchaseInvoice[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private companyDetailsService: CompanyDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      paymentNumber: ['PAY-' + Date.now().toString().slice(-6), Validators.required],
      paymentDate: [new Date().toISOString().substring(0, 10), Validators.required],
      supplierId: ['', Validators.required],
      purchaseInvoiceId: [null],
      paymentMethod: ['CASH', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.supplierService.getAll().subscribe(s => this.suppliers = s);
    this.purchaseService.getAll().subscribe(p => {
      this.purchases = p;
      this.filteredPurchases = p;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.editId = +id;
      this.loadPayment();
    } else {
      this.companyDetailsService.get().subscribe({
        next: (details) => {
          if (details && details.nextPaymentNo !== undefined) {
            const prefix = details.paymentPrefix || 'PAY-';
            const nextNo = details.nextPaymentNo;
            this.form.patchValue({ paymentNumber: `${prefix}${nextNo}` });
          }
        },
        error: (err) => console.error('Error fetching company details for payment serialization:', err)
      });
    }
  }

  loadPayment() {
    this.loading = true;
    this.paymentService.getById(this.editId!).subscribe({
      next: (p) => {
        this.form.patchValue({
          paymentNumber: p.paymentNumber,
          paymentDate: p.paymentDate,
          supplierId: p.supplier?.id,
          purchaseInvoiceId: p.purchaseInvoice?.id,
          paymentMethod: p.paymentMethod,
          amount: p.amount,
          notes: p.notes
        });
        if (p.supplier?.id) {
          this.filterPurchases(p.supplier.id);
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error loading payment data', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSupplierChange(supplierId: number) {
    this.filterPurchases(supplierId);
    this.form.get('purchaseInvoiceId')?.setValue(null);
  }

  filterPurchases(supplierId: number) {
    this.filteredPurchases = this.purchases.filter(pur => pur.supplier?.id === supplierId);
  }

  onPurchaseChange(purchaseInvoiceId: number) {
    if (!purchaseInvoiceId) return;
    const pur = this.filteredPurchases.find(p => p.id === purchaseInvoiceId);
    if (pur) {
      this.form.get('amount')?.setValue(pur.grandTotal);
    }
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;

    const obs = this.editMode
      ? this.paymentService.update(this.editId!, this.form.value)
      : this.paymentService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Payment ${this.editMode ? 'updated' : 'recorded'} successfully`, 'OK', { duration: 3000 });
        this.router.navigate(['/payments']);
      },
      error: (err) => {
        this.snackBar.open('Error saving payment: ' + (err.error?.message || err.message || 'Unknown error'), 'OK', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
