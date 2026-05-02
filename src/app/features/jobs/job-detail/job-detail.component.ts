import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { JobSheetService } from '../../../core/services/job-sheet.service';
import { JobSheet } from '../../../core/models/job-sheet.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatChipsModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container" *ngIf="job">
      <!-- Header -->
      <div class="page-header no-print">
        <div>
          <h1 class="detail-title">Job Sheet #JOB-{{ job.id }}</h1>
          <p>Created on {{ job.createdAt | date:'medium' }}</p>
        </div>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/jobs">
            <mat-icon>arrow_back</mat-icon> Back
          </a>
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
            <img [src]="getQrCodeUrl(job)" alt="QR Code" class="job-qr" />
            <h1>Job Sheet</h1>
            <p class="doc-id">#JOB-{{ job.id }}</p>
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
    private snackBar: MatSnackBar
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

  print(): void {
    window.print();
  }

  getQrCodeUrl(job: JobSheet): string {
    if (!job) return '';
    const data = `Job: JOB-${job.id}\nStatus: ${job.status}\nCustomer: ${job.customer?.name}\nPhone: ${job.customer?.phone}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}&bgcolor=ffffff`;
  }
}
