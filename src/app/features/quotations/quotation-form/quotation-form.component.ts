import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuotationService, Quotation } from '../../../core/services/quotation.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { ProductService, Product } from '../../../core/services/product.service';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule,
    MatButtonModule, MatIconModule, MatCardModule, MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ isEdit ? 'Edit Quotation #QT-' + quotationId : 'Create Quotation' }}</h1>
        <a mat-stroked-button routerLink="/quotations"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">
        
        <!-- Customer Details -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Customer Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Customer</mat-label>
              <mat-select formControlName="customer" required>
                <mat-option *ngFor="let c of customers" [value]="c">
                  {{c.name}} ({{c.phone}})
                </mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Line Items -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Line Items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div formArrayName="items" class="items-container">
              <div *ngFor="let itemForm of items.controls; let i = index" [formGroupName]="i" class="item-row">
                
                <mat-form-field appearance="outline" class="flex-3">
                  <mat-label>Product</mat-label>
                  <mat-select formControlName="product" (selectionChange)="onProductSelect(i)" required>
                    <mat-option *ngFor="let p of products" [value]="p">
                      {{p.name}} (Rs. {{p.rate}})
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Qty</mat-label>
                  <input matInput type="number" formControlName="quantity" min="1" (input)="calculateRow(i)" required>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Rate</mat-label>
                  <input matInput type="number" formControlName="rate" (input)="calculateRow(i)" required>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>GST %</mat-label>
                  <input matInput type="number" formControlName="gstPercentage" (input)="calculateRow(i)" required>
                </mat-form-field>

                <div class="calc-cols flex-2">
                  <div class="calc-label">GST Amt: Rs. {{ itemForm.get('gstAmount')?.value | number:'1.2-2' }}</div>
                  <div class="calc-label bold">Total: Rs. {{ itemForm.get('totalAmount')?.value | number:'1.2-2' }}</div>
                </div>

                <button mat-icon-button color="warn" type="button" (click)="removeItem(i)">
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </div>
            </div>

            <button mat-stroked-button color="primary" type="button" (click)="addItem()" class="add-item-btn">
              <mat-icon>add</mat-icon> Add Line Item
            </button>
          </mat-card-content>
        </mat-card>

        <!-- Terms and Summary -->
        <div class="bottom-section">
          <mat-card class="form-card terms-card">
            <mat-card-header><mat-card-title>Terms & Conditions</mat-card-title></mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Validity Terms</mat-label>
                <textarea matInput formControlName="validityTerms" rows="2"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Payment Terms</mat-label>
                <textarea matInput formControlName="paymentTerms" rows="2"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Specific Terms</mat-label>
                <textarea matInput formControlName="specificTerms" rows="2"></textarea>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <mat-card class="form-card summary-card">
            <mat-card-header><mat-card-title>Summary</mat-card-title></mat-card-header>
            <mat-card-content class="summary-details">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>Rs. {{ subTotal | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Tax Total (GST)</span>
                <span>Rs. {{ taxTotal | number:'1.2-2' }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="summary-row grand-total">
                <span>Grand Total</span>
                <span>Rs. {{ grandTotal | number:'1.2-2' }}</span>
              </div>

              <button mat-raised-button color="primary" type="submit" class="save-btn" [disabled]="form.invalid">
                Save Quotation
              </button>
            </mat-card-content>
          </mat-card>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .form-card { margin-bottom: 24px; }
    .full-width { width: 100%; }
    
    .items-container { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
    .item-row { display: flex; gap: 16px; align-items: flex-start; background: var(--hover-color); padding: 16px; border-radius: 8px; }
    .item-row mat-form-field { margin-bottom: -1.25em; }
    
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .flex-3 { flex: 3; }
    
    .calc-cols { display: flex; flex-direction: column; justify-content: center; height: 56px; }
    .calc-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
    .calc-label.bold { font-weight: 600; color: var(--text-color); font-size: 15px; }
    
    .add-item-btn { margin-top: 8px; }
    
    .bottom-section { display: flex; gap: 24px; }
    .terms-card { flex: 2; }
    .summary-card { flex: 1; }
    
    .summary-details { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 16px; }
    .summary-row.grand-total { font-size: 20px; font-weight: 600; margin-top: 8px; }
    .save-btn { width: 100%; margin-top: 24px; padding: 24px 0; font-size: 16px; }
  `]
})
export class QuotationFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  quotationId?: number;

  customers: Customer[] = [];
  products: Product[] = [];

  subTotal = 0;
  taxTotal = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: QuotationService,
    private customerSvc: CustomerService,
    private productSvc: ProductService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      customer: [null, Validators.required],
      validityTerms: ['Valid for 15 Days'],
      paymentTerms: ['100% Advance Payment'],
      specificTerms: ['Items once sold will not be taken back.'],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.customerSvc.getAll().subscribe(c => this.customers = c);
    this.productSvc.getAll().subscribe(p => this.products = p);

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.quotationId = +id;
      this.svc.getById(this.quotationId).subscribe(data => {
        // Need to find the exact customer reference from the dropdown list
        const customerRef = this.customers.find(c => c.id === data.customer.id);
        
        this.form.patchValue({
          customer: customerRef || data.customer,
          validityTerms: data.validityTerms,
          paymentTerms: data.paymentTerms,
          specificTerms: data.specificTerms
        });

        data.items.forEach(item => {
          const productRef = this.products.find(p => p.id === item.product.id) || item.product;
          const fg = this.createItemForm();
          fg.patchValue({
            product: productRef,
            quantity: item.quantity,
            rate: item.rate,
            gstPercentage: item.gstPercentage,
            gstAmount: item.gstAmount,
            totalAmount: item.totalAmount
          });
          this.items.push(fg);
        });
        
        this.calculateTotals();
      });
    } else {
      this.addItem(); // add one empty row by default
    }
  }

  createItemForm(): FormGroup {
    return this.fb.group({
      product: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, Validators.required],
      gstPercentage: [18, Validators.required],
      gstAmount: [0],
      totalAmount: [0]
    });
  }

  addItem() {
    this.items.push(this.createItemForm());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  onProductSelect(index: number) {
    const row = this.items.at(index);
    const product: Product = row.get('product')?.value;
    if (product) {
      row.patchValue({
        rate: product.rate,
        gstPercentage: product.gstPercentage
      });
      this.calculateRow(index);
    }
  }

  calculateRow(index: number) {
    const row = this.items.at(index);
    const qty = row.get('quantity')?.value || 0;
    const rate = row.get('rate')?.value || 0;
    const gstPct = row.get('gstPercentage')?.value || 0;

    const lineSub = qty * rate;
    const gstAmt = (lineSub * gstPct) / 100;
    const total = lineSub + gstAmt;

    row.patchValue({
      gstAmount: gstAmt,
      totalAmount: total
    }, { emitEvent: false });

    this.calculateTotals();
  }

  calculateTotals() {
    this.subTotal = 0;
    this.taxTotal = 0;
    this.grandTotal = 0;

    this.items.controls.forEach(row => {
      const qty = row.get('quantity')?.value || 0;
      const rate = row.get('rate')?.value || 0;
      const gstAmt = row.get('gstAmount')?.value || 0;

      this.subTotal += (qty * rate);
      this.taxTotal += gstAmt;
    });

    this.grandTotal = this.subTotal + this.taxTotal;
  }

  save() {
    if (this.form.invalid || this.items.length === 0) {
      this.snackBar.open('Please fill all required fields and add at least one item', 'OK', { duration: 3000 });
      return;
    }

    const payload = this.form.value;
    const req = this.isEdit 
      ? this.svc.update(this.quotationId!, payload) 
      : this.svc.create(payload);

    req.subscribe({
      next: () => {
        this.snackBar.open('Quotation saved successfully', 'OK', { duration: 3000 });
        this.router.navigate(['/quotations']);
      },
      error: () => this.snackBar.open('Error saving quotation', 'OK', { duration: 3000 })
    });
  }
}
