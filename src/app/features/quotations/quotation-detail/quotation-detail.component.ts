import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { QuotationService, Quotation } from '../../../core/services/quotation.service';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="page-container" *ngIf="quotation">
      <!-- Header -->
      <div class="page-header no-print">
        <div>
          <h1 class="detail-title">Quotation #QT-{{ quotation.id }}</h1>
          <p>Created on {{ quotation.createdAt | date:'medium' }}</p>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/quotations">
            <mat-icon>arrow_back</mat-icon> Back
          </a>
          <button mat-stroked-button (click)="print()">
            <mat-icon>print</mat-icon> Print
          </button>
          <a mat-raised-button color="primary" [routerLink]="['/quotations', quotation.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </a>
        </div>
      </div>

      <!-- Printable Area -->
      <div class="print-area">
        <!-- Print Header -->
        <div class="print-header">
          <div class="company-details">
            <img *ngIf="company?.logoUrl" [src]="company?.logoUrl" alt="Logo" class="company-logo-print">
            <h2>{{ company?.companyName || 'Company Name' }}</h2>
            <p>{{ company?.address || '' }}</p>
            <p *ngIf="company?.phone || company?.email">Phone: {{ company?.phone || '' }} | Email: {{ company?.email || '' }}</p>
            <p *ngIf="company?.gstNumber">GST: {{ company?.gstNumber }}</p>
          </div>
          
          <div class="doc-title">
            <h1>Quotation</h1>
            <p class="doc-id">#QT-{{ quotation.id }}</p>
            <p class="doc-date">Date: {{ quotation.createdAt | date:'mediumDate' }}</p>
          </div>
        </div>

        <div class="customer-info-box">
          <p class="label">TO</p>
          <h3>{{ quotation.customer.name }}</h3>
          <p>{{ quotation.customer.address }}</p>
          <p>Phone: {{ quotation.customer.phone }}</p>
          <p *ngIf="quotation.customer.email">Email: {{ quotation.customer.email }}</p>
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>HSN</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">GST %</th>
              <th class="text-right">GST Amt</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of quotation.items; let i = index">
              <td>{{ i + 1 }}</td>
              <td>
                <strong>{{ item.product.name }}</strong>
                <p class="item-desc" *ngIf="item.product.description">{{ item.product.description }}</p>
              </td>
              <td>{{ item.product.hsn || '-' }}</td>
              <td class="text-right">{{ item.quantity }}</td>
              <td class="text-right">Rs. {{ item.rate | number:'1.2-2' }}</td>
              <td class="text-right">{{ item.gstPercentage }}%</td>
              <td class="text-right">Rs. {{ item.gstAmount | number:'1.2-2' }}</td>
              <td class="text-right">Rs. {{ item.totalAmount | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-section">
          <div class="terms-box">
            <div class="term-group" *ngIf="quotation.validityTerms">
              <strong>Validity:</strong>
              <p>{{ quotation.validityTerms }}</p>
            </div>
            <div class="term-group" *ngIf="quotation.paymentTerms">
              <strong>Payment Terms:</strong>
              <p>{{ quotation.paymentTerms }}</p>
            </div>
            <div class="term-group" *ngIf="quotation.specificTerms">
              <strong>Specific Terms:</strong>
              <p>{{ quotation.specificTerms }}</p>
            </div>
          </div>
          <div class="totals-box">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs. {{ quotation.subTotal | number:'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>GST Total:</span>
              <span>Rs. {{ quotation.taxTotal | number:'1.2-2' }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span>Rs. {{ quotation.grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <p>Customer Signature</p>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1000px; margin: 0 auto; background: var(--card-bg); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; }
    .page-header h1 { margin: 0; font-size: 24px; font-weight: 500; }
    .page-header p { margin: 4px 0 0; color: var(--text-secondary); }
    .header-actions { display: flex; gap: 8px; }

    /* Print Styles */
    .print-area { font-family: 'Inter', sans-serif; color: #000; background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 4px; }
    
    .print-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #000; }
    .company-details h2 { font-size: 24px; color: #000 !important; margin: 0 0 4px; }
    .company-details p { color: #333; font-size: 13px; margin: 2px 0; }
    .company-logo-print { max-height: 50px; max-width: 150px; margin-bottom: 6px; }
    
    .doc-title { text-align: right; }
    .doc-title h1 { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; color: #000 !important; margin: 0 0 4px; }
    .doc-id { font-size: 16px; font-weight: 600; margin: 0 0 4px; color: #000 !important; }
    .doc-date { font-size: 14px; color: #666; margin: 0; }

    .customer-info-box { margin-bottom: 24px; }
    .customer-info-box .label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px; }
    .customer-info-box h3 { font-size: 18px; margin: 0 0 4px; color: #000 !important; }
    .customer-info-box p { font-size: 14px; margin: 2px 0; color: #333; }

    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .item-table th, .item-table td { border: 1px solid #ccc; padding: 10px; font-size: 14px; }
    .item-table th { background: #f5f5f5; font-weight: 600; color: #000; text-align: left; }
    .text-right { text-align: right !important; }
    .item-desc { font-size: 12px; color: #666; margin: 4px 0 0; }

    .summary-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .terms-box { flex: 1; padding-right: 40px; }
    .term-group { margin-bottom: 12px; }
    .term-group strong { font-size: 14px; color: #000; }
    .term-group p { font-size: 13px; color: #333; margin: 4px 0 0; white-space: pre-wrap; }
    
    .totals-box { width: 300px; border: 1px solid #ccc; padding: 16px; border-radius: 4px; background: #fafafa; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #333; }
    .total-row.grand-total { border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; font-size: 18px; font-weight: bold; color: #000; }

    .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
    .sig-box { width: 200px; text-align: center; }
    .sig-line { border-bottom: 1px solid #000; margin-bottom: 8px; height: 20px; }
    .sig-box p { font-size: 14px; color: #000; margin: 0; }

    @media print {
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; border: none; }
      .no-print { display: none !important; }
      @page { margin: 1cm; }
    }
  `]
})
export class QuotationDetailComponent implements OnInit {
  quotation?: Quotation;
  company?: CompanyDetails;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: QuotationService,
    private companySvc: CompanyDetailsService
  ) {}

  ngOnInit() {
    this.companySvc.get().subscribe(c => this.company = c);
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.svc.getById(+id).subscribe({
        next: (data) => this.quotation = data,
        error: () => this.router.navigate(['/quotations'])
      });
    }
  }

  print() {
    window.print();
  }
}
