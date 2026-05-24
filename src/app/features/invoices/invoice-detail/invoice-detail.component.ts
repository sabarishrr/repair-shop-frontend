import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SalesInvoiceService } from '../../../core/services/sales-invoice.service';
import { SalesInvoice } from '../../../core/models/sales-invoice.model';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';
import { numberToWords } from '../../../core/utils/number-to-words';
import { EmailDialogComponent } from '../../../shared/email-dialog/email-dialog.component';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule, MatDialogModule],
  template: `
    <!-- ── ACTION BAR (screen only) ── -->
    <div class="no-print action-bar">
      <div class="ab-left">
        <a mat-stroked-button routerLink="/invoices" class="back-btn">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
        <span class="ab-title">Invoice {{ invoice?.invoiceNumber }}</span>
        <span class="ab-sub">GST Tax Invoice</span>
      </div>
      <div class="ab-right">
        <button mat-stroked-button (click)="sendEmail()" [disabled]="!invoice?.customer?.email" class="email-btn">
          <mat-icon>email</mat-icon> Send Email
        </button>
        <button mat-flat-button class="wa-btn" (click)="sendWhatsApp()" [disabled]="!invoice?.customer?.phone">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14" style="vertical-align:middle;margin-right:4px;flex-shrink:0"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.102 1.518 5.826L0 24l6.336-1.491A11.933 11.933 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.385 14.518c-.295-.147-1.745-.86-2.016-.957-.27-.098-.467-.147-.663.147-.196.295-.76.957-.932 1.154-.172.196-.344.22-.638.074-.295-.147-1.244-.459-2.368-1.462-.875-.78-1.466-1.744-1.637-2.039-.172-.295-.018-.454.129-.6.132-.132.295-.344.442-.517.147-.172.196-.295.295-.491.098-.196.049-.368-.025-.515-.074-.147-.663-1.598-.908-2.187-.239-.574-.483-.496-.663-.505l-.565-.01c-.196 0-.516.074-.786.368-.27.295-1.032 1.008-1.032 2.459s1.057 2.852 1.204 3.048c.147.196 2.08 3.177 5.042 4.457.705.305 1.255.486 1.684.623.708.225 1.352.193 1.861.117.568-.085 1.745-.713 1.991-1.402.245-.688.245-1.277.172-1.402-.074-.123-.27-.196-.565-.344z"/></svg>
          WhatsApp
        </button>
        <button mat-raised-button color="primary" (click)="print()">
          <mat-icon>print</mat-icon> Print Invoice
        </button>
      </div>
    </div>

    <!-- ── INVOICE DOCUMENT (screen preview) ── -->
    <div class="preview-wrap" *ngIf="invoice">
      <div class="inv-doc">

        <!-- HEADER -->
        <div class="inv-hdr">
          <div class="hdr-left">
            <img *ngIf="company?.logoUrl" [src]="company?.logoUrl" class="co-logo" alt="logo">
            <div>
              <div class="co-name">{{ company?.companyName || 'Your Company' }}</div>
              <div class="co-line">{{ company?.address }}</div>
              <div class="co-line">Ph: {{ company?.phone }}<ng-container *ngIf="company?.gstNumber">&nbsp;|&nbsp; GSTIN: <b>{{ company?.gstNumber }}</b></ng-container></div>
              <div class="co-line" *ngIf="company?.state">State: {{ company?.state?.name }}, Code: {{ company?.state?.gstCode }}</div>
            </div>
          </div>
          <div class="hdr-right">
            <div class="inv-ttl">TAX INVOICE</div>
            <div class="inv-orig">ORIGINAL FOR RECIPIENT</div>
            <div class="inv-no">{{ invoice.invoiceNumber }}</div>
            <div class="inv-dt">{{ invoice.invoiceDate | date:'d MMM yyyy' }}</div>
            <span class="s-chip" [class.paid]="invoice.status==='PAID'" [class.unpaid]="invoice.status==='UNPAID'">
              {{ invoice.status }}
            </span>
          </div>
        </div>

        <!-- INFO BAND: 2 columns -->
        <div class="info-band">
          <!-- Left: Party addresses -->
          <div class="party-col">
            <div class="pb-label">📦 Consignee (Ship To)</div>
            <ng-container *ngIf="invoice.customer?.shippingAddress; else shipFallback">
              <div class="pb-name">{{ invoice.customer?.companyName || invoice.customer?.name }}</div>
              <div class="pb-line">{{ invoice.customer?.shippingAddress }}{{ invoice.customer?.shippingPinCode ? ', PIN: ' + invoice.customer?.shippingPinCode : '' }}</div>
              <div class="pb-line">Ph: {{ invoice.customer?.phone }}</div>
              <div class="pb-line" *ngIf="invoice.customer?.gstin">GSTIN: {{ invoice.customer?.gstin }}</div>
              <div class="pb-line" *ngIf="invoice.customer?.state">State: {{ invoice.customer?.state?.name }}, Code: {{ invoice.customer?.state?.gstCode }}</div>
            </ng-container>
            <ng-template #shipFallback>
              <div class="pb-name">{{ invoice.customer?.companyName || invoice.customer?.name }}</div>
              <div class="pb-line">{{ invoice.customer?.address }}{{ invoice.customer?.pinCode ? ', PIN: ' + invoice.customer?.pinCode : '' }}</div>
              <div class="pb-line">Ph: {{ invoice.customer?.phone }}</div>
              <div class="pb-line" *ngIf="invoice.customer?.gstin">GSTIN: {{ invoice.customer?.gstin }}</div>
              <div class="pb-line" *ngIf="invoice.customer?.state">State: {{ invoice.customer?.state?.name }}, Code: {{ invoice.customer?.state?.gstCode }}</div>
            </ng-template>

            <div class="party-sep"></div>

            <div class="pb-label">🧾 Buyer (Bill To)</div>
            <div class="pb-name">{{ invoice.customer?.companyName || invoice.customer?.name }}</div>
            <div class="pb-line">{{ invoice.customer?.address }}{{ invoice.customer?.pinCode ? ', PIN: ' + invoice.customer?.pinCode : '' }}</div>
            <div class="pb-line">Ph: {{ invoice.customer?.phone }}</div>
            <div class="pb-line" *ngIf="invoice.customer?.gstin">GSTIN: {{ invoice.customer?.gstin }}</div>
            <div class="pb-line" *ngIf="invoice.customer?.state">State: {{ invoice.customer?.state?.name }}, Code: {{ invoice.customer?.state?.gstCode }}</div>
          </div>

          <!-- Right: Invoice meta -->
          <div class="meta-col">
            <div class="meta-grid">
              <div class="mf"><span class="mk">Invoice No.</span><span class="mv">{{ invoice.invoiceNumber }}</span></div>
              <div class="mf"><span class="mk">Dated</span><span class="mv">{{ invoice.invoiceDate | date:'d-MMM-yyyy' }}</span></div>
              <div class="mf"><span class="mk">Delivery Note</span><span class="mv">{{ invoice.deliveryNote || '—' }}</span></div>
              <div class="mf"><span class="mk">Payment Terms</span><span class="mv">{{ invoice.paymentTerms || '—' }}</span></div>
              <div class="mf"><span class="mk">Supplier's Ref.</span><span class="mv">{{ invoice.supplierRef || '—' }}</span></div>
              <div class="mf"><span class="mk">Sales Type</span><span class="mv">{{ invoice.salesType || 'CASH' }}</span></div>
              <div class="mf"><span class="mk">Buyer's Order No.</span><span class="mv">{{ invoice.buyerOrderNo || '—' }}</span></div>
              <div class="mf"><span class="mk">Order Dated</span><span class="mv">{{ invoice.buyerOrderDate ? (invoice.buyerOrderDate | date:'d-MMM-yyyy') : '—' }}</span></div>
              <div class="mf"><span class="mk">Despatch Doc No.</span><span class="mv">{{ invoice.despatchDocumentNo || '—' }}</span></div>
              <div class="mf"><span class="mk">Del. Note Date</span><span class="mv">{{ invoice.deliveryNoteDate ? (invoice.deliveryNoteDate | date:'d-MMM-yyyy') : '—' }}</span></div>
              <div class="mf"><span class="mk">Despatched Through</span><span class="mv">{{ invoice.despatchedThrough || '—' }}</span></div>
              <div class="mf"><span class="mk">Destination</span><span class="mv">{{ invoice.destination || '—' }}</span></div>
              <div class="mf"><span class="mk">Payment Method</span><span class="mv accent">{{ invoice.paymentMethod || 'CASH' }}</span></div>
              <div class="mf"><span class="mk">Received Amount</span><span class="mv accent">Rs. {{ (invoice.receivedAmount || 0) | number:'1.2-2' }}</span></div>
              <div class="mf full-span" *ngIf="invoice.termsOfDelivery">
                <span class="mk">Terms of Delivery</span>
                <span class="mv">{{ invoice.termsOfDelivery }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ITEMS TABLE -->
        <div class="it-section">
          <div class="s-head">Items &amp; Services</div>
          <table class="it-table">
            <thead>
              <tr>
                <th class="c-sl">#</th>
                <th class="c-desc tl">Description of Goods &amp; Services</th>
                <th class="c-hsn tc">HSN/SAC</th>
                <th class="c-qty tc">Qty</th>
                <th class="c-rate tr">Rate</th>
                <th class="c-per tc">Per</th>
                <th class="c-amt tr">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of invoice.items; let i = index" class="it-row">
                <td class="tc it-sl">{{ i + 1 }}</td>
                <td>
                  <span class="it-name">{{ item.description || item.product?.name }}</span>
                  <span class="gst-tag" *ngIf="item.gstPercentage">
                    <ng-container *ngIf="company?.state?.id !== invoice.customer?.state?.id && invoice.customer?.state; else cgstSgst">
                      IGST &#64; {{ item.gstPercentage }}%
                    </ng-container>
                    <ng-template #cgstSgst>
                      CGST &#64; {{ item.gstPercentage / 2 }}% &nbsp;|&nbsp; SGST &#64; {{ item.gstPercentage / 2 }}%
                    </ng-template>
                  </span>
                </td>
                <td class="tc">{{ item.hsn || '—' }}</td>
                <td class="tc"><b>{{ item.quantity }} NOS</b></td>
                <td class="tr">{{ item.unitPrice | number:'1.2-2' }}</td>
                <td class="tc">NOS</td>
                <td class="tr"><b>{{ item.taxableValue | number:'1.2-2' }}</b></td>
              </tr>
              <tr *ngIf="invoice.totalCgst! > 0" class="tx-row">
                <td></td><td class="tr tx-lbl">CGST</td><td></td><td></td><td></td><td></td>
                <td class="tr"><b>{{ invoice.totalCgst | number:'1.2-2' }}</b></td>
              </tr>
              <tr *ngIf="invoice.totalSgst! > 0" class="tx-row">
                <td></td><td class="tr tx-lbl">SGST</td><td></td><td></td><td></td><td></td>
                <td class="tr"><b>{{ invoice.totalSgst | number:'1.2-2' }}</b></td>
              </tr>
              <tr *ngIf="invoice.totalIgst! > 0" class="tx-row">
                <td></td><td class="tr tx-lbl">IGST</td><td></td><td></td><td></td><td></td>
                <td class="tr"><b>{{ invoice.totalIgst | number:'1.2-2' }}</b></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="tot-row">
                <td></td>
                <td class="tr tot-lbl">Total</td>
                <td></td>
                <td class="tc"><b>{{ getTotalQty() }} NOS</b></td>
                <td></td><td></td>
                <td class="tr tot-amt">&#8377; {{ invoice.grandTotal | number:'1.2-2' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- AMOUNT IN WORDS -->
        <div class="w-band">
          <div class="w-inner">
            <span class="wl">Amount Chargeable (in words)</span>
            <span class="wt">{{ getAmountInWords(invoice.grandTotal || 0) }}</span>
          </div>
          <span class="eoe">E. &amp; O.E</span>
        </div>

        <!-- TAX BREAKUP -->
        <div class="tx-section" *ngIf="invoice.totalCgst! > 0 || invoice.totalIgst! > 0">
          <div class="s-head">Tax Breakup</div>
          <table class="tx-table">
            <thead>
              <tr>
                <th rowspan="2" class="tl">HSN/SAC</th>
                <th rowspan="2" class="tr">Taxable Value</th>
                <th colspan="2" *ngIf="invoice.totalCgst! > 0">Central Tax</th>
                <th colspan="2" *ngIf="invoice.totalSgst! > 0">State Tax</th>
                <th colspan="2" *ngIf="invoice.totalIgst! > 0">Integrated Tax</th>
                <th rowspan="2" class="tr">Total Tax</th>
              </tr>
              <tr>
                <ng-container *ngIf="invoice.totalCgst! > 0"><th class="tc">Rate</th><th class="tr">Amt</th></ng-container>
                <ng-container *ngIf="invoice.totalSgst! > 0"><th class="tc">Rate</th><th class="tr">Amt</th></ng-container>
                <ng-container *ngIf="invoice.totalIgst! > 0"><th class="tc">Rate</th><th class="tr">Amt</th></ng-container>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of getGroupedHsnRows()">
                <td class="tl">{{ row.hsn }}</td>
                <td class="tr">{{ row.taxableValue | number:'1.2-2' }}</td>
                <ng-container *ngIf="invoice.totalCgst! > 0">
                  <td class="tc">{{ row.gstRate / 2 }}%</td>
                  <td class="tr">{{ row.cgstAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container *ngIf="invoice.totalSgst! > 0">
                  <td class="tc">{{ row.gstRate / 2 }}%</td>
                  <td class="tr">{{ row.sgstAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container *ngIf="invoice.totalIgst! > 0">
                  <td class="tc">{{ row.gstRate }}%</td>
                  <td class="tr">{{ row.igstAmount | number:'1.2-2' }}</td>
                </ng-container>
                <td class="tr">{{ (row.cgstAmount + row.sgstAmount + row.igstAmount) | number:'1.2-2' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="tr"><b>Total</b></td>
                <td class="tr"><b>{{ invoice.totalTaxableValue | number:'1.2-2' }}</b></td>
                <ng-container *ngIf="invoice.totalCgst! > 0"><td></td><td class="tr"><b>{{ invoice.totalCgst | number:'1.2-2' }}</b></td></ng-container>
                <ng-container *ngIf="invoice.totalSgst! > 0"><td></td><td class="tr"><b>{{ invoice.totalSgst | number:'1.2-2' }}</b></td></ng-container>
                <ng-container *ngIf="invoice.totalIgst! > 0"><td></td><td class="tr"><b>{{ invoice.totalIgst | number:'1.2-2' }}</b></td></ng-container>
                <td class="tr"><b>{{ ((invoice.totalCgst || 0) + (invoice.totalSgst || 0) + (invoice.totalIgst || 0)) | number:'1.2-2' }}</b></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- TAX IN WORDS -->
        <div class="w-band" *ngIf="invoice.totalCgst! > 0 || invoice.totalIgst! > 0">
          <div class="w-inner">
            <span class="wl">Tax Amount (in words)</span>
            <span class="wt">{{ getAmountInWords((invoice.totalCgst || 0) + (invoice.totalSgst || 0) + (invoice.totalIgst || 0)) }}</span>
          </div>
        </div>

        <!-- FOOTER: 3 columns -->
        <div class="ft-band">
          <div class="ft-bank">
            <div class="ft-title">Company's Bank Details</div>
            <div class="bk-row" *ngIf="company?.bankName"><span>Bank Name</span><b>{{ company?.bankName }}</b></div>
            <div class="bk-row" *ngIf="company?.accountNumber"><span>A/c No.</span><b>{{ company?.accountNumber }}</b></div>
            <div class="bk-row" *ngIf="company?.branchIfsCode"><span>Branch &amp; IFSC</span><b>{{ company?.branchIfsCode }}</b></div>
          </div>
          <div class="ft-decl">
            <div class="ft-title">Declaration</div>
            <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
          </div>
          <div class="ft-sig">
            <img [src]="getUpiQrUrl(invoice, company)" class="qr-img" alt="QR">
            <div class="qr-lbl" *ngIf="company?.upiId">Scan &amp; Pay · {{ company?.upiId }}</div>
            <div class="sig-for">For <b>{{ company?.companyName }}</b></div>
            <div class="sig-line"></div>
            <div class="sig-auth">Authorised Signatory</div>
          </div>
        </div>

        <!-- CG FOOTER -->
        <div class="cg-foot">This is a Computer Generated Invoice</div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Action Bar ── */
    .action-bar { display:flex; align-items:center; justify-content:space-between; padding:12px 22px;
      background:var(--mat-app-background-color,#0f172a); border-bottom:1px solid rgba(255,255,255,.06); flex-wrap:wrap; gap:10px; }
    .ab-left  { display:flex; align-items:center; gap:12px; }
    .ab-right { display:flex; align-items:center; gap:8px; }
    .back-btn  { color:#94a3b8 !important; border-color:#334155 !important; }
    .ab-title  { font-family:'Inter',sans-serif; font-size:15px; font-weight:700; color:#f1f5f9; }
    .ab-sub    { font-size:11px; color:#64748b; }
    .wa-btn    { background:#25d366 !important; color:#fff !important; }
    .email-btn { color:#7c3aed !important; border-color:#7c3aed !important; }

    /* ── Preview wrapper ── */
    .preview-wrap { background:linear-gradient(135deg,#eef2ff,#faf5ff,#f0fdf4); padding:28px 16px; display:flex; justify-content:center; min-height:100vh; }
    .inv-doc { background:#fff; width:210mm; border-radius:14px;
      box-shadow:0 20px 60px rgba(37,99,235,.12),0 6px 20px rgba(0,0,0,.07);
      font-family:'Inter',Arial,sans-serif; font-size:11px; color:#1e293b; line-height:1.4; overflow:hidden; }

    /* ── HEADER ── */
    .inv-hdr { background:linear-gradient(135deg,#1e40af,#2563eb 50%,#3b82f6 75%,#818cf8) !important;
      padding:14px 20px; display:flex; justify-content:space-between; align-items:flex-start; color:#fff; }
    .hdr-left { display:flex; align-items:flex-start; gap:12px; }
    .co-logo  { width:48px; height:48px; border-radius:9px; object-fit:contain; background:rgba(255,255,255,.12); padding:3px; border:1.5px solid rgba(255,255,255,.3); flex-shrink:0; }
    .co-name  { font-size:16px; font-weight:800; color:#fff; margin-bottom:3px; }
    .co-line  { font-size:9.5px; color:rgba(255,255,255,.85); line-height:1.6; }
    .hdr-right { text-align:right; }
    .inv-ttl  { font-size:19px; font-weight:800; letter-spacing:3px; color:#fff; text-transform:uppercase; line-height:1; }
    .inv-orig { font-size:8px; color:rgba(255,255,255,.6); letter-spacing:1px; text-transform:uppercase; margin-bottom:6px; }
    .inv-no   { font-size:14px; font-weight:700; color:#fbbf24; }
    .inv-dt   { font-size:10px; color:rgba(255,255,255,.9); margin-bottom:5px; }
    .s-chip   { display:inline-block; padding:2px 11px; border-radius:20px; font-size:8px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; }
    .s-chip.paid   { background:#10b981; color:#fff; }
    .s-chip.unpaid { background:#f59e0b; color:#fff; }

    /* ── INFO BAND ── */
    .info-band { display:grid; grid-template-columns:40% 60%; border-bottom:2px solid #f1f5f9; }
    .party-col { padding:10px 12px; border-right:1px solid #f1f5f9; }
    .meta-col  { padding:10px 12px; background:#fafbff; }
    .pb-label  { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#7c3aed; margin-bottom:3px; }
    .pb-name   { font-size:11px; font-weight:700; color:#0f172a; margin-bottom:2px; }
    .pb-line   { font-size:9px; color:#64748b; line-height:1.55; }
    .party-sep { border-bottom:1px dashed #e2e8f0; margin:8px 0; }

    .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:3px 10px; }
    .mf        { display:flex; flex-direction:column; }
    .mf.full-span { grid-column:1/-1; }
    .mk { font-size:7px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
    .mv { font-size:9.5px; font-weight:500; color:#1e293b; }
    .mv.accent { color:#2563eb; font-weight:700; }

    /* ── ITEMS TABLE ── */
    .it-section { padding:10px 12px 0; }
    .tx-section { padding:0 12px; }
    .s-head { font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:1.2px; color:#7c3aed;
      margin-bottom:6px; padding-bottom:4px; border-bottom:2px solid #ede9fe; }

    table { width:100%; border-collapse:collapse; }
    .it-table thead tr { background:linear-gradient(90deg,#1e40af,#2563eb) !important; color:#fff; }
    .it-table thead th { padding:7px 6px; font-weight:600; font-size:9px; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; }
    .it-row td { padding:6px 6px; vertical-align:top; border-bottom:1px solid #f1f5f9; }
    .it-row:nth-child(even) td { background:#fafbff; }
    .it-sl   { color:#94a3b8; font-size:9px; text-align:center; }
    .it-name { display:block; font-weight:600; color:#0f172a; margin-bottom:2px; }
    .gst-tag { display:inline-block; font-size:8px; color:#7c3aed; background:#ede9fe; border-radius:3px; padding:0 5px; font-style:italic; font-weight:500; }
    .tx-row td { padding:3px 6px; font-size:9px; color:#64748b; font-style:italic; border-bottom:1px solid #f1f5f9; }
    .tx-lbl  { font-weight:700; color:#1e3a5f; }
    .it-table tfoot .tot-row td { padding:7px 6px; font-weight:700; background:linear-gradient(90deg,#f0f4ff,#faf5ff) !important; border-top:2px solid #2563eb; }
    .tot-lbl { color:#1e3a5f; font-size:11px; }
    .tot-amt { font-size:14px; color:#2563eb; font-weight:800; }

    .c-sl   { width:4%;  text-align:center; }
    .c-desc { width:38%; text-align:left; }
    .c-hsn  { width:10%; text-align:center; }
    .c-qty  { width:10%; text-align:center; }
    .c-rate { width:12%; text-align:right; }
    .c-per  { width:6%;  text-align:center; }
    .c-amt  { width:12%; text-align:right; }

    /* ── WORDS BAND ── */
    .w-band  { margin:7px 12px; background:linear-gradient(120deg,#ede9fe,#dbeafe) !important; border-radius:7px;
               padding:7px 12px; display:flex; justify-content:space-between; align-items:center; }
    .w-inner { display:flex; flex-direction:column; gap:1px; }
    .wl { font-size:7.5px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:.8px; }
    .wt { font-size:10px; font-weight:600; color:#0f172a; }
    .eoe { font-size:9px; font-style:italic; color:#94a3b8; }

    /* ── TAX TABLE ── */
    .tx-table thead tr:first-child { background:#1e40af !important; color:#fff; }
    .tx-table thead tr:last-child  { background:#2563eb !important; color:#fff; }
    .tx-table thead th { padding:5px 6px; font-weight:600; font-size:8.5px; text-transform:uppercase; letter-spacing:.4px; text-align:center; }
    .tx-table tbody td { padding:5px 6px; border-bottom:1px solid #f1f5f9; color:#334155; }
    .tx-table tfoot td { padding:6px 6px; font-weight:700; background:#f0f4ff !important; border-top:1.5px solid #2563eb; }

    /* ── FOOTER ── */
    .ft-band { display:grid; grid-template-columns:1fr 1fr 135px; gap:0; border-top:1.5px solid #e2e8f0; margin:8px 12px 0; padding-top:8px; }
    .ft-bank, .ft-decl, .ft-sig { padding:0 8px; }
    .ft-bank { border-right:1px solid #e2e8f0; padding-left:0; }
    .ft-sig  { border-left:1px solid #e2e8f0; padding-right:0; text-align:center; display:flex; flex-direction:column; align-items:center; }
    .ft-title { font-size:7.5px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:.8px; margin-bottom:4px; }
    .bk-row  { display:flex; gap:6px; font-size:9px; line-height:1.75; }
    .bk-row span { color:#64748b; min-width:80px; flex-shrink:0; }
    .bk-row b    { color:#0f172a; }
    .ft-decl p   { font-size:9px; color:#64748b; line-height:1.55; margin:0; }
    .qr-img  { width:60px; height:60px; border-radius:6px; border:1.5px solid #e2e8f0; padding:2px; background:#fff; display:block; margin:0 auto 3px; }
    .qr-lbl  { font-size:7px; color:#7c3aed; font-weight:600; margin-bottom:4px; word-break:break-all; }
    .sig-for { font-size:8.5px; color:#475569; margin-top:2px; margin-bottom:16px; }
    .sig-line{ height:18px; border-bottom:1px solid #cbd5e1; width:90px; margin:0 auto 3px; }
    .sig-auth{ font-size:7.5px; color:#64748b; }

    /* ── CG FOOTER ── */
    .cg-foot { margin-top:8px; text-align:center; font-size:8px; font-weight:600; color:#fff;
      background:linear-gradient(90deg,#2563eb,#3b82f6 55%,#818cf8) !important; padding:5px; letter-spacing:1.2px; text-transform:uppercase; }

    /* ── Utilities ── */
    .tc { text-align:center !important; }
    .tr { text-align:right  !important; }
    .tl { text-align:left   !important; }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  invoice?: SalesInvoice;
  company?: CompanyDetails;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: SalesInvoiceService,
    private companyService: CompanyDetailsService,
    private dialog: MatDialog,
    private whatsapp: WhatsAppService
  ) {}

  ngOnInit() {
    this.companyService.get().subscribe(c => this.company = c);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.invoiceService.getById(+id).subscribe(data => this.invoice = data);
  }

  sendEmail(): void {
    if (!this.invoice) return;
    this.dialog.open(EmailDialogComponent, {
      data: {
        toEmail: this.invoice.customer?.email || '',
        subject: `Invoice ${this.invoice.invoiceNumber} from ${this.company?.companyName || 'Us'}`,
        message: `Dear ${this.invoice.customer?.name || 'Customer'},\n\nPlease find attached your invoice ${this.invoice.invoiceNumber}.\n\nThank you for your business!`,
        documentType: 'INVOICE',
        documentId: this.invoice.id!,
        documentLabel: `Invoice ${this.invoice.invoiceNumber}`
      },
      width: '620px'
    });
  }

  sendWhatsApp(): void {
    if (!this.invoice?.customer?.phone) return;
    this.whatsapp.sendInvoice(
      this.invoice.customer.phone,
      this.invoice.customer.name || 'Customer',
      this.invoice.invoiceNumber!,
      this.invoice.grandTotal ?? 0,
      this.company?.companyName || 'Us'
    );
  }

  getUpiQrUrl(invoice: SalesInvoice, company?: CompanyDetails): string {
    if (!invoice) return '';
    if (company?.upiId) {
      const upiUrl = `upi://pay?pa=${encodeURIComponent(company.upiId)}&pn=${encodeURIComponent(company.companyName || 'Shop')}&am=${invoice.grandTotal ?? 0}&cu=INR&tn=${encodeURIComponent(invoice.invoiceNumber || 'Invoice')}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff`;
    }
    const info = `Invoice:${invoice.invoiceNumber}|Customer:${invoice.customer?.name}|Amt:${invoice.grandTotal}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(info)}&bgcolor=ffffff`;
  }

  /* ─────────────────────────────────────────
     PRINT — builds fresh HTML from TS data.
     No Angular clone → no encapsulation issue,
     no hidden nodes, guaranteed A4 fit.
  ───────────────────────────────────────── */
  print(): void {
    if (!this.invoice) return;
    const html = this.buildPrintDoc();
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 900);
  }

  private buildPrintDoc(): string {
    const inv  = this.invoice!;
    const co   = this.company;
    const N    = (n?: number | null) => (n ?? 0).toFixed(2);
    const D    = (d?: string | Date | null) => {
      if (!d) return '&mdash;';
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const H    = (s?: string | null) => s || '&mdash;';

    const cgst = inv.totalCgst  || 0;
    const sgst = inv.totalSgst  || 0;
    const igst = inv.totalIgst  || 0;
    const showTax = cgst > 0 || igst > 0;
    const isIGST  = (co?.state?.id !== inv.customer?.state?.id) && !!inv.customer?.state;

    /* ── Items rows ── */
    const itemRows = (inv.items || []).map((item, i) => {
      const gstLbl = item.gstPercentage
        ? (isIGST
            ? `IGST @ ${item.gstPercentage}%`
            : `CGST @ ${item.gstPercentage / 2}%&nbsp;&nbsp;|&nbsp;&nbsp;SGST @ ${item.gstPercentage / 2}%`)
        : '';
      return `<tr class="ir">
        <td class="tc sn">${i + 1}</td>
        <td><span class="nm">${item.description || item.product?.name || ''}</span>${gstLbl ? `<span class="gt">${gstLbl}</span>` : ''}</td>
        <td class="tc">${item.hsn || '&mdash;'}</td>
        <td class="tc"><b>${item.quantity} NOS</b></td>
        <td class="tr">${N(item.unitPrice)}</td>
        <td class="tc">NOS</td>
        <td class="tr"><b>${N(item.taxableValue)}</b></td>
      </tr>`;
    }).join('');

    const taxLines = [
      cgst > 0 ? `<tr class="txr"><td></td><td class="tr txl">CGST</td><td></td><td></td><td></td><td></td><td class="tr"><b>${N(cgst)}</b></td></tr>` : '',
      sgst > 0 ? `<tr class="txr"><td></td><td class="tr txl">SGST</td><td></td><td></td><td></td><td></td><td class="tr"><b>${N(sgst)}</b></td></tr>` : '',
      igst > 0 ? `<tr class="txr"><td></td><td class="tr txl">IGST</td><td></td><td></td><td></td><td></td><td class="tr"><b>${N(igst)}</b></td></tr>` : '',
    ].join('');

    const totalQty = (inv.items || []).reduce((s, it) => s + (it.quantity || 0), 0);

    /* ── Tax breakup ── */
    const grouped = this.getGroupedHsnRows();
    const hsnRows = grouped.map(row => {
      let c = `<td>${row.hsn}</td><td class="tr">${N(row.taxableValue)}</td>`;
      if (cgst > 0) c += `<td class="tc">${row.gstRate / 2}%</td><td class="tr">${N(row.cgstAmount)}</td>`;
      if (sgst > 0) c += `<td class="tc">${row.gstRate / 2}%</td><td class="tr">${N(row.sgstAmount)}</td>`;
      if (igst > 0) c += `<td class="tc">${row.gstRate}%</td><td class="tr">${N(row.igstAmount)}</td>`;
      c += `<td class="tr">${N(row.cgstAmount + row.sgstAmount + row.igstAmount)}</td>`;
      return `<tr>${c}</tr>`;
    }).join('');

    let hsnFoot = `<td><b>Total</b></td><td class="tr"><b>${N(inv.totalTaxableValue)}</b></td>`;
    if (cgst > 0) hsnFoot += `<td></td><td class="tr"><b>${N(cgst)}</b></td>`;
    if (sgst > 0) hsnFoot += `<td></td><td class="tr"><b>${N(sgst)}</b></td>`;
    if (igst > 0) hsnFoot += `<td></td><td class="tr"><b>${N(igst)}</b></td>`;
    hsnFoot += `<td class="tr"><b>${N(cgst + sgst + igst)}</b></td>`;

    let txHead1 = `<th rowspan="2" class="tl">HSN/SAC</th><th rowspan="2" class="tr">Taxable Value</th>`;
    if (cgst > 0) txHead1 += `<th colspan="2">Central Tax</th>`;
    if (sgst > 0) txHead1 += `<th colspan="2">State Tax</th>`;
    if (igst > 0) txHead1 += `<th colspan="2">Integrated Tax</th>`;
    txHead1 += `<th rowspan="2" class="tr">Total Tax</th>`;

    let txHead2 = '';
    if (cgst > 0) txHead2 += `<th class="tc">Rate</th><th class="tr">Amt</th>`;
    if (sgst > 0) txHead2 += `<th class="tc">Rate</th><th class="tr">Amt</th>`;
    if (igst > 0) txHead2 += `<th class="tc">Rate</th><th class="tr">Amt</th>`;

    /* ── Customer addresses ── */
    const cu = inv.customer;
    const hasDiffShip = cu?.shippingAddress && cu.shippingAddress !== cu.address;
    const addrLines = (name: string, addr: string, pin: string, phone: string, gstin: string, state: string) =>
      `<div class="pan">${name}</div>
       <div class="pal">${addr}${pin ? ', PIN: ' + pin : ''}</div>
       ${phone ? `<div class="pal">Ph: ${phone}</div>` : ''}
       ${gstin ? `<div class="pal">GSTIN: ${gstin}</div>` : ''}
       ${state ? `<div class="pal">${state}</div>` : ''}`;

    const shipBlock = hasDiffShip
      ? `<div class="pb">
           <div class="pbl">CONSIGNEE (SHIP TO)</div>
           ${addrLines(
              cu?.companyName || cu?.name || '',
              cu?.shippingAddress || '',
              cu?.shippingPinCode || '',
              cu?.phone || '',
              cu?.gstin || '',
              cu?.state ? `State: ${cu.state.name}, Code: ${cu.state.gstCode}` : ''
           )}
         </div><div class="pbsep"></div>`
      : `<div class="pb">
           <div class="pbl">CONSIGNEE (SHIP TO)</div>
           ${addrLines(
              cu?.companyName || cu?.name || '',
              cu?.address || '',
              cu?.pinCode || '',
              cu?.phone || '',
              cu?.gstin || '',
              cu?.state ? `State: ${cu.state.name}, Code: ${cu.state.gstCode}` : ''
           )}
         </div><div class="pbsep"></div>`;

    const billBlock = `<div class="pb">
      <div class="pbl">BUYER (BILL TO)</div>
      ${addrLines(
        cu?.companyName || cu?.name || '',
        cu?.address || '',
        cu?.pinCode || '',
        cu?.phone || '',
        cu?.gstin || '',
        cu?.state ? `State: ${cu.state.name}, Code: ${cu.state.gstCode}` : ''
      )}
    </div>`;

    /* ── Meta fields ── */
    const mf = (k: string, v: string, accent = false) =>
      v && v !== '&mdash;'
        ? `<div class="mf"><span class="mk">${k}</span><span class="mv${accent ? ' ma' : ''}">${v}</span></div>`
        : '';

    const metaHTML = `
      ${mf('Invoice No.', H(inv.invoiceNumber))}
      ${mf('Dated', D(inv.invoiceDate))}
      ${mf('Delivery Note', H(inv.deliveryNote))}
      ${mf('Payment Terms', H(inv.paymentTerms))}
      ${mf("Supplier's Ref.", H(inv.supplierRef))}
      ${mf('Sales Type', H(inv.salesType || 'CASH'))}
      ${mf("Buyer's Order No.", H(inv.buyerOrderNo))}
      ${mf('Order Dated', D(inv.buyerOrderDate))}
      ${mf('Despatch Doc No.', H(inv.despatchDocumentNo))}
      ${mf('Del. Note Date', D(inv.deliveryNoteDate))}
      ${mf('Despatched Through', H(inv.despatchedThrough))}
      ${mf('Destination', H(inv.destination))}
      ${mf('Payment Method', H(inv.paymentMethod || 'CASH'), true)}
      ${inv.receivedAmount ? mf('Received Amount', `Rs. ${N(inv.receivedAmount)}`, true) : ''}
      ${inv.termsOfDelivery ? `<div class="mf full"><span class="mk">Terms of Delivery</span><span class="mv">${inv.termsOfDelivery}</span></div>` : ''}`;

    /* ── QR URL ── */
    const qrUrl = co?.upiId
      ? `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`upi://pay?pa=${co.upiId}&pn=${co.companyName || ''}&am=${inv.grandTotal || 0}&cu=INR&tn=${inv.invoiceNumber || ''}`)}&bgcolor=ffffff`
      : `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`Invoice:${inv.invoiceNumber}|Amt:${inv.grandTotal}`)}&bgcolor=ffffff`;

    /* ── Bank block ── */
    const bankHTML = co?.bankName
      ? `<div class="fbt">Company's Bank Details</div>
         <div class="br"><span>Bank Name</span><b>${co.bankName}</b></div>
         <div class="br"><span>A/c No.</span><b>${co.accountNumber || ''}</b></div>
         <div class="br"><span>Branch &amp; IFSC</span><b>${co.branchIfsCode || ''}</b></div>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Invoice ${inv.invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{size:A4 portrait;margin:7mm}
  html,body{margin:0;padding:0;background:#fff;font-family:'Inter',Arial,sans-serif;font-size:8.5px;color:#1e293b}

  /* HEADER */
  .hdr{background:linear-gradient(135deg,#1e40af,#2563eb 50%,#3b82f6 75%,#818cf8)!important;
       padding:9px 14px;display:flex;justify-content:space-between;align-items:flex-start;color:#fff}
  .hl{display:flex;align-items:flex-start;gap:10px}
  .lg{width:40px;height:40px;border-radius:7px;object-fit:contain;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);padding:2px;flex-shrink:0}
  .cn{font-size:13px;font-weight:800;color:#fff;margin-bottom:2px}
  .cl{font-size:7.5px;color:rgba(255,255,255,.85);line-height:1.5}
  .hr{text-align:right}
  .ht{font-size:16px;font-weight:800;letter-spacing:2.5px;color:#fff;text-transform:uppercase;line-height:1}
  .ho{font-size:6.5px;color:rgba(255,255,255,.6);letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px}
  .hn{font-size:12px;font-weight:700;color:#fbbf24}
  .hd{font-size:8.5px;color:rgba(255,255,255,.9);margin-bottom:3px}
  .sc{display:inline-block;padding:2px 9px;border-radius:20px;font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
  .sc.paid{background:#10b981;color:#fff}.sc.unpaid{background:#f59e0b;color:#fff}

  /* INFO BAND */
  .ib{display:grid;grid-template-columns:38% 62%;border-bottom:1.5px solid #e2e8f0}
  .pc{padding:8px 10px;border-right:1px solid #e2e8f0}
  .mc{padding:8px 10px;background:#fafbff}
  .pb{margin-bottom:3px}
  .pbl{font-size:6.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#7c3aed;margin-bottom:2px}
  .pan{font-size:9.5px;font-weight:700;color:#0f172a;margin-bottom:1px}
  .pal{font-size:7.5px;color:#64748b;line-height:1.5}
  .pbsep{border-bottom:1px dashed #e2e8f0;margin:5px 0}
  .mfg{display:grid;grid-template-columns:1fr 1fr;gap:2px 8px}
  .mf{display:flex;flex-direction:column}.mf.full{grid-column:1/-1}
  .mk{font-size:6px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
  .mv{font-size:8px;font-weight:500;color:#1e293b}.ma{color:#2563eb;font-weight:700}

  /* ITEMS */
  .is{padding:7px 10px 0}.ts{padding:0 10px}
  .sh{font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#7c3aed;
      margin-bottom:4px;padding-bottom:3px;border-bottom:1.5px solid #ede9fe}
  table{width:100%;border-collapse:collapse}
  .it thead tr{background:linear-gradient(90deg,#1e40af,#2563eb)!important;color:#fff}
  .it thead th{padding:5px 5px;font-weight:600;font-size:7.5px;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap}
  .ir td{padding:4.5px 5px;vertical-align:top;border-bottom:1px solid #f1f5f9;font-size:8.5px}
  .ir:nth-child(even) td{background:#fafbff}
  .sn{color:#94a3b8;font-size:7.5px;text-align:center}
  .nm{display:block;font-weight:600;color:#0f172a;margin-bottom:1px}
  .gt{display:inline-block;font-size:7px;color:#7c3aed;background:#ede9fe;border-radius:3px;padding:0 4px;font-style:italic}
  .txr td{padding:2.5px 5px;font-size:8px;color:#64748b;font-style:italic;border-bottom:1px solid #f1f5f9}
  .txl{font-weight:700;color:#1e3a5f;text-align:right!important}
  .it tfoot tr td{padding:5.5px 5px;font-weight:700;background:linear-gradient(90deg,#f0f4ff,#faf5ff)!important;border-top:2px solid #2563eb}
  .tl-v{color:#1e3a5f;font-size:9.5px}.ta-v{font-size:11.5px;color:#2563eb;font-weight:800}
  /* cols */
  .c1{width:4%;text-align:center}.c2{width:37%;text-align:left}.c3{width:10%;text-align:center}
  .c4{width:10%;text-align:center}.c5{width:12%;text-align:right}.c6{width:6%;text-align:center}.c7{width:12%;text-align:right}

  /* WORDS */
  .wb{margin:5px 10px;background:linear-gradient(120deg,#ede9fe,#dbeafe)!important;border-radius:6px;
      padding:5px 10px;display:flex;justify-content:space-between;align-items:center}
  .wi{display:flex;flex-direction:column}
  .wl{font-size:6.5px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:.7px}
  .wt{font-size:8.5px;font-weight:600;color:#0f172a}
  .eo{font-size:7.5px;font-style:italic;color:#94a3b8}

  /* TAX TABLE */
  .tx thead tr:first-child{background:#1e40af!important;color:#fff}
  .tx thead tr:last-child{background:#2563eb!important;color:#fff}
  .tx thead th{padding:3.5px 5px;font-weight:600;font-size:7px;text-transform:uppercase;text-align:center}
  .tx tbody td{padding:3.5px 5px;border-bottom:1px solid #f1f5f9;font-size:8px;color:#334155}
  .tx tfoot td{padding:4px 5px;font-weight:700;background:#f0f4ff!important;border-top:1.5px solid #2563eb;font-size:8px}

  /* FOOTER 3-col */
  .ft{display:grid;grid-template-columns:1fr 1fr 125px;border-top:1.5px solid #e2e8f0;margin:6px 10px 0;padding-top:7px}
  .fb{border-right:1px solid #e2e8f0;padding-right:8px}
  .fd{padding:0 8px}
  .fs{border-left:1px solid #e2e8f0;padding-left:8px;text-align:center;display:flex;flex-direction:column;align-items:center}
  .fbt{font-size:6.5px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}
  .br{display:flex;gap:5px;font-size:8px;line-height:1.7}
  .br span{color:#64748b;min-width:72px;flex-shrink:0}
  .br b{color:#0f172a}
  .decl{font-size:7.5px;color:#64748b;line-height:1.5;margin:0}
  .qi{width:54px;height:54px;border-radius:5px;border:1.5px solid #e2e8f0;padding:2px;background:#fff;display:block;margin:0 auto 2px}
  .ql{font-size:6.5px;font-weight:700;color:#7c3aed;margin-bottom:3px;word-break:break-all}
  .sf{font-size:8px;color:#475569;margin-bottom:13px}
  .sl{height:16px;border-bottom:1px solid #cbd5e1;width:80px;margin:0 auto 2px}
  .sa{font-size:7px;color:#64748b}

  /* CG FOOTER */
  .cg{margin-top:6px;text-align:center;font-size:7px;font-weight:600;color:#fff;
      background:linear-gradient(90deg,#2563eb,#3b82f6 55%,#818cf8)!important;
      padding:4.5px;letter-spacing:1.2px;text-transform:uppercase}

  .tc{text-align:center!important}.tr{text-align:right!important}.tl{text-align:left!important}
</style>
</head>
<body>

<!-- HEADER -->
<div class="hdr">
  <div class="hl">
    ${co?.logoUrl ? `<img src="${co.logoUrl}" class="lg" alt="logo">` : ''}
    <div>
      <div class="cn">${co?.companyName || 'Your Company'}</div>
      <div class="cl">${co?.address || ''}</div>
      <div class="cl">Ph: ${co?.phone || ''}${co?.gstNumber ? `&nbsp;|&nbsp;GSTIN: <b>${co.gstNumber}</b>` : ''}</div>
      ${co?.state ? `<div class="cl">State: ${co.state.name}, Code: ${co.state.gstCode}</div>` : ''}
    </div>
  </div>
  <div class="hr">
    <div class="ht">TAX INVOICE</div>
    <div class="ho">ORIGINAL FOR RECIPIENT</div>
    <div class="hn">${inv.invoiceNumber || ''}</div>
    <div class="hd">${D(inv.invoiceDate)}</div>
    <span class="sc ${(inv.status || '').toLowerCase()}">${inv.status || ''}</span>
  </div>
</div>

<!-- INFO BAND -->
<div class="ib">
  <div class="pc">
    ${shipBlock}
    ${billBlock}
  </div>
  <div class="mc">
    <div class="mfg">
      ${metaHTML}
    </div>
  </div>
</div>

<!-- ITEMS TABLE -->
<div class="is">
  <div class="sh">Items &amp; Services</div>
  <table class="it">
    <thead>
      <tr>
        <th class="c1">#</th>
        <th class="c2 tl">Description of Goods &amp; Services</th>
        <th class="c3">HSN/SAC</th>
        <th class="c4">Qty</th>
        <th class="c5">Rate</th>
        <th class="c6">Per</th>
        <th class="c7">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      ${taxLines}
    </tbody>
    <tfoot>
      <tr>
        <td></td>
        <td class="tr tl-v">Total</td>
        <td></td>
        <td class="tc"><b>${totalQty} NOS</b></td>
        <td></td><td></td>
        <td class="tr ta-v">&#8377; ${N(inv.grandTotal)}</td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- AMOUNT IN WORDS -->
<div class="wb">
  <div class="wi">
    <span class="wl">Amount Chargeable (in words)</span>
    <span class="wt">${this.getAmountInWords(inv.grandTotal || 0)}</span>
  </div>
  <span class="eo">E. &amp; O.E</span>
</div>

${showTax ? `
<!-- TAX BREAKUP -->
<div class="ts">
  <div class="sh">Tax Breakup</div>
  <table class="tx">
    <thead>
      <tr>${txHead1}</tr>
      <tr>${txHead2}</tr>
    </thead>
    <tbody>${hsnRows}</tbody>
    <tfoot><tr>${hsnFoot}</tr></tfoot>
  </table>
</div>
<!-- TAX IN WORDS -->
<div class="wb">
  <div class="wi">
    <span class="wl">Tax Amount (in words)</span>
    <span class="wt">${this.getAmountInWords(cgst + sgst + igst)}</span>
  </div>
</div>` : ''}

<!-- FOOTER -->
<div class="ft">
  <div class="fb">
    ${bankHTML}
  </div>
  <div class="fd">
    <div class="fbt">Declaration</div>
    <p class="decl">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
  </div>
  <div class="fs">
    <img src="${qrUrl}" class="qi" alt="QR">
    ${co?.upiId ? `<div class="ql">Scan &amp; Pay · ${co.upiId}</div>` : '<div class="ql">Invoice QR</div>'}
    <div class="sf">For <b>${co?.companyName || 'Company'}</b></div>
    <div class="sl"></div>
    <div class="sa">Authorised Signatory</div>
  </div>
</div>

<!-- CG FOOTER -->
<div class="cg">This is a Computer Generated Invoice</div>

</body>
</html>`;
  }

  getAmountInWords(amount: number): string {
    return numberToWords(amount);
  }

  getTotalQty(): number {
    if (!this.invoice?.items) return 0;
    return this.invoice.items.reduce((s, it) => s + (it.quantity || 0), 0);
  }

  getGroupedHsnRows(): { hsn: string; taxableValue: number; gstRate: number; cgstAmount: number; sgstAmount: number; igstAmount: number }[] {
    if (!this.invoice?.items) return [];
    const map = new Map<string, { hsn: string; taxableValue: number; gstRate: number; cgstAmount: number; sgstAmount: number; igstAmount: number }>();
    for (const item of this.invoice.items) {
      const key = item.hsn || '—';
      const ex  = map.get(key);
      if (ex) {
        ex.taxableValue += (item.taxableValue || 0);
        ex.cgstAmount  += (item.cgstAmount   || 0);
        ex.sgstAmount  += (item.sgstAmount   || 0);
        ex.igstAmount  += (item.igstAmount   || 0);
      } else {
        map.set(key, {
          hsn:          key,
          taxableValue: item.taxableValue  || 0,
          gstRate:      item.gstPercentage || 0,
          cgstAmount:   item.cgstAmount    || 0,
          sgstAmount:   item.sgstAmount    || 0,
          igstAmount:   item.igstAmount    || 0,
        });
      }
    }
    return Array.from(map.values());
  }
}
