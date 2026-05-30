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
import { ReceiptService } from '../../../core/services/receipt.service';
import { CustomerService } from '../../../core/services/customer.service';
import { SalesInvoiceService } from '../../../core/services/sales-invoice.service';
import { Customer } from '../../../core/models/customer.model';
import { SalesInvoice } from '../../../core/models/sales-invoice.model';
import { CompanyDetailsService } from '../../../core/services/company-details.service';

@Component({
  selector: 'app-receipt-form',
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
          <h1>{{ editMode ? 'Edit Receipt' : 'Record Customer Receipt' }}</h1>
          <p>{{ editMode ? 'Update payment receipt record' : 'Create a new incoming payment receipt from a customer' }}</p>
        </div>
        <a mat-stroked-button routerLink="/receipts">
          <mat-icon>arrow_back</mat-icon> Back to Receipts
        </a>
      </div>

      <mat-card class="form-card-page">
        <form [formGroup]="form" (ngSubmit)="save()" id="receiptForm" class="form-grid">

          <div class="section-title">
            <mat-icon>tag</mat-icon>
            Reference Details
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Receipt Number</mat-label>
              <mat-icon matPrefix>confirmation_number</mat-icon>
              <input matInput formControlName="receiptNumber" required readonly>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Receipt Date</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput type="date" formControlName="receiptDate" required>
            </mat-form-field>
          </div>

          <div class="section-title">
            <mat-icon>person</mat-icon>
            Customer & Invoice
          </div>

          <div class="form-row-2">
            <mat-form-field appearance="outline">
              <mat-label>Customer</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <mat-select formControlName="customerId" required (selectionChange)="onCustomerChange($event.value)">
                <mat-option *ngFor="let c of customers" [value]="c.id">
                  {{ c.name }} — {{ c.phone }}
                </mat-option>
              </mat-select>
              <mat-error>Please select a customer</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Sales Invoice (Optional)</mat-label>
              <mat-icon matPrefix>receipt_long</mat-icon>
              <mat-select formControlName="salesInvoiceId" (selectionChange)="onInvoiceChange($event.value)">
                <mat-option [value]="null">— General / Advance Payment —</mat-option>
                <mat-option *ngFor="let inv of filteredInvoices" [value]="inv.id">
                  {{ inv.invoiceNumber }} &nbsp;(Total: ₹ {{ inv.grandTotal | number:'1.2-2' }})
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
              <mat-label>Amount Received</mat-label>
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
            <textarea matInput formControlName="notes" rows="3" placeholder="Add any reference or notes about this receipt..."></textarea>
          </mat-form-field>

        </form>

        <div class="form-actions-bar">
          <a mat-stroked-button routerLink="/receipts">Cancel</a>
          <button mat-raised-button color="primary" type="submit" form="receiptForm" [disabled]="loading || form.invalid">
            <mat-icon>{{ loading ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ loading ? 'Saving...' : (editMode ? 'Update Receipt' : 'Record Receipt') }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-form-field { width: 100%; }
  `]
})
export class ReceiptFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  editMode = false;
  editId?: number;
  customers: Customer[] = [];
  invoices: SalesInvoice[] = [];
  filteredInvoices: SalesInvoice[] = [];

  constructor(
    private fb: FormBuilder,
    private receiptService: ReceiptService,
    private customerService: CustomerService,
    private invoiceService: SalesInvoiceService,
    private companyDetailsService: CompanyDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      receiptNumber: ['REC-' + Date.now().toString().slice(-6), Validators.required],
      receiptDate: [new Date().toISOString().substring(0, 10), Validators.required],
      customerId: ['', Validators.required],
      salesInvoiceId: [null],
      paymentMethod: ['CASH', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.customerService.getActive().subscribe(c => this.customers = c);
    this.invoiceService.getAll().subscribe(i => {
      this.invoices = i;
      this.filteredInvoices = i;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.editId = +id;
      this.loadReceipt();
    } else {
      this.companyDetailsService.get().subscribe({
        next: (details) => {
          if (details && details.nextReceiptNo !== undefined) {
            const prefix = details.receiptPrefix || 'REC-';
            const nextNo = details.nextReceiptNo;
            this.form.patchValue({ receiptNumber: `${prefix}${nextNo}` });
          }
        },
        error: (err) => console.error('Error fetching company details for receipt serialization:', err)
      });
    }
  }

  loadReceipt() {
    this.loading = true;
    this.receiptService.getById(this.editId!).subscribe({
      next: (r) => {
        this.form.patchValue({
          receiptNumber: r.receiptNumber,
          receiptDate: r.receiptDate,
          customerId: r.customer?.id,
          salesInvoiceId: r.salesInvoice?.id,
          paymentMethod: r.paymentMethod,
          amount: r.amount,
          notes: r.notes
        });
        if (r.customer?.id) {
          this.filterInvoices(r.customer.id);
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error loading receipt data', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCustomerChange(customerId: number) {
    this.filterInvoices(customerId);
    this.form.get('salesInvoiceId')?.setValue(null);
  }

  filterInvoices(customerId: number) {
    this.filteredInvoices = this.invoices.filter(inv => inv.customer?.id === customerId);
  }

  onInvoiceChange(invoiceId: number) {
    if (!invoiceId) return;
    const inv = this.filteredInvoices.find(i => i.id === invoiceId);
    if (inv) {
      this.form.get('amount')?.setValue(inv.grandTotal);
    }
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;

    const obs = this.editMode
      ? this.receiptService.update(this.editId!, this.form.value)
      : this.receiptService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snackBar.open(`Receipt ${this.editMode ? 'updated' : 'recorded'} successfully`, 'OK', { duration: 3000 });
        this.router.navigate(['/receipts']);
      },
      error: (err) => {
        this.snackBar.open('Error saving receipt: ' + (err.error?.message || err.message || 'Unknown error'), 'OK', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
