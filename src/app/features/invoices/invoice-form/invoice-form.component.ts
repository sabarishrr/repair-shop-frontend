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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SalesInvoiceService } from '../../../core/services/sales-invoice.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { Customer } from '../../../core/models/customer.model';
import { QuotationService } from '../../../core/services/quotation.service';
import { CompanyDetailsService } from '../../../core/services/company-details.service';
import { CustomerFormComponent } from '../../customers/customer-form/customer-form.component';
import { ProductFormComponent } from '../../products/product-form/product-form.component';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, MatExpansionModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Create Tax Invoice</h1>
          <p>Generate a formal GST invoice</p>
        </div>
        <a mat-stroked-button routerLink="/invoices">
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
                <mat-label>Customer</mat-label>
                <mat-select formControlName="customerId" required>
                  <mat-option *ngFor="let c of customers" [value]="c.id">{{c.name}} - {{c.phone}}</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-icon-button color="primary" type="button" class="add-inline-btn" (click)="addCustomer()" matTooltip="Add New Customer">
                <mat-icon>add_circle</mat-icon>
              </button>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Sales Type</mat-label>
              <mat-select formControlName="salesType" required>
                <mat-option value="CASH">Cash</mat-option>
                <mat-option value="CREDIT">Credit</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-expansion-panel class="advanced-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>local_shipping</mat-icon> Shipping & Order Details (Optional)
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Delivery Note</mat-label>
                <input matInput formControlName="deliveryNote">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Payment Terms</mat-label>
                <input matInput formControlName="paymentTerms" placeholder="e.g. 1 Days">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Supplier's Ref.</mat-label>
                <input matInput formControlName="supplierRef">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Buyer's Order No.</mat-label>
                <input matInput formControlName="buyerOrderNo">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Order Date</mat-label>
                <input matInput type="date" formControlName="buyerOrderDate">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Despatch Doc No.</mat-label>
                <input matInput formControlName="despatchDocumentNo">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Delivery Note Date</mat-label>
                <input matInput type="date" formControlName="deliveryNoteDate">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Despatched Through</mat-label>
                <input matInput formControlName="despatchedThrough">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Destination</mat-label>
                <input matInput formControlName="destination">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Terms of Delivery</mat-label>
                <input matInput formControlName="termsOfDelivery">
              </mat-form-field>
            </div>
          </mat-expansion-panel>

          <div class="items-section">
            <div class="items-header">
              <h3>Items & Services</h3>
              <button mat-button color="primary" type="button" (click)="addItem()">
                <mat-icon>add</mat-icon> Add Line
              </button>
            </div>

            <div formArrayName="items" class="items-list">
              <div class="items-header-row">
                <span class="col-product">Product/Spare</span>
                <span class="col-desc">Description</span>
                <span class="col-serial">Serial No.</span>
                <span class="col-warranty">Warranty</span>
                <span class="col-qty">Qty</span>
                <span class="col-price">Unit Price</span>
                <span class="col-gst">GST %</span>
                <span class="col-action"></span>
              </div>
              <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="item-row">
                <div class="col-product product-select-container">
                  <mat-form-field appearance="outline" style="flex:1;">
                    <mat-label>Product/Spare</mat-label>
                    <mat-select formControlName="productId" (selectionChange)="onProductSelect(i, $event.value)">
                      <mat-option [value]="null">-- Custom Service --</mat-option>
                      <mat-option *ngFor="let p of products" [value]="p.id">{{p.name}} (Stock: {{p.stockQuantity}})</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button mat-icon-button color="primary" type="button" class="add-inline-btn-small" (click)="addProduct(i)" matTooltip="Add New Product">
                    <mat-icon>add_circle</mat-icon>
                  </button>
                </div>

                <mat-form-field appearance="outline" class="col-desc" *ngIf="!item.get('productId')?.value">
                  <mat-label>Description</mat-label>
                  <input matInput formControlName="description">
                </mat-form-field>
                <div class="col-desc" *ngIf="item.get('productId')?.value"></div>

                <mat-form-field appearance="outline" class="col-serial">
                  <mat-label>Serial No.</mat-label>
                  <input matInput formControlName="serialNumber" placeholder="e.g. SN12345">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-warranty">
                  <mat-label>Warranty</mat-label>
                  <input matInput formControlName="warrantyPeriod" placeholder="e.g. 6 months">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-qty">
                  <mat-label>Qty</mat-label>
                  <input matInput type="number" formControlName="quantity" required min="1">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-price">
                  <mat-label>Unit Price</mat-label>
                  <input matInput type="number" formControlName="unitPrice" required min="0">
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-gst">
                  <mat-label>GST %</mat-label>
                  <mat-select formControlName="gstPercentage">
                    <mat-option [value]="0">0%</mat-option>
                    <mat-option [value]="5">5%</mat-option>
                    <mat-option [value]="12">12%</mat-option>
                    <mat-option [value]="18">18%</mat-option>
                    <mat-option [value]="28">28%</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="col-action">
                  <button mat-icon-button color="warn" type="button" (click)="removeItem(i)" *ngIf="items.length > 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
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
              <span>Tax (GST):</span>
              <span>Rs. {{ taxTotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row grand-total">
              <span>Grand Total:</span>
              <span>Rs. {{ grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Payment Details Section -->
          <div class="payment-section">
            <div class="section-title-row">
              <mat-icon color="primary">payments</mat-icon>
              <h3>Payment & Transaction Details</h3>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Payment Status</mat-label>
                <mat-select formControlName="status" required>
                  <mat-option value="PAID">Paid</mat-option>
                  <mat-option value="UNPAID">Unpaid</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="form.get('salesType')?.value === 'CASH' || form.get('status')?.value === 'PAID' || (form.get('receivedAmount')?.value || 0) > 0">
                <mat-label>Payment Method</mat-label>
                <mat-select formControlName="paymentMethod">
                  <mat-option value="CASH">Cash</mat-option>
                  <mat-option value="CARD">Card</mat-option>
                  <mat-option value="UPI">UPI/QR Code</mat-option>
                  <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Received Amount</mat-label>
                <input matInput type="number" formControlName="receivedAmount" min="0">
                <span matSuffix style="margin-right: 8px;">Rs.</span>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes / Terms & Conditions</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="loading || form.invalid">
              <mat-icon>receipt</mat-icon> {{ loading ? 'Saving...' : (editMode ? 'Update Invoice' : 'Generate Invoice') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-card { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .select-with-btn { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 240px; }
    .add-inline-btn { margin-top: -18px; color: #3f51b5; transition: transform 0.2s ease; }
    .add-inline-btn:hover { transform: scale(1.15); }
    .add-inline-btn-small { margin-top: -18px; color: #3f51b5; transition: transform 0.2s ease; }
    .add-inline-btn-small:hover { transform: scale(1.15); }
    .payment-section { margin-top: 16px; padding: 20px; background: rgba(88, 166, 255, 0.04); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; }
    .section-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .section-title-row h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .section-title-row mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .advanced-panel { margin-top: 16px; margin-bottom: 8px; box-shadow: none; border: 1px solid var(--border); }
    .advanced-panel mat-panel-title { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .items-section { margin: 24px 0; border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; }
    .items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .items-header h3 { margin: 0; font-size: 16px; font-weight: 500; }
    /* Column header row */
    .items-header-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 0.6fr 1fr 0.7fr 40px;
      gap: 8px;
      padding: 0 4px 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary, #888);
      border-bottom: 1px solid var(--border);
      margin-bottom: 8px;
      min-width: 860px;
    }
    /* Data rows */
    .item-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 0.6fr 1fr 0.7fr 40px;
      gap: 8px;
      align-items: center;
      min-width: 860px;
    }
    .product-select-container { display: flex; align-items: center; gap: 2px; }
    .col-product  { }
    .col-desc     { }
    .col-serial   { }
    .col-warranty { }
    .col-qty      { }
    .col-price    { }
    .col-gst      { }
    .col-action   { display: flex; align-items: center; justify-content: center; margin-top: -18px; }
    .full-width { width: 100%; margin-top: 16px; }
    .summary-section { margin-top: 16px; padding: 16px; background: var(--surface-hover); border-radius: 8px; width: 300px; margin-left: auto; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .summary-row.grand-total { font-weight: 600; font-size: 18px; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class InvoiceFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  products: Product[] = [];
  customers: Customer[] = [];
  quotationId?: number;
  editMode = false;
  editId?: number;

  subTotal = 0;
  taxTotal = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private invoiceService: SalesInvoiceService,
    private customerService: CustomerService,
    private productService: ProductService,
    private quotationService: QuotationService,
    private companyDetailsService: CompanyDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      invoiceNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      quotationId: [null],
      invoiceDate: [new Date().toISOString().substring(0,10), Validators.required],
      status: ['PAID', Validators.required],
      salesType: ['CASH', Validators.required],
      paymentMethod: ['CASH'],
      receivedAmount: [0],
      notes: ['Goods once sold will not be taken back.'],
      deliveryNote: [''],
      paymentTerms: [''],
      supplierRef: [''],
      buyerOrderNo: [''],
      buyerOrderDate: [''],
      despatchDocumentNo: [''],
      deliveryNoteDate: [''],
      despatchedThrough: [''],
      destination: [''],
      termsOfDelivery: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.productService.getActive().subscribe(p => this.products = p);
    this.customerService.getActive().subscribe(c => this.customers = c);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.editId = +id;
        this.loadInvoiceData();
      } else {
        this.companyDetailsService.get().subscribe({
          next: (details) => {
            if (details && details.nextInvoiceNo !== undefined) {
              const prefix = details.invoicePrefix || 'INV-';
              const nextNo = details.nextInvoiceNo;
              this.form.patchValue({
                invoiceNumber: `${prefix}${nextNo}`
              });
            }
          },
          error: (err) => console.error('Error fetching company details for serialization:', err)
        });

        this.route.queryParams.subscribe(qParams => {
          if (qParams['quotationId']) {
            this.quotationId = +qParams['quotationId'];
            this.loadQuotationData();
          } else {
            this.addItem(); // add initial empty row
          }
        });
      }
    });

    this.form.valueChanges.subscribe(() => this.calculateTotals());

    // Dynamic UI logic for Sales Type and Payment Status
    this.form.get('salesType')?.valueChanges.subscribe(type => {
      if (type === 'CASH') {
        this.form.get('status')?.setValue('PAID');
        this.form.get('paymentMethod')?.setValue('CASH');
        this.form.get('receivedAmount')?.setValue(this.grandTotal);
      } else if (type === 'CREDIT') {
        this.form.get('status')?.setValue('UNPAID');
        this.form.get('paymentMethod')?.setValue(null);
        this.form.get('receivedAmount')?.setValue(0);
      }
    });

    this.form.get('status')?.valueChanges.subscribe(status => {
      const salesType = this.form.get('salesType')?.value;
      if (status === 'PAID') {
        if (!this.form.get('paymentMethod')?.value) {
          this.form.get('paymentMethod')?.setValue('CASH');
        }
        this.form.get('receivedAmount')?.setValue(this.grandTotal);
      } else if (status === 'UNPAID') {
        if (salesType === 'CASH') {
          this.form.get('salesType')?.setValue('CREDIT', { emitEvent: false });
        }
      }
    });
  }

  calculateTotals() {
    let sub = 0;
    let tax = 0;
    const itemsValue = this.form.get('items')?.value || [];
    
    itemsValue.forEach((item: any) => {
      const qty = item.quantity || 0;
      const rate = item.unitPrice || 0;
      const discount = item.discount || 0;
      const gst = item.gstPercentage || 0;

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

    const salesType = this.form.get('salesType')?.value;
    const status = this.form.get('status')?.value;
    if (salesType === 'CASH' || status === 'PAID') {
      this.form.get('receivedAmount')?.setValue(this.grandTotal, { emitEvent: false });
    }
  }

  loadInvoiceData() {
    this.invoiceService.getById(this.editId!).subscribe(inv => {
      this.form.patchValue({
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customer?.id,
        invoiceDate: inv.invoiceDate,
        status: inv.status,
        salesType: inv.salesType || 'CASH',
        paymentMethod: inv.paymentMethod || 'CASH',
        receivedAmount: inv.receivedAmount || 0,
        notes: inv.notes,
        quotationId: inv.quotation?.id,
        deliveryNote: inv.deliveryNote,
        paymentTerms: inv.paymentTerms,
        supplierRef: inv.supplierRef,
        buyerOrderNo: inv.buyerOrderNo,
        buyerOrderDate: inv.buyerOrderDate,
        despatchDocumentNo: inv.despatchDocumentNo,
        deliveryNoteDate: inv.deliveryNoteDate,
        despatchedThrough: inv.despatchedThrough,
        destination: inv.destination,
        termsOfDelivery: inv.termsOfDelivery
      });
      
      inv.items.forEach((item: any) => {
        this.items.push(this.fb.group({
          productId: [item.product?.id || null],
          description: [item.description || '', Validators.required],
          serialNumber: [item.serialNumber || ''],
          warrantyPeriod: [item.warrantyPeriod || ''],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
          discount: [item.discount || 0],
          gstPercentage: [item.gstPercentage, Validators.required]
        }));
      });
      this.calculateTotals();
    });
  }

  loadQuotationData() {
    this.quotationService.getById(this.quotationId!).subscribe(q => {
      this.form.patchValue({
        customerId: q.customer?.id,
        quotationId: q.id
      });
      q.items.forEach((item: any) => {
        this.items.push(this.fb.group({
          productId: [item.product?.id || null],
          description: [item.product?.name || item.description || '', Validators.required],
          serialNumber: [''],
          warrantyPeriod: [''],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          unitPrice: [item.rate || item.unitPrice || 0, [Validators.required, Validators.min(0)]],
          discount: [0],
          gstPercentage: [item.gstPercentage || 18, Validators.required]
        }));
      });
      if(this.items.length === 0) this.addItem();
    });
  }

  get items() { return this.form.get('items') as FormArray; }

  createItem(): FormGroup {
    return this.fb.group({
      productId: [null],
      description: [''],
      serialNumber: [''],
      warrantyPeriod: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      gstPercentage: [18, Validators.required]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onProductSelect(index: number, productId: number) {
    if(!productId) return;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.items.at(index).patchValue({ 
        unitPrice: product.rate,
        gstPercentage: product.gstPercentage,
        description: product.name
      });
    }
  }

  addCustomer() {
    const dialogRef = this.dialog.open(CustomerFormComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      data: {}
    });

    dialogRef.afterClosed().subscribe((newCustomer: Customer) => {
      if (newCustomer && newCustomer.id) {
        this.customerService.getActive().subscribe(all => {
          this.customers = all;
          this.form.patchValue({ customerId: newCustomer.id });
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
      ? this.invoiceService.update(this.editId!, this.form.value)
      : this.invoiceService.create(this.form.value);

    obs.subscribe({
      next: (inv) => {
        this.snackBar.open(`Invoice ${this.editMode ? 'updated' : 'generated'} successfully`, 'OK', { duration: 3000 });
        this.router.navigate(['/invoices', inv.id]);
      },
      error: (err) => {
        console.error('Update Error:', err);
        this.snackBar.open(`Error ${this.editMode ? 'updating' : 'creating'} invoice: ` + (err.error?.message || err.message || 'Unknown error'), 'OK', { duration: 7000 });
        this.loading = false;
      }
    });
  }
}
