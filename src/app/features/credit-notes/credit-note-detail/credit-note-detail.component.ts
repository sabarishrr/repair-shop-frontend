import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CreditNoteService } from '../../../core/services/credit-note.service';
import { CreditNote } from '../../../core/models/credit-note.model';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';
import { numberToWords } from '../../../core/utils/number-to-words';
import { EmailDialogComponent } from '../../../shared/email-dialog/email-dialog.component';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-credit-note-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule, MatDialogModule],
  template: `
    <!-- ACTION BAR -->
    <div class="no-print action-bar">
      <div class="ab-left">
        <a mat-stroked-button routerLink="/credit-notes" class="back-btn">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
        <span class="ab-title">Credit Note {{ note?.noteNumber }}</span>
        <span class="ab-sub">GST Adjustment Voucher</span>
      </div>
      <div class="ab-right">
        <button mat-stroked-button (click)="sendEmail()" [disabled]="!note?.customer?.email" class="email-btn">
          <mat-icon>email</mat-icon> Send Email
        </button>
        <button mat-raised-button color="primary" (click)="print()">
          <mat-icon>print</mat-icon> Print Credit Note
        </button>
      </div>
    </div>

    <!-- PREVIEW -->
    <div class="preview-wrap" *ngIf="note">
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
            <div class="inv-ttl">CREDIT NOTE</div>
            <div class="inv-orig">VOUCHER ADJUSTMENT</div>
            <div class="inv-no">{{ note.noteNumber }}</div>
            <div class="inv-dt">{{ note.noteDate | date:'d MMM yyyy' }}</div>
            <span class="s-chip active" [class.cancelled]="note.status === 'CANCELLED'">
              {{ note.status }}
            </span>
          </div>
        </div>

        <!-- INFO BAND -->
        <div class="info-band">
          <div class="party-col">
            <div class="pb-label">🧾 Customer Details (Bill To)</div>
            <div class="pb-name">{{ note.customer?.companyName || note.customer?.name }}</div>
            <div class="pb-line">{{ note.customer?.address }}{{ note.customer?.pinCode ? ', PIN: ' + note.customer?.pinCode : '' }}</div>
            <div class="pb-line">Ph: {{ note.customer?.phone }}</div>
            <div class="pb-line" *ngIf="note.customer?.gstin">GSTIN: {{ note.customer?.gstin }}</div>
            <div class="pb-line" *ngIf="note.customer?.state">State: {{ note.customer?.state?.name }}, Code: {{ note.customer?.state?.gstCode }}</div>
          </div>

          <div class="meta-col">
            <div class="meta-grid">
              <div class="mf"><span class="mk">Credit Note No.</span><span class="mv">{{ note.noteNumber }}</span></div>
              <div class="mf"><span class="mk">Voucher Date</span><span class="mv">{{ note.noteDate | date:'d-MMM-yyyy' }}</span></div>
              <div class="mf"><span class="mk">Ref Sales Invoice</span><span class="mv">{{ note.salesInvoice?.invoiceNumber || '—' }}</span></div>
              <div class="mf"><span class="mk">Original Invoice Date</span><span class="mv">{{ note.salesInvoice?.invoiceDate ? (note.salesInvoice?.invoiceDate | date:'d-MMM-yyyy') : '—' }}</span></div>
              <div class="mf"><span class="mk">Adjustment Reason</span><span class="mv accent">{{ getFriendlyReason(note.reason) }}</span></div>
              <div class="mf"><span class="mk">Total Adjusted</span><span class="mv accent">Rs. {{ note.grandTotal | number:'1.2-2' }}</span></div>
            </div>
          </div>
        </div>

        <!-- ITEMS TABLE -->
        <div class="it-section">
          <div class="s-head">Returned Items &amp; Adjustments</div>
          <table class="it-table">
            <thead>
              <tr>
                <th class="c-sl">#</th>
                <th class="c-desc tl">Description of Goods/Services Returned</th>
                <th class="c-hsn tc">HSN/SAC</th>
                <th class="c-qty tc">Qty</th>
                <th class="c-rate tr">Rate (₹)</th>
                <th class="c-per tc">Per</th>
                <th class="c-amt tr">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of note.items; let i = index" class="it-row">
                <td class="tc it-sl">{{ i + 1 }}</td>
                <td>
                  <span class="it-name">{{ item.description }}</span>
                  <span class="gst-tag" *ngIf="item.gstPercentage">
                    <ng-container *ngIf="company?.state?.id !== note.customer?.state?.id && note.customer?.state; else cgstSgst">
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
              <tr *ngIf="note.totalCgst! > 0" class="tx-row">
                <td></td><td class="tr tx-lbl">CGST Adjustment</td><td></td><td></td><td></td><td></td>
                <td class="tr"><b>{{ note.totalCgst | number:'1.2-2' }}</b></td>
              </tr>
              <tr *ngIf="note.totalSgst! > 0" class="tx-row">
                <td></td><td class="tr tx-lbl">SGST Adjustment</td><td></td><td></td><td></td><td></td>
                <td class="tr"><b>{{ note.totalSgst | number:'1.2-2' }}</b></td>
              </tr>
              <tr *ngIf="note.totalIgst! > 0" class="tx-row">
                <td></td><td class="tr tx-lbl">IGST Adjustment</td><td></td><td></td><td></td><td></td>
                <td class="tr"><b>{{ note.totalIgst | number:'1.2-2' }}</b></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="tot-row">
                <td></td>
                <td class="tr tot-lbl">Adjusted Total</td>
                <td></td>
                <td class="tc"><b>{{ getTotalQty() }} NOS</b></td>
                <td></td><td></td>
                <td class="tr tot-amt">&#8377; {{ note.grandTotal | number:'1.2-2' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- AMOUNT IN WORDS -->
        <div class="w-band">
          <div class="w-inner">
            <span class="wl">Voucher Amount (in words)</span>
            <span class="wt">{{ getAmountInWords(note.grandTotal || 0) }}</span>
          </div>
          <span class="eoe">E. &amp; O.E</span>
        </div>

        <!-- TAX BREAKUP -->
        <div class="tx-section" *ngIf="note.totalCgst! > 0 || note.totalIgst! > 0">
          <div class="s-head">Adjustment Tax Breakup</div>
          <table class="tx-table">
            <thead>
              <tr>
                <th rowspan="2" class="tl">HSN/SAC</th>
                <th rowspan="2" class="tr">Taxable Value</th>
                <th colspan="2" *ngIf="note.totalCgst! > 0">Central Tax</th>
                <th colspan="2" *ngIf="note.totalSgst! > 0">State Tax</th>
                <th colspan="2" *ngIf="note.totalIgst! > 0">Integrated Tax</th>
                <th rowspan="2" class="tr">Total Tax</th>
              </tr>
              <tr>
                <ng-container *ngIf="note.totalCgst! > 0"><th class="tc">Rate</th><th class="tr">Amt</th></ng-container>
                <ng-container *ngIf="note.totalSgst! > 0"><th class="tc">Rate</th><th class="tr">Amt</th></ng-container>
                <ng-container *ngIf="note.totalIgst! > 0"><th class="tc">Rate</th><th class="tr">Amt</th></ng-container>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of getGroupedHsnRows()">
                <td class="tl">{{ row.hsn }}</td>
                <td class="tr">{{ row.taxableValue | number:'1.2-2' }}</td>
                <ng-container *ngIf="note.totalCgst! > 0">
                  <td class="tc">{{ row.gstRate / 2 }}%</td>
                  <td class="tr">{{ row.cgstAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container *ngIf="note.totalSgst! > 0">
                  <td class="tc">{{ row.gstRate / 2 }}%</td>
                  <td class="tr">{{ row.sgstAmount | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container *ngIf="note.totalIgst! > 0">
                  <td class="tc">{{ row.gstRate }}%</td>
                  <td class="tr">{{ row.igstAmount | number:'1.2-2' }}</td>
                </ng-container>
                <td class="tr">{{ (row.cgstAmount + row.sgstAmount + row.igstAmount) | number:'1.2-2' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="tr"><b>Total</b></td>
                <td class="tr"><b>{{ note.totalTaxableValue | number:'1.2-2' }}</b></td>
                <ng-container *ngIf="note.totalCgst! > 0"><td></td><td class="tr"><b>{{ note.totalCgst | number:'1.2-2' }}</b></td></ng-container>
                <ng-container *ngIf="note.totalSgst! > 0"><td></td><td class="tr"><b>{{ note.totalSgst | number:'1.2-2' }}</b></td></ng-container>
                <ng-container *ngIf="note.totalIgst! > 0"><td></td><td class="tr"><b>{{ note.totalIgst | number:'1.2-2' }}</b></td></ng-container>
                <td class="tr"><b>{{ ((note.totalCgst || 0) + (note.totalSgst || 0) + (note.totalIgst || 0)) | number:'1.2-2' }}</b></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- FOOTER -->
        <div class="ft-band">
          <div class="ft-bank">
            <div class="ft-title">Company Bank Details</div>
            <div class="bk-row" *ngIf="company?.bankName"><span>Bank Name</span><b>{{ company?.bankName }}</b></div>
            <div class="bk-row" *ngIf="company?.accountNumber"><span>A/c No.</span><b>{{ company?.accountNumber }}</b></div>
            <div class="bk-row" *ngIf="company?.branchIfsCode"><span>Branch &amp; IFSC</span><b>{{ company?.branchIfsCode }}</b></div>
          </div>
          <div class="ft-decl">
            <div class="ft-title">Declaration</div>
            <p>We declare that this credit note adjustment is true and correct, and represents valid returns or trade discount settlements.</p>
          </div>
          <div class="ft-sig">
            <div class="sig-for">For <b>{{ company?.companyName }}</b></div>
            <div class="sig-line" style="margin-top: 25px;"></div>
            <div class="sig-auth">Authorised Signatory</div>
          </div>
        </div>

        <!-- GENERATED BY -->
        <div class="cg-foot">Computer Generated Credit Note Adjustment Voucher</div>

      </div>
    </div>
  `,
  styles: [`
    .action-bar { display:flex; align-items:center; justify-content:space-between; padding:12px 22px;
      background:var(--mat-app-background-color,#0f172a); border-bottom:1px solid rgba(255,255,255,.06); flex-wrap:wrap; gap:10px; }
    .ab-left  { display:flex; align-items:center; gap:12px; }
    .ab-right { display:flex; align-items:center; gap:8px; }
    .back-btn  { color:#94a3b8 !important; border-color:#334155 !important; }
    .ab-title  { font-family:'Inter',sans-serif; font-size:15px; font-weight:700; color:#f1f5f9; }
    .ab-sub    { font-size:11px; color:#64748b; }
    .email-btn { color:#7c3aed !important; border-color:#7c3aed !important; }

    .preview-wrap { background:linear-gradient(135deg,#eef2ff,#faf5ff,#f8fafc); padding:28px 16px; display:flex; justify-content:center; min-height:100vh; }
    .inv-doc { background:#fff; width:210mm; border-radius:14px;
      box-shadow:0 20px 60px rgba(0,0,0,.08);
      font-family:'Inter',Arial,sans-serif; font-size:11px; color:#1e293b; line-height:1.4; overflow:hidden; }

    .inv-hdr { background:linear-gradient(135deg,#6b7280,#4b5563 50%,#374151) !important;
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
    .s-chip   { display:inline-block; padding:2px 11px; border-radius:20px; font-size:8px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; background:#10b981; color:#fff; }
    .s-chip.cancelled { background:#f44336 !important; }

    .info-band { display:grid; grid-template-columns:45% 55%; border-bottom:2px solid #f1f5f9; }
    .party-col { padding:10px 12px; border-right:1px solid #f1f5f9; }
    .meta-col  { padding:10px 12px; background:#fafbff; }
    .pb-label  { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#475569; margin-bottom:3px; }
    .pb-name   { font-size:11px; font-weight:700; color:#0f172a; margin-bottom:2px; }
    .pb-line   { font-size:9px; color:#64748b; line-height:1.55; }

    .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 10px; }
    .mf        { display:flex; flex-direction:column; }
    .mk { font-size:7px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
    .mv { font-size:9.5px; font-weight:500; color:#1e293b; }
    .mv.accent { color:#4b5563; font-weight:700; }

    .it-section { padding:10px 12px 0; }
    .tx-section { padding:0 12px; }
    .s-head { font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:1.2px; color:#475569;
      margin-bottom:6px; padding-bottom:4px; border-bottom:2px solid #e2e8f0; }

    table { width:100%; border-collapse:collapse; }
    .it-table thead tr { background:linear-gradient(90deg,#6b7280,#4b5563) !important; color:#fff; }
    .it-table thead th { padding:7px 6px; font-weight:600; font-size:9px; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; }
    .it-row td { padding:6px 6px; vertical-align:top; border-bottom:1px solid #f1f5f9; }
    .it-row:nth-child(even) td { background:#fafbff; }
    .it-sl   { color:#94a3b8; font-size:9px; text-align:center; }
    .it-name { display:block; font-weight:600; color:#0f172a; margin-bottom:2px; }
    .gst-tag { display:inline-block; font-size:8px; color:#4b5563; background:#f3f4f6; border-radius:3px; padding:0 5px; font-style:italic; font-weight:500; }
    .tx-row td { padding:3px 6px; font-size:9px; color:#64748b; font-style:italic; border-bottom:1px solid #f1f5f9; }
    .tx-lbl  { font-weight:700; color:#4b5563; }
    .it-table tfoot .tot-row td { padding:7px 6px; font-weight:700; background:rgba(0,0,0,0.02) !important; border-top:2px solid #4b5563; }
    .tot-lbl { color:#374151; font-size:11px; }
    .tot-amt { font-size:14px; color:#374151; font-weight:800; }

    .c-sl   { width:4%;  text-align:center; }
    .c-desc { width:38%; text-align:left; }
    .c-hsn  { width:10%; text-align:center; }
    .c-qty  { width:10%; text-align:center; }
    .c-rate { width:12%; text-align:right; }
    .c-per  { width:6%;  text-align:center; }
    .c-amt  { width:12%; text-align:right; }

    .w-band  { margin:7px 12px; background:linear-gradient(120deg,#f3f4f6,#e5e7eb) !important; border-radius:7px;
               padding:7px 12px; display:flex; justify-content:space-between; align-items:center; }
    .w-inner { display:flex; flex-direction:column; gap:1px; }
    .wl { font-size:7.5px; font-weight:800; color:#4b5563; text-transform:uppercase; letter-spacing:.8px; }
    .wt { font-size:10px; font-weight:600; color:#0f172a; }
    .eoe { font-size:9px; font-style:italic; color:#94a3b8; }

    .tx-table thead tr:first-child { background:#4b5563 !important; color:#fff; }
    .tx-table thead tr:last-child  { background:#6b7280 !important; color:#fff; }
    .tx-table thead th { padding:5px 6px; font-weight:600; font-size:8.5px; text-transform:uppercase; letter-spacing:.4px; text-align:center; }
    .tx-table tbody td { padding:5px 6px; border-bottom:1px solid #f1f5f9; color:#334155; }
    .tx-table tfoot td { padding:6px 6px; font-weight:700; background:#f9fafb !important; border-top:1.5px solid #4b5563; }

    .ft-band { display:grid; grid-template-columns:1fr 1fr 135px; gap:0; border-top:1.5px solid #e2e8f0; margin:8px 12px 0; padding-top:8px; }
    .ft-bank, .ft-decl, .ft-sig { padding:0 8px; }
    .ft-bank { border-right:1px solid #e2e8f0; padding-left:0; }
    .ft-sig  { border-left:1px solid #e2e8f0; padding-right:0; text-align:center; display:flex; flex-direction:column; align-items:center; }
    .ft-title { font-size:7.5px; font-weight:800; color:#4b5563; text-transform:uppercase; letter-spacing:.8px; margin-bottom:4px; }
    .bk-row  { display:flex; gap:6px; font-size:9px; line-height:1.75; }
    .bk-row span { color:#64748b; min-width:80px; flex-shrink:0; }
    .bk-row b    { color:#0f172a; }
    .ft-decl p   { font-size:9px; color:#64748b; line-height:1.55; margin:0; }
    .sig-for { font-size:8.5px; color:#475569; margin-top:2px; margin-bottom:16px; }
    .sig-line{ height:18px; border-bottom:1px solid #cbd5e1; width:90px; margin:0 auto 3px; }
    .sig-auth{ font-size:7.5px; color:#64748b; }

    .cg-foot { margin-top:8px; text-align:center; font-size:8px; font-weight:600; color:#fff;
      background:linear-gradient(90deg,#4b5563,#6b7280) !important; padding:5px; letter-spacing:1.2px; text-transform:uppercase; }

    .tc { text-align:center !important; }
    .tr { text-align:right  !important; }
    .tl { text-align:left   !important; }
  `]
})
export class CreditNoteDetailComponent implements OnInit {
  note?: CreditNote;
  company?: CompanyDetails;

  constructor(
    private route: ActivatedRoute,
    private creditNoteService: CreditNoteService,
    private companyService: CompanyDetailsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.companyService.get().subscribe(c => this.company = c);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.creditNoteService.getById(+id).subscribe(data => this.note = data);
  }

  sendEmail(): void {
    if (!this.note) return;
    this.dialog.open(EmailDialogComponent, {
      data: {
        toEmail: this.note.customer?.email || '',
        subject: `Credit Note ${this.note.noteNumber} from ${this.company?.companyName || 'Us'}`,
        message: `Dear ${this.note.customer?.name || 'Customer'},\n\nPlease find attached credit adjustment voucher ${this.note.noteNumber} for your account.\n\nThank you!`,
        documentType: 'CREDIT_NOTE',
        documentId: this.note.id!,
        documentLabel: `Credit Note ${this.note.noteNumber}`
      },
      width: '620px'
    });
  }

  getAmountInWords(amount: number): string {
    return numberToWords(amount);
  }

  getTotalQty(): number {
    if (!this.note?.items) return 0;
    return this.note.items.reduce((s, it) => s + (it.quantity || 0), 0);
  }

  getFriendlyReason(reason: string): string {
    switch (reason) {
      case 'SALES_RETURN': return 'Sales Return';
      case 'POST_SALES_DISCOUNT': return 'Post-Sale Discount';
      case 'CORRECTION_IN_INVOICE': return 'Invoice Correction';
      default: return 'Other Adjustment';
    }
  }

  getGroupedHsnRows(): { hsn: string; taxableValue: number; gstRate: number; cgstAmount: number; sgstAmount: number; igstAmount: number }[] {
    if (!this.note?.items) return [];
    const map = new Map<string, { hsn: string; taxableValue: number; gstRate: number; cgstAmount: number; sgstAmount: number; igstAmount: number }>();
    for (const item of this.note.items) {
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

  print(): void {
    if (!this.note) return;
    const html = this.buildPrintDoc();
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 900);
  }

  private buildPrintDoc(): string {
    const cn   = this.note!;
    const co   = this.company;
    const N    = (n?: number | null) => (n ?? 0).toFixed(2);
    const D    = (d?: string | Date | null) => {
      if (!d) return '&mdash;';
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const H    = (s?: string | null) => s || '&mdash;';

    const cgst = cn.totalCgst  || 0;
    const sgst = cn.totalSgst  || 0;
    const igst = cn.totalIgst  || 0;
    const showTax = cgst > 0 || igst > 0;
    const isIGST  = (co?.state?.id !== cn.customer?.state?.id) && !!cn.customer?.state;

    const itemRows = (cn.items || []).map((item, i) => {
      const gstLbl = item.gstPercentage
        ? (isIGST
            ? `IGST @ ${item.gstPercentage}%`
            : `CGST @ ${item.gstPercentage / 2}%&nbsp;&nbsp;|&nbsp;&nbsp;SGST @ ${item.gstPercentage / 2}%`)
        : '';
      return `<tr class="ir">
        <td class="tc sn">${i + 1}</td>
        <td><span class="nm">${item.description}</span>${gstLbl ? `<span class="gt">${gstLbl}</span>` : ''}</td>
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

    const totalQty = (cn.items || []).reduce((s, it) => s + (it.quantity || 0), 0);

    const grouped = this.getGroupedHsnRows();
    const hsnRows = grouped.map(row => {
      let c = `<td>${row.hsn}</td><td class="tr">${N(row.taxableValue)}</td>`;
      if (cgst > 0) c += `<td class="tc">${row.gstRate / 2}%</td><td class="tr">${N(row.cgstAmount)}</td>`;
      if (sgst > 0) c += `<td class="tc">${row.gstRate / 2}%</td><td class="tr">${N(row.sgstAmount)}</td>`;
      if (igst > 0) c += `<td class="tc">${row.gstRate}%</td><td class="tr">${N(row.igstAmount)}</td>`;
      c += `<td class="tr">${N(row.cgstAmount + row.sgstAmount + row.igstAmount)}</td>`;
      return `<tr>${c}</tr>`;
    }).join('');

    let hsnFoot = `<td><b>Total</b></td><td class="tr"><b>${N(cn.totalTaxableValue)}</b></td>`;
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

    const cu = cn.customer;
    const addrLines = (name: string, addr: string, pin: string, phone: string, gstin: string, state: string) =>
      `<div class="pan">${name}</div>
       <div class="pal">${addr}${pin ? ', PIN: ' + pin : ''}</div>
       ${phone ? `<div class="pal">Ph: ${phone}</div>` : ''}
       ${gstin ? `<div class="pal">GSTIN: ${gstin}</div>` : ''}
       ${state ? `<div class="pal">${state}</div>` : ''}`;

    const billBlock = `<div class="pb">
      <div class="pbl">CUSTOMER DETAILS (BILL TO)</div>
      ${addrLines(
        cu?.companyName || cu?.name || '',
        cu?.address || '',
        cu?.pinCode || '',
        cu?.phone || '',
        cu?.gstin || '',
        cu?.state ? `State: ${cu.state.name}, Code: ${cu.state.gstCode}` : ''
      )}
    </div>`;

    const mf = (k: string, v: string) =>
      v && v !== '&mdash;'
        ? `<div class="mf"><span class="mk">${k}</span><span class="mv">${v}</span></div>`
        : '';

    const metaHTML = `
      ${mf('Credit Note No.', H(cn.noteNumber))}
      ${mf('Date', D(cn.noteDate))}
      ${mf('Ref Sales Invoice', H(cn.salesInvoice?.invoiceNumber))}
      ${mf('Original Invoice Date', D(cn.salesInvoice?.invoiceDate))}
      ${mf('Adjustment Reason', this.getFriendlyReason(cn.reason))}
      ${mf('Total Adjusted Amount', `₹ ${N(cn.grandTotal)}`)}`;

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
<title>Credit Note ${cn.noteNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{size:A4 portrait;margin:7mm}
  html,body{margin:0;padding:0;background:#fff;font-family:'Inter',Arial,sans-serif;font-size:8.5px;color:#1e293b}

  .hdr{background:linear-gradient(135deg,#6b7280,#4b5563 50%,#374151)!important;
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
  .sc{display:inline-block;padding:2px 9px;border-radius:20px;font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;background:#10b981;color:#fff}
  .sc.cancelled{background:#f44336}

  .ib{display:grid;grid-template-columns:42% 58%;border-bottom:1.5px solid #e2e8f0}
  .pc{padding:8px 10px;border-right:1px solid #e2e8f0}
  .mc{padding:8px 10px;background:#fafbff}
  .pb{margin-bottom:3px}
  .pbl{font-size:6.5px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#4b5563;margin-bottom:2px}
  .pan{font-size:9.5px;font-weight:700;color:#0f172a;margin-bottom:1px}
  .pal{font-size:7.5px;color:#64748b;line-height:1.5}
  .mfg{display:grid;grid-template-columns:1fr 1fr;gap:2px 8px}
  .mf{display:flex;flex-direction:column}
  .mk{font-size:6px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
  .mv{font-size:8px;font-weight:500;color:#1e293b}

  .is{padding:7px 10px 0}.ts{padding:0 10px}
  .sh{font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#4b5563;
      margin-bottom:4px;padding-bottom:3px;border-bottom:1.5px solid #e5e7eb}
  table{width:100%;border-collapse:collapse}
  .it thead tr{background:linear-gradient(90deg,#6b7280,#4b5563)!important;color:#fff}
  .it thead th{padding:5px 5px;font-weight:600;font-size:7.5px;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap}
  .ir td{padding:4.5px 5px;vertical-align:top;border-bottom:1px solid #f1f5f9;font-size:8.5px}
  .ir:nth-child(even) td{background:#fafbff}
  .sn{color:#94a3b8;font-size:7.5px;text-align:center}
  .nm{display:block;font-weight:600;color:#0f172a;margin-bottom:1px}
  .gt{display:inline-block;font-size:7px;color:#4b5563;background:#f3f4f6;border-radius:3px;padding:0 4px;font-style:italic}
  .txr td{padding:2.5px 5px;font-size:8px;color:#64748b;font-style:italic;border-bottom:1px solid #f1f5f9}
  .txl{font-weight:700;color:#4b5563;text-align:right!important}
  .it tfoot tr td{padding:5.5px 5px;font-weight:700;background:rgba(0,0,0,0.02)!important;border-top:2px solid #4b5563}
  .tl-v{color:#374151;font-size:9.5px}.ta-v{font-size:11.5px;color:#1e293b;font-weight:800}

  .c1{width:4%;text-align:center}.c2{width:37%;text-align:left}.c3{width:10%;text-align:center}
  .c4{width:10%;text-align:center}.c5{width:12%;text-align:right}.c6{width:6%;text-align:center}.c7{width:12%;text-align:right}

  .wb{margin:5px 10px;background:linear-gradient(120deg,#f3f4f6,#e5e7eb)!important;border-radius:6px;
      padding:5px 10px;display:flex;justify-content:space-between;align-items:center}
  .wi{display:flex;flex-direction:column}
  .wl{font-size:6.5px;font-weight:800;color:#4b5563;text-transform:uppercase;letter-spacing:.7px}
  .wt{font-size:8.5px;font-weight:600;color:#0f172a}
  .eo{font-size:7.5px;font-style:italic;color:#94a3b8}

  .tx thead tr:first-child{background:#4b5563!important;color:#fff}
  .tx thead tr:last-child{background:#6b7280!important;color:#fff}
  .tx thead th{padding:3.5px 5px;font-weight:600;font-size:7px;text-transform:uppercase;text-align:center}
  .tx tbody td{padding:3.5px 5px;border-bottom:1px solid #f1f5f9;font-size:8px;color:#334155}
  .tx tfoot td{padding:4px 5px;font-weight:700;background:#fafafa!important;border-top:1.5px solid #4b5563;font-size:8px}

  .ft{display:grid;grid-template-columns:1fr 1fr 125px;border-top:1.5px solid #e2e8f0;margin:6px 10px 0;padding-top:7px}
  .fb{border-right:1px solid #e2e8f0;padding-right:8px}
  .fd{padding:0 8px}
  .fs{border-left:1px solid #e2e8f0;padding-left:8px;text-align:center;display:flex;flex-direction:column;align-items:center}
  .fbt{font-size:6.5px;font-weight:800;color:#4b5563;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}
  .br{display:flex;gap:5px;font-size:8px;line-height:1.7}
  .br span{color:#64748b;min-width:72px;flex-shrink:0}
  .br b{color:#0f172a}
  .decl{font-size:7.5px;color:#64748b;line-height:1.5;margin:0}
  .sf{font-size:8px;color:#475569;margin-bottom:13px}
  .sl{height:16px;border-bottom:1px solid #cbd5e1;width:80px;margin:0 auto 2px}
  .sa{font-size:7px;color:#64748b}

  .cg{margin-top:6px;text-align:center;font-size:7px;font-weight:600;color:#fff;
      background:linear-gradient(90deg,#4b5563,#6b7280)!important;
      padding:4.5px;letter-spacing:1.2px;text-transform:uppercase}

  .tc{text-align:center!important}.tr{text-align:right!important}.tl{text-align:left!important}
</style>
</head>
<body>

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
    <div class="ht">CREDIT NOTE</div>
    <div class="ho">VOUCHER ADJUSTMENT</div>
    <div class="hn">${cn.noteNumber || ''}</div>
    <div class="hd">${D(cn.noteDate)}</div>
    <span class="sc ${(cn.status || '').toLowerCase()}">${cn.status || ''}</span>
  </div>
</div>

<div class="ib">
  <div class="pc">
    ${billBlock}
  </div>
  <div class="mc">
    <div class="mfg">
      ${metaHTML}
    </div>
  </div>
</div>

<div class="is">
  <div class="sh">Adjusted Items</div>
  <table class="it">
    <thead>
      <tr>
        <th class="c1">#</th>
        <th class="c2 tl">Description of Goods &amp; Services Returned</th>
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
        <td class="tr tl-v">Adjusted Total</td>
        <td></td>
        <td class="tc"><b>${totalQty} NOS</b></td>
        <td></td><td></td>
        <td class="tr ta-v">&#8377; ${N(cn.grandTotal)}</td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="wb">
  <div class="wi">
    <span class="wl">Adjusted Amount Chargeable (in words)</span>
    <span class="wt">${this.getAmountInWords(cn.grandTotal || 0)}</span>
  </div>
  <span class="eo">E. &amp; O.E</span>
</div>

${showTax ? `
<div class="ts">
  <div class="sh">Adjustment Tax Breakup</div>
  <table class="tx">
    <thead>
      <tr>${txHead1}</tr>
      <tr>${txHead2}</tr>
    </thead>
    <tbody>${hsnRows}</tbody>
    <tfoot><tr>${hsnFoot}</tr></tfoot>
  </table>
</div>
<div class="wb">
  <div class="wi">
    <span class="wl">Tax Amount (in words)</span>
    <span class="wt">${this.getAmountInWords(cgst + sgst + igst)}</span>
  </div>
</div>` : ''}

<div class="ft">
  <div class="fb">
    ${bankHTML}
  </div>
  <div class="fd">
    <div class="fbt">Declaration</div>
    <p class="decl">We declare that this credit note adjustment is true and correct, and represents valid returns or trade discount settlements.</p>
  </div>
  <div class="fs">
    <div class="sf" style="margin-top: 10px;">For <b>${co?.companyName || 'Company'}</b></div>
    <div class="sl" style="margin-top: 15px;"></div>
    <div class="sa">Authorised Signatory</div>
  </div>
</div>

<div class="cg">Computer Generated Credit Note Adjustment Voucher</div>

</body>
</html>`;
  }
}
