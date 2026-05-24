import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JobSheetService } from '../../../core/services/job-sheet.service';
import { JobSheet } from '../../../core/models/job-sheet.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';
import { EmailDialogComponent } from '../../../shared/email-dialog/email-dialog.component';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatChipsModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container" *ngIf="job">
      <!-- Header -->
      <div class="page-header no-print">
        <div>
          <h1 class="detail-title" *ngIf="job.status !== 'DELIVERED'">Job Sheet #JOB-{{ job.id }}</h1>
          <h1 class="detail-title" *ngIf="job.status === 'DELIVERED'">Cash Bill #JOB-{{ job.id }}</h1>
          <p>Created on {{ job.createdAt | date:'medium' }}</p>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/jobs">
            <mat-icon>arrow_back</mat-icon> Back
          </a>
          <button mat-stroked-button (click)="sendEmail()" [disabled]="!job.customer.email">
            <mat-icon>email</mat-icon> Send Email
          </button>
          <button mat-flat-button class="wa-btn" (click)="sendWhatsApp()" [disabled]="!job.customer.phone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16" style="vertical-align:middle;margin-right:4px;flex-shrink:0"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.102 1.518 5.826L0 24l6.336-1.491A11.933 11.933 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.385 14.518c-.295-.147-1.745-.86-2.016-.957-.27-.098-.467-.147-.663.147-.196.295-.76.957-.932 1.154-.172.196-.344.22-.638.074-.295-.147-1.244-.459-2.368-1.462-.875-.78-1.466-1.744-1.637-2.039-.172-.295-.018-.454.129-.6.132-.132.295-.344.442-.517.147-.172.196-.295.295-.491.098-.196.049-.368-.025-.515-.074-.147-.663-1.598-.908-2.187-.239-.574-.483-.496-.663-.505l-.565-.01c-.196 0-.516.074-.786.368-.27.295-1.032 1.008-1.032 2.459s1.057 2.852 1.204 3.048c.147.196 2.08 3.177 5.042 4.457.705.305 1.255.486 1.684.623.708.225 1.352.193 1.861.117.568-.085 1.745-.713 1.991-1.402.245-.688.245-1.277.172-1.402-.074-.123-.27-.196-.565-.344z"/></svg>
            WhatsApp
          </button>
          <button mat-stroked-button (click)="print()">
            <mat-icon>print</mat-icon> Print
          </button>
          <a mat-raised-button color="primary" [routerLink]="['/jobs', job.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit Job
          </a>
        </div>
      </div>

      <!-- Printable Area -->
      <div class="print-area">
        <!-- Print Header -->
        <div class="print-header">
          <div class="company-details">
            <img *ngIf="company?.logoUrl" [src]="company?.logoUrl" alt="Logo" class="company-logo-print">
            <h2>{{ company?.companyName || 'TechFix Pro' }}</h2>
            <p>{{ company?.address || '' }}</p>
            <p *ngIf="company?.phone || company?.email">Phone: {{ company?.phone || '' }} | Email: {{ company?.email || '' }}</p>
            <p *ngIf="company?.gstNumber">GST: {{ company?.gstNumber }}</p>
          </div>
          
          <div class="doc-title">
            <img [src]="getQrCodeUrl(job, company)" alt="QR Code" class="job-qr" />
            <h1 *ngIf="job.status !== 'DELIVERED'">Job Sheet</h1>
            <h1 *ngIf="job.status === 'DELIVERED'">CASH BILL</h1>
            <p class="doc-id" *ngIf="job.status !== 'DELIVERED'">#JOB-{{ job.id }}</p>
            <p class="doc-id" *ngIf="job.status === 'DELIVERED'">#JOB-{{ job.id }}</p>
            <p class="doc-date">Date: {{ job.createdAt | date:'mediumDate' }}</p>
          </div>
        </div>

        <div class="customer-info-box">
          <p class="label">CUSTOMER DETAILS</p>
          <h3>{{ job.customer.name }}</h3>
          <p *ngIf="job.customer.address">{{ job.customer.address }}</p>
          <p>Phone: {{ job.customer.phone }}</p>
          <p *ngIf="job.customer.email">Email: {{ job.customer.email }}</p>
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th colspan="2">Device & Repair Information</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td width="30%"><strong>Device Type</strong></td>
              <td>{{ job.deviceType || '—' }}</td>
            </tr>
            <tr>
              <td><strong>Brand & Model</strong></td>
              <td>{{ job.brand || '—' }} {{ job.model ? '- ' + job.model : '' }}</td>
            </tr>
            <tr>
              <td><strong>Serial Number</strong></td>
              <td>{{ job.serialNumber || '—' }}</td>
            </tr>
            <tr>
              <td><strong>Reported Issue</strong></td>
              <td class="pre-wrap">{{ job.problemDescription }}</td>
            </tr>
            <tr>
              <td><strong>Accessories Received</strong></td>
              <td>{{ job.accessories || '—' }}</td>
            </tr>
            <tr *ngIf="job.actionTaken">
              <td><strong>Action Taken</strong></td>
              <td class="pre-wrap">{{ job.actionTaken }}</td>
            </tr>
            <tr *ngIf="job.materialUsed">
              <td><strong>Material Used</strong></td>
              <td class="pre-wrap">{{ job.materialUsed }}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-section">
          <div class="terms-box">
             <div class="term-group">
               <strong>Timeline:</strong>
               <p>Received: {{ job.receivedDate | date:'mediumDate' }}</p>
               <p *ngIf="job.deliveryDate">Expected Delivery: {{ job.deliveryDate | date:'mediumDate' }}</p>
               <p *ngIf="job.deliveredDate">Delivered: {{ job.deliveredDate | date:'mediumDate' }}</p>
             </div>
             <div class="term-group">
               <strong>Status & Assignment:</strong>
               <p>Status: {{ job.status }}</p>
               <p>Technician: {{ job.technician || 'Unassigned' }}</p>
             </div>
          </div>
          
          <div class="totals-box">
            <div class="total-row">
              <span>Estimated Cost:</span>
              <span>Rs. {{ job.estimatedCost || '0' }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Final Cost:</span>
              <span>Rs. {{ job.finalCost || 'TBD' }}</span>
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
    
    .doc-title { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
    .doc-title h1 { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; color: #000 !important; margin: 0 0 4px; }
    .doc-id { font-size: 16px; font-weight: 600; margin: 0 0 4px; color: #000 !important; }
    .doc-date { font-size: 14px; color: #666; margin: 0; }
    .job-qr { width: 80px; height: 80px; margin-bottom: 12px; }

    .customer-info-box { margin-bottom: 24px; }
    .customer-info-box .label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px; }
    .customer-info-box h3 { font-size: 18px; margin: 0 0 4px; color: #000 !important; }
    .customer-info-box p { font-size: 14px; margin: 2px 0; color: #333; }

    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .item-table th, .item-table td { border: 1px solid #ccc; padding: 10px; font-size: 14px; text-align: left; }
    .item-table th { background: #f5f5f5; font-weight: 600; color: #000; }
    .pre-wrap { white-space: pre-wrap; }

    .summary-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .terms-box { flex: 1; padding-right: 40px; display: flex; flex-direction: column; gap: 16px; }
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
export class JobDetailComponent implements OnInit {
  job?: JobSheet;
  company?: CompanyDetails;

  constructor(
    private route: ActivatedRoute,
    private svc: JobSheetService,
    private companySvc: CompanyDetailsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private whatsapp: WhatsAppService
  ) { }

  ngOnInit(): void {
    this.companySvc.get().subscribe(c => this.company = c);
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.svc.getById(+id).subscribe({
        next: (j) => this.job = j,
        error: () => {
          this.snackBar.open('Job not found', 'OK', { duration: 3000 });
          this.router.navigate(['/jobs']);
        }
      });
    }
  }

  sendEmail(): void {
    if (!this.job) return;
    this.dialog.open(EmailDialogComponent, {
      data: {
        toEmail: this.job.customer?.email || '',
        subject: `Job Sheet JOB-${this.job.id} — ${this.job.status} | ${this.company?.companyName || 'Us'}`,
        message: `Dear ${this.job.customer?.name || 'Customer'},\n\nPlease find attached your job sheet JOB-${this.job.id} for ${this.job.deviceType || 'your device'}.\n\nCurrent Status: ${this.job.status}\n\nThank you for choosing us!`,
        documentType: 'JOBSHEET',
        documentId: this.job.id!,
        documentLabel: `Job Sheet JOB-${this.job.id}`
      },
      width: '620px'
    });
  }

  sendWhatsApp(): void {
    if (!this.job || !this.job.customer?.phone) return;
    const name = this.job.customer.name || 'Customer';
    const device = `${this.job.deviceType || ''} ${this.job.brand || ''}`.trim() || 'your device';
    const company = this.company?.companyName || 'Us';
    if (this.job.status === 'DELIVERED') {
      this.whatsapp.sendCollectionReady(this.job.customer.phone, name, this.job.id!, device, this.job.finalCost ?? 'TBD', company);
    } else {
      this.whatsapp.sendJobStatus(this.job.customer.phone, name, this.job.id!, device, this.job.status, company);
    }
  }

  print(): void {
    window.print();
  }

  getQrCodeUrl(job: JobSheet, company?: CompanyDetails): string {
    if (!job) return '';
    if (company?.upiId) {
      // UPI QR — include amount if available
      const amount = job.finalCost ? `&am=${job.finalCost}` : '';
      const upiUrl = `upi://pay?pa=${encodeURIComponent(company.upiId)}&pn=${encodeURIComponent(company.companyName || 'Shop')}${amount}&cu=INR&tn=${encodeURIComponent('JOB-' + job.id)}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=000000`;
    }
    // Fallback: job info QR
    const data = `Job: JOB-${job.id}\nStatus: ${job.status}\nCustomer: ${job.customer?.name}\nPhone: ${job.customer?.phone}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}&bgcolor=ffffff`;
  }
}
