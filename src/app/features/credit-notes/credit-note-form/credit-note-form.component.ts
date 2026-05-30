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
import { Router, RouterModule } from '@angular/router';
import { CreditNoteService } from '../../../core/services/credit-note.service';
import { CustomerService } from '../../../core/services/customer.service';
import { SalesInvoiceService } from '../../../core/services/sales-invoice.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { CompanyDetailsService } from '../../../core/services/company-details.service';
import { Customer } from '../../../core/models/customer.model';
import { SalesInvoice } from '../../../core/models/sales-invoice.model';

@Component({
  selector: 'app-credit-note-form',
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
          <h1>Create Credit Note</h1>
          <p>Issue a sales return or billing adjustment credit voucher</p>
        </div>
        <a mat-stroked-button routerLink="/credit-notes">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Credit Note Number</mat-label>
              <input matInput formControlName="noteNumber" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput type="date" formControlName="noteDate" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Adjustment Reason</mat-label>
              <mat-select formControlName="reason" required>
                <mat-option value="SALES_RETURN">Sales Return (Returns stock to inventory)</mat-option>
                <mat-option value="POST_SALES_DISCOUNT">Post-Sale Discount</mat-option>
                <mat-option value="CORRECTION_IN_INVOICE">Correction in Invoice</mat-option>
                <mat-option value="OTHER">Other Adjustment</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row" style="align-items: center;">
            <mat-form-field appearance="outline" style="flex: 1;">
              <mat-label>Reference Sales Invoice (Optional)</mat-label>
              <mat-select formControlName="salesInvoiceId" (selectionChange)="onInvoiceSelect($event.value)">
                <mat-option [value]="null">-- Direct / No Invoice Reference --</mat-option>
                <mat-option *ngFor="let inv of invoices" [value]="inv.id">
                  {{ inv.invoiceNumber }} (Date: {{ inv.invoiceDate | date:'shortDate' }} | Total: ₹{{ inv.grandTotal | number:'1.2-2' }})
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" style="flex: 1;">
              <mat-label>Customer</mat-label>
              <mat-select formControlName="customerId" required>
                <mat-option *ngFor="let c of customers" [value]="c.id">{{ c.name }} - {{ c.phone }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Quick Invoice Items Panel -->
          <div class="invoice-items-suggestion" *ngIf="selectedInvoice && selectedInvoice.items && selectedInvoice.items.length > 0">
            <div class="suggestion-header">
              <mat-icon color="primary">info</mat-icon>
              <span>Items listed on Invoice {{ selectedInvoice.invoiceNumber }}</span>
            </div>
            <div class="suggestion-list">
              <div *ngFor="let invItem of selectedInvoice.items" class="suggestion-chip">
                <span>{{ invItem.description }} (Qty: {{ invItem.quantity }} &#64; ₹{{ invItem.unitPrice }})</span>
                <button type="button" mat-stroked-button color="primary" size="small" (click)="addSuggestedItem(invItem)">
                  <mat-icon style="font-size:16px;width:16px;height:16px;">add</mat-icon> Add to Credit Note
                </button>
              </div>
            </div>
          </div>

          <!-- Line Items Section -->
          <div class="items-section">
            <div class="items-header">
              <h3>Voucher Line Items</h3>
              <button mat-button color="primary" type="button" (click)="addItem()">
                <mat-icon>add</mat-icon> Add Custom Line
              </button>
            </div>

            <div formArrayName="items" class="items-list">
              <div class="items-header-row">
                <span class="col-product">Product/Spare</span>
                <span class="col-desc">Description</span>
                <span class="col-qty">Qty</span>
                <span class="col-price">Rate (₹)</span>
                <span class="col-gst">GST %</span>
                <span class="col-total">Total (₹)</span>
                <span class="col-action"></span>
              </div>

              <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="item-row">
                <div class="col-product">
                  <mat-form-field appearance="outline" style="width: 100%;">
                    <mat-select formControlName="productId" (selectionChange)="onProductSelect(i, $event.value)">
                      <mat-option [value]="null">-- Custom/Ad-hoc --</mat-option>
                      <mat-option *ngFor="let p of products" [value]="p.id">{{ p.name }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="col-desc">
                  <input matInput formControlName="description" required placeholder="e.g. Sales return adjustment">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-qty">
                  <input matInput type="number" formControlName="quantity" required min="1">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-price">
                  <input matInput type="number" formControlName="unitPrice" required min="0">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-gst">
                  <mat-select formControlName="gstPercentage">
                    <mat-option [value]="0">0%</mat-option>
                    <mat-option [value]="5">5%</mat-option>
                    <mat-option [value]="12">12%</mat-option>
                    <mat-option [value]="18">18%</mat-option>
                    <mat-option [value]="28">28%</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="col-total">
                  ₹ {{ getLineTotal(i) | number:'1.2-2' }}
                </div>

                <div class="col-action">
                  <button mat-icon-button color="warn" type="button" (click)="removeItem(i)" *ngIf="items.length > 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Totals Panel -->
          <div class="summary-section">
            <div class="summary-row">
              <span>Taxable Subtotal:</span>
              <span>₹ {{ subTotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>GST Tax Amount:</span>
              <span>₹ {{ taxTotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row grand-total">
              <span>Grand Total Credit:</span>
              <span>₹ {{ grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Voucher Narration / Adjustment Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3" placeholder="Describe the reason for adjustment, returns, or post-sales discount details..."></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
              <mat-icon>check_circle</mat-icon> {{ loading ? 'Saving...' : 'Issue Credit Note' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .form-row mat-form-field { flex: 1; min-width: 220px; }
    .invoice-items-suggestion { background: rgba(63, 81, 181, 0.05); border: 1px dashed #3f51b5; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .suggestion-header { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #3f51b5; margin-bottom: 12px; }
    .suggestion-list { display: flex; flex-direction: column; gap: 8px; }
    .suggestion-chip { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; font-size: 13px; }
    .items-section { margin: 24px 0; border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
    .items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .items-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .items-header-row {
      display: grid;
      grid-template-columns: 1.5fr 2fr 0.6fr 0.8fr 0.6fr 1fr 40px;
      gap: 12px;
      padding: 0 4px 8px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }
    .item-row {
      display: grid;
      grid-template-columns: 1.5fr 2fr 0.6fr 0.8fr 0.6fr 1fr 40px;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
    }
    .col-qty, .col-price, .col-gst { margin-bottom: 0; }
    .col-total { font-weight: 600; color: var(--text-primary); text-align: right; padding-right: 12px; }
    .col-action { display: flex; justify-content: center; }
    .full-width { width: 100%; margin-top: 16px; }
    .summary-section { margin-top: 16px; padding: 16px; background: rgba(0,0,0,0.02); border-radius: 8px; width: 320px; margin-left: auto; border: 1px solid var(--border); }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .summary-row.grand-total { font-weight: 600; font-size: 18px; color: #3f51b5; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class CreditNoteFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  products: Product[] = [];
  customers: Customer[] = [];
  invoices: SalesInvoice[] = [];
  selectedInvoice: SalesInvoice | null = null;

  subTotal = 0;
  taxTotal = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private creditNoteService: CreditNoteService,
    private customerService: CustomerService,
    private invoiceService: SalesInvoiceService,
    private productService: ProductService,
    private companyDetailsService: CompanyDetailsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      noteNumber: ['', Validators.required],
      noteDate: [new Date().toISOString().substring(0, 10), Validators.required],
      salesInvoiceId: [null],
      customerId: ['', Validators.required],
      reason: ['SALES_RETURN', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.productService.getActive().subscribe(p => this.products = p);
    this.customerService.getActive().subscribe(c => this.customers = c);
    this.invoiceService.getAll().subscribe(i => this.invoices = i);

    this.companyDetailsService.get().subscribe({
      next: (details) => {
        if (details && details.nextCreditNoteNo !== undefined) {
          const prefix = details.creditNotePrefix || 'CN-';
          const nextNo = details.nextCreditNoteNo;
          this.form.patchValue({
            noteNumber: `${prefix}${nextNo}`
          });
        }
      }
    });

    this.addItem(); // Add initial blank line
    this.form.valueChanges.subscribe(() => this.calculateTotals());
  }

  get items() { return this.form.get('items') as FormArray; }

  createItem(productId: any = null, desc: string = '', qty: number = 1, price: number = 0, gst: number = 18): FormGroup {
    return this.fb.group({
      productId: [productId],
      description: [desc, Validators.required],
      quantity: [qty, [Validators.required, Validators.min(1)]],
      unitPrice: [price, [Validators.required, Validators.min(0)]],
      gstPercentage: [gst, Validators.required]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onProductSelect(index: number, productId: number) {
    if (!productId) return;
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      this.items.at(index).patchValue({
        description: prod.name,
        unitPrice: prod.rate,
        gstPercentage: prod.gstPercentage
      });
    }
  }

  onInvoiceSelect(invoiceId: number | null) {
    if (!invoiceId) {
      this.selectedInvoice = null;
      return;
    }
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (inv) {
      this.selectedInvoice = inv;
      this.form.patchValue({
        customerId: inv.customer?.id
      });
      // Clear empty arrays if user had only a default empty row
      if (this.items.length === 1 && !this.items.at(0).get('description')?.value) {
        this.items.clear();
      }
      // Propose adding items from invoice
      this.snackBar.open(`Reference loaded. You can select items from Invoice ${inv.invoiceNumber} below to adjust.`, 'OK', { duration: 5000 });
    }
  }

  addSuggestedItem(invItem: any) {
    this.items.push(this.createItem(
      invItem.product?.id || null,
      invItem.description || '',
      invItem.quantity,
      invItem.unitPrice,
      invItem.gstPercentage || 18
    ));
    this.calculateTotals();
    this.snackBar.open(`Added "${invItem.description}" to Credit Note`, 'Dismiss', { duration: 2000 });
  }

  getLineTotal(index: number): number {
    const item = this.items.at(index).value;
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    const gst = item.gstPercentage || 0;
    const taxable = qty * price;
    return taxable + (taxable * (gst / 100));
  }

  calculateTotals() {
    let sub = 0;
    let tax = 0;
    const itemsVal = this.items.value || [];
    
    itemsVal.forEach((item: any) => {
      const qty = item.quantity || 0;
      const price = item.unitPrice || 0;
      const gst = item.gstPercentage || 0;
      const taxable = qty * price;
      sub += taxable;
      tax += taxable * (gst / 100);
    });

    this.subTotal = sub;
    this.taxTotal = tax;
    this.grandTotal = sub + tax;
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;

    this.creditNoteService.create(this.form.value).subscribe({
      next: (res) => {
        this.snackBar.open(`Credit Note ${res.noteNumber} generated successfully`, 'OK', { duration: 3000 });
        this.router.navigate(['/credit-notes', res.id]);
      },
      error: (err) => {
        this.snackBar.open('Error saving credit note: ' + (err.error?.message || err.message), 'OK', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
