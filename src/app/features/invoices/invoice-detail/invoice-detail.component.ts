import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SalesInvoiceService } from '../../../core/services/sales-invoice.service';
import { SalesInvoice } from '../../../core/models/sales-invoice.model';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';
import { numberToWords } from '../../../core/utils/number-to-words';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="page-container no-print">
      <div class="page-header">
        <div>
          <h1>Invoice {{ invoice?.invoiceNumber }}</h1>
          <p>Tally-style GST Tax Invoice</p>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/invoices">
            <mat-icon>arrow_back</mat-icon> Back
          </a>
          <button mat-raised-button color="primary" (click)="print()">
            <mat-icon>print</mat-icon> Print Invoice
          </button>
        </div>
      </div>
    </div>

    <div class="print-container" *ngIf="invoice">
      <div class="tally-invoice">
        <div class="header-text text-center" style="position: relative;">
          <span class="badge-status-print" [class.paid]="invoice.status === 'PAID'" [class.unpaid]="invoice.status === 'UNPAID'" style="position: absolute; left: 0; top: 0;">
            {{ invoice.status }}
          </span>
          <strong>Tax Invoice</strong>
          <span class="pull-right">(ORIGINAL FOR RECIPIENT)</span>
        </div>
        
        <table class="main-table">
          <tbody>
            <!-- Header Row -->
            <tr>
              <!-- Left Column: Company & Buyer -->
              <td class="left-col top-left" valign="top">
                <div class="company-section">
                  <div class="logo" *ngIf="company?.logoUrl">
                    <img [src]="company?.logoUrl" alt="Logo">
                  </div>
                  <div class="company-details">
                    <strong class="company-name">{{ company?.companyName || 'Your Company' }}</strong>
                    <div class="address-text">{{ company?.address }}</div>
                    <div class="address-text">Ph-{{ company?.phone }}</div>
                    <div class="address-text">GSTIN/UIN : <strong>{{ company?.gstNumber }}</strong></div>
                    <div class="address-text" *ngIf="company?.state">State Name : {{ company?.state?.name }}, Code : {{ company?.state?.gstCode }}</div>
                  </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="buyer-section" *ngIf="invoice.customer?.shippingAddress; else noShipping">
                  <div class="section-title">Consignee (Ship to)</div>
                  <strong class="buyer-name">{{ invoice.customer?.companyName || invoice.customer?.name }}</strong>
                  <div class="address-text">{{ invoice.customer?.shippingAddress }}</div>
                  <div class="address-text" *ngIf="invoice.customer?.shippingPinCode">PIN: {{ invoice.customer?.shippingPinCode }}</div>
                  <div class="address-text">Ph {{ invoice.customer?.phone }}</div>
                  <div class="address-text" *ngIf="invoice.customer?.gstin">GSTIN/UIN : <strong>{{ invoice.customer?.gstin }}</strong></div>
                  <div class="address-text" *ngIf="invoice.customer?.state">State Name : {{ invoice.customer?.state?.name }}, Code : {{ invoice.customer?.state?.gstCode }}</div>
                </div>

                <ng-template #noShipping>
                  <div class="buyer-section">
                    <div class="section-title">Consignee (Ship to)</div>
                    <strong class="buyer-name">{{ invoice.customer?.companyName || invoice.customer?.name }}</strong>
                    <div class="address-text">{{ invoice.customer?.address }}</div>
                    <div class="address-text" *ngIf="invoice.customer?.pinCode">PIN: {{ invoice.customer?.pinCode }}</div>
                    <div class="address-text">Ph {{ invoice.customer?.phone }}</div>
                    <div class="address-text" *ngIf="invoice.customer?.gstin">GSTIN/UIN : <strong>{{ invoice.customer?.gstin }}</strong></div>
                    <div class="address-text" *ngIf="invoice.customer?.state">State Name : {{ invoice.customer?.state?.name }}, Code : {{ invoice.customer?.state?.gstCode }}</div>
                  </div>
                </ng-template>

                <div class="divider"></div>

                <div class="buyer-section">
                  <div class="section-title">Buyer (Bill to)</div>
                  <strong class="buyer-name">{{ invoice.customer?.companyName || invoice.customer?.name }}</strong>
                  <div class="address-text">{{ invoice.customer?.address }}</div>
                  <div class="address-text" *ngIf="invoice.customer?.pinCode">PIN: {{ invoice.customer?.pinCode }}</div>
                  <div class="address-text">Ph {{ invoice.customer?.phone }}</div>
                  <div class="address-text" *ngIf="invoice.customer?.gstin">GSTIN/UIN : <strong>{{ invoice.customer?.gstin }}</strong></div>
                  <div class="address-text" *ngIf="invoice.customer?.state">State Name : {{ invoice.customer?.state?.name }}, Code : {{ invoice.customer?.state?.gstCode }}</div>
                </div>
              </td>
              
              <!-- Right Column: Meta Data -->
              <td class="right-col top-right" valign="top">
                <table class="meta-table">
                  <tr>
                    <td width="50%">
                      <span class="meta-label">Invoice No.</span>
                      <strong class="meta-value">{{ invoice.invoiceNumber }}</strong>
                    </td>
                    <td width="50%">
                      <span class="meta-label">Dated</span>
                      <strong class="meta-value">{{ invoice.invoiceDate | date:'d-MMM-yyyy' }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="meta-label">Delivery Note</span>
                      <span class="meta-value">{{ invoice.deliveryNote || '&nbsp;' }}</span>
                    </td>
                    <td>
                      <span class="meta-label">Mode/Terms of Payment</span>
                      <strong class="meta-value">{{ invoice.paymentTerms || '&nbsp;' }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="meta-label">Supplier's Ref.</span>
                      <span class="meta-value">{{ invoice.supplierRef || '&nbsp;' }}</span>
                    </td>
                    <td>
                      <span class="meta-label">Sales Type</span>
                      <strong class="meta-value">{{ invoice.salesType || 'CASH' }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="meta-label">Buyer's Order No.</span>
                      <span class="meta-value">{{ invoice.buyerOrderNo || '&nbsp;' }}</span>
                    </td>
                    <td>
                      <span class="meta-label">Dated</span>
                      <span class="meta-value">{{ invoice.buyerOrderDate ? (invoice.buyerOrderDate | date:'d-MMM-yyyy') : '&nbsp;' }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="meta-label">Despatch Document No.</span>
                      <span class="meta-value">{{ invoice.despatchDocumentNo || '&nbsp;' }}</span>
                    </td>
                    <td>
                      <span class="meta-label">Delivery Note Date</span>
                      <span class="meta-value">{{ invoice.deliveryNoteDate ? (invoice.deliveryNoteDate | date:'d-MMM-yyyy') : '&nbsp;' }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="meta-label">Despatched through</span>
                      <span class="meta-value">{{ invoice.despatchedThrough || '&nbsp;' }}</span>
                    </td>
                    <td>
                      <span class="meta-label">Destination</span>
                      <span class="meta-value">{{ invoice.destination || '&nbsp;' }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span class="meta-label">Payment Method</span>
                      <strong class="meta-value">{{ invoice.paymentMethod || 'CASH' }}</strong>
                    </td>
                    <td>
                      <span class="meta-label">Received Amount</span>
                      <strong class="meta-value">Rs. {{ (invoice.receivedAmount || 0) | number:'1.2-2' }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" class="no-border-bottom terms-cell">
                      <span class="meta-label">Terms of Delivery</span>
                      <span class="meta-value">{{ invoice.termsOfDelivery || '&nbsp;' }}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Items Row -->
            <tr>
              <td colspan="2" class="items-td">
                <table class="inner-items-table">
                  <thead>
                    <tr>
                      <th width="5%">Sl<br>No.</th>
                      <th width="45%">Description of Goods and Services</th>
                      <th width="10%">HSN/SAC</th>
                      <th width="10%">Quantity</th>
                      <th width="12%">Rate</th>
                      <th width="6%">per</th>
                      <th width="12%">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of invoice.items; let i = index">
                      <td class="text-center">{{ i + 1 }}</td>
                      <td>
                        <strong>{{ item.description || item.product?.name }}</strong>
                        <div class="gst-text" *ngIf="item.gstPercentage">
                          <span class="italic-text" *ngIf="company?.state?.id !== invoice.customer?.state?.id && invoice.customer?.state; else cgstSgst">
                            IGST &#64; {{ item.gstPercentage }}%
                          </span>
                          <ng-template #cgstSgst>
                            <span class="italic-text">CGST &#64; {{ item.gstPercentage / 2 }}%<br>SGST &#64; {{ item.gstPercentage / 2 }}%</span>
                          </ng-template>
                        </div>
                      </td>
                      <td class="text-center">{{ item.hsn || '&nbsp;' }}</td>
                      <td class="text-center"><strong>{{ item.quantity }} NOS</strong></td>
                      <td class="text-right">{{ item.unitPrice | number:'1.2-2' }}</td>
                      <td class="text-center">NOS</td>
                      <td class="text-right"><strong>{{ item.taxableValue | number:'1.2-2' }}</strong></td>
                    </tr>

                    <!-- Tax Items mapped as rows like Tally -->
                    <tr *ngIf="invoice.totalCgst! > 0">
                      <td></td>
                      <td class="italic-text text-right">CGST</td>
                      <td></td><td></td><td></td><td></td>
                      <td class="text-right"><strong>{{ invoice.totalCgst | number:'1.2-2' }}</strong></td>
                    </tr>
                    <tr *ngIf="invoice.totalSgst! > 0">
                      <td></td>
                      <td class="italic-text text-right">SGST</td>
                      <td></td><td></td><td></td><td></td>
                      <td class="text-right"><strong>{{ invoice.totalSgst | number:'1.2-2' }}</strong></td>
                    </tr>
                    <tr *ngIf="invoice.totalIgst! > 0">
                      <td></td>
                      <td class="italic-text text-right">IGST</td>
                      <td></td><td></td><td></td><td></td>
                      <td class="text-right"><strong>{{ invoice.totalIgst | number:'1.2-2' }}</strong></td>
                    </tr>

                    <!-- Blank Space Filler -->
                    <tr class="filler-row">
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td></td>
                      <td class="text-right">Total</td>
                      <td></td>
                      <td class="text-center"><strong>{{ getTotalQty() }} NOS</strong></td>
                      <td></td>
                      <td></td>
                      <td class="text-right"><strong>₹ {{ invoice.grandTotal | number:'1.2-2' }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>

            <!-- Amount in Words -->
            <tr>
              <td colspan="2" class="amount-words-td">
                <div class="amount-words">
                  Amount Chargeable (in words)<br>
                  <strong>{{ getAmountInWords(invoice.grandTotal || 0) }}</strong>
                  <span class="pull-right italic-text">E. & O.E</span>
                </div>
              </td>
            </tr>

            <!-- Tax Breakup Row -->
            <tr *ngIf="invoice.totalCgst! > 0 || invoice.totalIgst! > 0">
              <td colspan="2" class="tax-td">
                <table class="tax-breakup-table">
                  <thead>
                    <tr>
                      <th rowspan="2" class="text-left">HSN/SAC</th>
                      <th rowspan="2" class="text-right">Taxable<br>Value</th>
                      <th colspan="2" *ngIf="invoice.totalCgst! > 0">Central Tax</th>
                      <th colspan="2" *ngIf="invoice.totalSgst! > 0">State Tax</th>
                      <th colspan="2" *ngIf="invoice.totalIgst! > 0">Integrated Tax</th>
                      <th rowspan="2" class="text-right">Total<br>Tax Amount</th>
                    </tr>
                    <tr>
                      <th *ngIf="invoice.totalCgst! > 0">Rate</th>
                      <th *ngIf="invoice.totalCgst! > 0" class="text-right">Amount</th>
                      <th *ngIf="invoice.totalSgst! > 0">Rate</th>
                      <th *ngIf="invoice.totalSgst! > 0" class="text-right">Amount</th>
                      <th *ngIf="invoice.totalIgst! > 0">Rate</th>
                      <th *ngIf="invoice.totalIgst! > 0" class="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of invoice.items">
                      <td class="text-left">{{ item.hsn || '&nbsp;' }}</td>
                      <td class="text-right">{{ item.taxableValue | number:'1.2-2' }}</td>
                      
                      <td *ngIf="invoice.totalCgst! > 0">{{ (item.gstPercentage || 0)/2 }}%</td>
                      <td class="text-right" *ngIf="invoice.totalCgst! > 0">{{ item.cgstAmount | number:'1.2-2' }}</td>
                      
                      <td *ngIf="invoice.totalSgst! > 0">{{ (item.gstPercentage || 0)/2 }}%</td>
                      <td class="text-right" *ngIf="invoice.totalSgst! > 0">{{ item.sgstAmount | number:'1.2-2' }}</td>
                      
                      <td *ngIf="invoice.totalIgst! > 0">{{ item.gstPercentage }}%</td>
                      <td class="text-right" *ngIf="invoice.totalIgst! > 0">{{ item.igstAmount | number:'1.2-2' }}</td>
                      
                      <td class="text-right">{{ ((item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0)) | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="text-right"><strong>Total</strong></td>
                      <td class="text-right"><strong>{{ invoice.totalTaxableValue | number:'1.2-2' }}</strong></td>
                      
                      <td *ngIf="invoice.totalCgst! > 0"></td>
                      <td class="text-right" *ngIf="invoice.totalCgst! > 0"><strong>{{ invoice.totalCgst | number:'1.2-2' }}</strong></td>
                      
                      <td *ngIf="invoice.totalSgst! > 0"></td>
                      <td class="text-right" *ngIf="invoice.totalSgst! > 0"><strong>{{ invoice.totalSgst | number:'1.2-2' }}</strong></td>
                      
                      <td *ngIf="invoice.totalIgst! > 0"></td>
                      <td class="text-right" *ngIf="invoice.totalIgst! > 0"><strong>{{ invoice.totalIgst | number:'1.2-2' }}</strong></td>
                      
                      <td class="text-right"><strong>{{ ((invoice.totalCgst || 0) + (invoice.totalSgst || 0) + (invoice.totalIgst || 0)) | number:'1.2-2' }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>
            
            <!-- Tax in Words -->
            <tr>
              <td colspan="2" class="amount-words-td">
                Tax Amount (in words) : <strong>{{ getAmountInWords((invoice.totalCgst || 0) + (invoice.totalSgst || 0) + (invoice.totalIgst || 0)) }}</strong>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer-col" valign="bottom">
                <div class="bank-block">
                  Company's Bank Details<br>
                  <table>
                    <tr><td width="100">Bank Name</td><td>: <strong>{{ company?.bankName }}</strong></td></tr>
                    <tr><td>A/c No.</td><td>: <strong>{{ company?.accountNumber }}</strong></td></tr>
                    <tr><td>Branch & IFS Code</td><td>: <strong>{{ company?.branchIfsCode }}</strong></td></tr>
                  </table>
                </div>
                <div class="declaration-block">
                  <u>Declaration</u><br>
                  We declare that this invoice shows the actual price of the<br>
                  goods described and that all particulars are true and<br>
                  correct.
                </div>
              </td>
              <td class="footer-col" valign="top">
                <div class="signature-block">
                  <div class="for-text">for <strong>{{ company?.companyName || 'Your Company' }}</strong></div>
                  <div class="sign-space"></div>
                  <div class="auth-text">Authorised Signatory</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="computer-generated">
          This is a Computer Generated Invoice
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; gap: 12px; }
    
    .print-container {
      background: #e2e8f0;
      padding: 40px;
      display: flex;
      justify-content: center;
    }
    
    .tally-invoice {
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.3;
      box-sizing: border-box;
    }

    .header-text {
      margin-bottom: 5px;
    }
    .header-text strong {
      font-size: 16px;
    }
    .badge-status-print {
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
      border: 1px solid currentColor;
    }
    .badge-status-print.paid {
      color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }
    .badge-status-print.unpaid {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.05);
    }

    table { width: 100%; border-collapse: collapse; }
    
    .main-table { border: 1px solid #000; }
    
    .main-table > tbody > tr > td {
      border: 1px solid #000;
    }

    .left-col { width: 50%; padding: 0; }
    .right-col { width: 50%; padding: 0; }
    
    .company-section { display: flex; padding: 4px 6px; }
    .logo { width: 60px; margin-right: 10px; }
    .logo img { max-width: 100%; height: auto; }
    .company-name { font-size: 14px; font-weight: bold; }
    .address-text { font-size: 10px; }
    
    .divider { border-bottom: 1px solid #000; }
    
    .buyer-section { padding: 4px 6px; }
    .section-title { font-size: 10px; }
    .buyer-name { font-size: 12px; font-weight: bold; display: block; margin-top: 2px; }
    
    .meta-table td {
      border-bottom: 1px solid #000;
      border-right: 1px solid #000;
      padding: 2px 4px;
      height: 28px;
      vertical-align: top;
    }
    .meta-table td:last-child { border-right: none; }
    .no-border-bottom { border-bottom: none !important; }
    .terms-cell { height: 60px; }
    
    .meta-label { display: block; font-size: 9px; margin-bottom: 1px; }
    .meta-value { display: block; font-size: 11px; }

    .items-td { padding: 0 !important; }
    .inner-items-table th {
      border-bottom: 1px solid #000;
      border-right: 1px solid #000;
      padding: 4px;
      font-weight: normal;
      text-align: center;
    }
    .inner-items-table th:last-child { border-right: none; }
    .inner-items-table td {
      border-right: 1px solid #000;
      padding: 4px;
      vertical-align: top;
    }
    .inner-items-table td:last-child { border-right: none; }
    .inner-items-table tfoot td {
      border-top: 1px solid #000;
      padding: 4px;
    }
    
    .filler-row td { height: 150px; } /* Ensures minimum height for items area like tally */
    
    .gst-text { padding-left: 20px; font-size: 10px; margin-top: 4px; }
    
    .amount-words-td { padding: 4px 6px; }
    .tax-td { padding: 0 !important; }
    
    .tax-breakup-table th {
      border-bottom: 1px solid #000;
      border-right: 1px solid #000;
      padding: 4px;
      font-weight: normal;
    }
    .tax-breakup-table th:last-child { border-right: none; }
    .tax-breakup-table td {
      border-right: 1px solid #000;
      padding: 4px;
    }
    .tax-breakup-table td:last-child { border-right: none; }
    .tax-breakup-table tfoot td { border-top: 1px solid #000; }
    
    .footer-col { padding: 4px 6px; }
    
    .bank-block { margin-bottom: 10px; }
    .bank-block table { width: auto; font-size: 10px; }
    .bank-block table td { border: none; padding: 1px; }
    
    .declaration-block { font-size: 10px; line-height: 1.4; margin-bottom: 4px; }
    
    .signature-block { text-align: right; height: 100%; position: relative; }
    .for-text { margin-bottom: 40px; }
    .auth-text { position: absolute; bottom: 0; right: 0; font-weight: normal; }
    
    .computer-generated { text-align: center; font-size: 10px; margin-top: 10px; }
    
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .pull-right { float: right; }
    .italic-text { font-style: italic; }

    @media print {
      .no-print { display: none !important; }
      .print-container { padding: 0; background: #fff; }
      .tally-invoice { padding: 0; }
      @page { size: A4; margin: 10mm; }
    }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  invoice?: SalesInvoice;
  company?: CompanyDetails;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: SalesInvoiceService,
    private companyService: CompanyDetailsService
  ) {}

  ngOnInit() {
    this.companyService.get().subscribe(c => this.company = c);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getById(+id).subscribe(data => this.invoice = data);
    }
  }

  print() {
    window.print();
  }

  getAmountInWords(amount: number): string {
    return numberToWords(amount);
  }

  getTotalQty(): number {
    if (!this.invoice || !this.invoice.items) return 0;
    return this.invoice.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
}
