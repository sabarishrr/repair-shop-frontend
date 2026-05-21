import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { JobSheetService } from '../../core/services/job-sheet.service';
import { SalesInvoiceService } from '../../core/services/sales-invoice.service';
import { PurchaseService } from '../../core/services/purchase.service';
import { CustomerService } from '../../core/services/customer.service';
import { ReceiptService } from '../../core/services/receipt.service';
import { DashboardStats, JobSheet } from '../../core/models/job-sheet.model';
import { SalesInvoice } from '../../core/models/sales-invoice.model';
import { PurchaseInvoice } from '../../core/models/purchase.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatProgressBarModule,
    MatButtonModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <div class="page-container dashboard-root">

      <!-- ─── Greeting Header ─────────────────────────────── -->
      <div class="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p>{{ greeting }}, here's what's happening at your repair shop today.</p>
        </div>
        <div class="header-time">
          <mat-icon>schedule</mat-icon>
          <span>{{ today | date:'fullDate' }}</span>
        </div>
      </div>

      <!-- ─── KPI Stat Cards ─────────────────────────────── -->
      <div class="kpi-grid">

        <div class="kpi-card purple" routerLink="/jobs">
          <div class="kpi-icon"><mat-icon>build_circle</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-label">Total Jobs</span>
            <span class="kpi-value">{{ stats?.totalJobs ?? '—' }}</span>
            <span class="kpi-sub">{{ stats?.pendingJobs ?? 0 }} active repairs</span>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card blue" routerLink="/invoices">
          <div class="kpi-icon"><mat-icon>receipt_long</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-label">Sales Invoices</span>
            <span class="kpi-value">{{ invoiceCount }}</span>
            <span class="kpi-sub">{{ unpaidCount }} unpaid</span>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card green" routerLink="/invoices">
          <div class="kpi-icon"><mat-icon>currency_rupee</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-label">Total Revenue</span>
            <span class="kpi-value">₹ {{ totalRevenue | number:'1.0-0' }}</span>
            <span class="kpi-sub">from all invoices</span>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card orange" routerLink="/purchases">
          <div class="kpi-icon"><mat-icon>shopping_cart</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-label">Purchases</span>
            <span class="kpi-value">{{ purchaseCount }}</span>
            <span class="kpi-sub">₹ {{ totalPurchase | number:'1.0-0' }} spent</span>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card cyan" routerLink="/customers">
          <div class="kpi-icon"><mat-icon>people</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-label">Customers</span>
            <span class="kpi-value">{{ customerCount }}</span>
            <span class="kpi-sub">registered</span>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

        <div class="kpi-card teal" routerLink="/receipts">
          <div class="kpi-icon"><mat-icon>receipt</mat-icon></div>
          <div class="kpi-body">
            <span class="kpi-label">Receipts</span>
            <span class="kpi-value">{{ receiptCount }}</span>
            <span class="kpi-sub">₹ {{ totalReceived | number:'1.0-0' }} collected</span>
          </div>
          <mat-icon class="kpi-arrow">arrow_forward</mat-icon>
        </div>

      </div>

      <!-- ─── Main Content ───────────────────────────────── -->
      <div class="main-grid">

        <!-- Left column: Recent Jobs + Pipeline -->
        <div class="left-col">

          <!-- Job Pipeline -->
          <mat-card class="panel-card pipeline-card" *ngIf="stats">
            <div class="panel-header">
              <div class="panel-title">
                <mat-icon>analytics</mat-icon>
                Repair Job Pipeline
              </div>
              <a class="view-all-link" routerLink="/jobs">View all →</a>
            </div>

            <div class="pipeline-bars">
              <div class="pipeline-row" *ngFor="let item of pipelineItems">
                <div class="pipeline-meta">
                  <div class="pipeline-dot" [style.background]="item.color"></div>
                  <span class="pipeline-name">{{ item.label }}</span>
                  <span class="pipeline-count">{{ item.count }}</span>
                </div>
                <div class="pipeline-track">
                  <div class="pipeline-fill"
                       [style.width.%]="getPercent(item.count)"
                       [style.background]="item.color">
                  </div>
                </div>
              </div>
            </div>

            <div class="pipeline-summary">
              <div class="ps-item">
                <span class="ps-value">{{ stats.deliveredToday }}</span>
                <span class="ps-label">Delivered Today</span>
              </div>
              <mat-divider [vertical]="true"></mat-divider>
              <div class="ps-item">
                <span class="ps-value">{{ stats.readyForPickup }}</span>
                <span class="ps-label">Ready for Pickup</span>
              </div>
              <mat-divider [vertical]="true"></mat-divider>
              <div class="ps-item">
                <span class="ps-value">{{ stats.delivered }}</span>
                <span class="ps-label">Total Delivered</span>
              </div>
            </div>
          </mat-card>

          <!-- Recent Jobs -->
          <mat-card class="panel-card">
            <div class="panel-header">
              <div class="panel-title">
                <mat-icon>history</mat-icon>
                Recent Jobs
              </div>
              <a class="view-all-link" routerLink="/jobs">View all →</a>
            </div>

            <div class="recent-jobs-list" *ngIf="recentJobs.length > 0; else noJobs">
              <div class="job-row" *ngFor="let job of recentJobs" [routerLink]="['/jobs', job.id]">
                <div class="job-avatar">{{ job.customer.name.charAt(0).toUpperCase() }}</div>
                <div class="job-info">
                  <div class="job-name">{{ job.customer.name }}</div>
                  <div class="job-device">{{ job.deviceType || 'Device' }}<span *ngIf="job.brand"> · {{ job.brand }}</span></div>
                </div>
                <span class="status-badge {{ job.status }}">{{ formatStatus(job.status) }}</span>
                <mat-icon class="job-chevron">chevron_right</mat-icon>
              </div>
            </div>
            <ng-template #noJobs>
              <div class="panel-empty">
                <mat-icon>assignment</mat-icon>
                <p>No jobs yet. <a routerLink="/jobs/new">Create one →</a></p>
              </div>
            </ng-template>
          </mat-card>

        </div>

        <!-- Right column: Recent Invoices + Quick Actions -->
        <div class="right-col">

          <!-- Quick Actions -->
          <mat-card class="panel-card quick-actions-card">
            <div class="panel-header">
              <div class="panel-title"><mat-icon>bolt</mat-icon> Quick Actions</div>
            </div>
            <div class="quick-actions-grid">
              <a class="qa-btn" routerLink="/jobs/new">
                <mat-icon>build</mat-icon>
                <span>New Job</span>
              </a>
              <a class="qa-btn" routerLink="/invoices/new">
                <mat-icon>add_circle</mat-icon>
                <span>New Invoice</span>
              </a>
              <a class="qa-btn" routerLink="/quotations/new">
                <mat-icon>request_quote</mat-icon>
                <span>Quotation</span>
              </a>
              <a class="qa-btn" routerLink="/customers/new">
                <mat-icon>person_add</mat-icon>
                <span>Add Customer</span>
              </a>
              <a class="qa-btn" routerLink="/purchases/new">
                <mat-icon>shopping_bag</mat-icon>
                <span>Purchase</span>
              </a>
              <a class="qa-btn" routerLink="/receipts/new">
                <mat-icon>receipt</mat-icon>
                <span>Receipt</span>
              </a>
              <a class="qa-btn" routerLink="/payments/new">
                <mat-icon>payments</mat-icon>
                <span>Payment</span>
              </a>
              <a class="qa-btn" routerLink="/products/new">
                <mat-icon>inventory_2</mat-icon>
                <span>Add Product</span>
              </a>
            </div>
          </mat-card>

          <!-- Recent Invoices -->
          <mat-card class="panel-card">
            <div class="panel-header">
              <div class="panel-title">
                <mat-icon>receipt_long</mat-icon>
                Recent Invoices
              </div>
              <a class="view-all-link" routerLink="/invoices">View all →</a>
            </div>

            <div class="invoice-list" *ngIf="recentInvoices.length > 0; else noInv">
              <div class="invoice-row" *ngFor="let inv of recentInvoices" [routerLink]="['/invoices', inv.id]">
                <div class="inv-left">
                  <span class="inv-number mono-text">{{ inv.invoiceNumber }}</span>
                  <span class="inv-customer">{{ inv.customer?.name || '—' }}</span>
                </div>
                <div class="inv-right">
                  <span class="inv-amount">₹ {{ inv.grandTotal | number:'1.2-2' }}</span>
                  <span class="pill-badge"
                        [class.paid]="inv.status === 'PAID'"
                        [class.unpaid]="inv.status === 'UNPAID'">
                    {{ inv.status }}
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noInv>
              <div class="panel-empty">
                <mat-icon>receipt_long</mat-icon>
                <p>No invoices yet. <a routerLink="/invoices/new">Create one →</a></p>
              </div>
            </ng-template>
          </mat-card>

          <!-- Recent Purchases -->
          <mat-card class="panel-card">
            <div class="panel-header">
              <div class="panel-title">
                <mat-icon>shopping_cart</mat-icon>
                Recent Purchases
              </div>
              <a class="view-all-link" routerLink="/purchases">View all →</a>
            </div>

            <div class="invoice-list" *ngIf="recentPurchases.length > 0; else noPurch">
              <div class="invoice-row" *ngFor="let pur of recentPurchases" [routerLink]="['/purchases', pur.id, 'edit']">
                <div class="inv-left">
                  <span class="inv-number mono-text">{{ pur.invoiceNumber }}</span>
                  <span class="inv-customer">{{ pur.supplier?.name || '—' }}</span>
                </div>
                <div class="inv-right">
                  <span class="inv-amount">₹ {{ pur.grandTotal | number:'1.2-2' }}</span>
                  <span class="pill-badge method">{{ pur.status }}</span>
                </div>
              </div>
            </div>
            <ng-template #noPurch>
              <div class="panel-empty">
                <mat-icon>shopping_cart</mat-icon>
                <p>No purchases yet. <a routerLink="/purchases/new">Add one →</a></p>
              </div>
            </ng-template>
          </mat-card>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ─── Root & Header ───────────────────────────────────── */
    .dashboard-root { padding-bottom: 48px; }

    .dash-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;

      h1 { font-size: 26px; font-weight: 700; }
      p  { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    }

    .header-time {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 13px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: 20px;
      white-space: nowrap;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* ─── KPI Grid ────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--bg-card);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.18s ease, box-shadow 0.18s ease;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity 0.18s;
        background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 28px rgba(0,0,0,.5);
        &::before { opacity: 1; }
        .kpi-arrow { opacity: 1; transform: translateX(0); }
      }
    }

    .kpi-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 26px; width: 26px; height: 26px; color: #fff; }
    }

    .kpi-card.purple .kpi-icon { background: linear-gradient(135deg, #a371f7, #6e40c9); }
    .kpi-card.blue   .kpi-icon { background: linear-gradient(135deg, #58a6ff, #1f6feb); }
    .kpi-card.green  .kpi-icon { background: linear-gradient(135deg, #3fb950, #238636); }
    .kpi-card.orange .kpi-icon { background: linear-gradient(135deg, #db6d28, #bd561d); }
    .kpi-card.cyan   .kpi-icon { background: linear-gradient(135deg, #39d0c8, #0891b2); }
    .kpi-card.teal   .kpi-icon { background: linear-gradient(135deg, #10b981, #059669); }

    .kpi-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .kpi-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .kpi-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kpi-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .kpi-arrow {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 0.18s, transform 0.18s;
      flex-shrink: 0;
    }

    /* ─── Main Grid ───────────────────────────────────────── */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 1100px) {
      .main-grid { grid-template-columns: 1fr; }
    }

    .left-col, .right-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ─── Panel Card ──────────────────────────────────────── */
    .panel-card {
      padding: 0 !important;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--border);
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--accent-blue);
      }
    }

    .view-all-link {
      font-size: 12px;
      color: var(--accent-blue);
      text-decoration: none;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .panel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 10px;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); }
      p { font-size: 13px; color: var(--text-secondary); }
      a { color: var(--accent-blue); text-decoration: none; &:hover { text-decoration: underline; } }
    }

    /* ─── Pipeline Card ───────────────────────────────────── */
    .pipeline-bars {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .pipeline-row { display: flex; flex-direction: column; gap: 6px; }

    .pipeline-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pipeline-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .pipeline-name {
      flex: 1;
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .pipeline-count {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      min-width: 24px;
      text-align: right;
    }

    .pipeline-track {
      height: 6px;
      background: var(--bg-elevated);
      border-radius: 3px;
      overflow: hidden;
    }

    .pipeline-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 4px;
    }

    .pipeline-summary {
      display: flex;
      align-items: stretch;
      border-top: 1px solid var(--border);

      mat-divider { background: var(--border); }
    }

    .ps-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 0;
      gap: 3px;
    }

    .ps-value {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
    }

    .ps-label {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      font-weight: 500;
    }

    /* ─── Recent Jobs ─────────────────────────────────────── */
    .recent-jobs-list { padding: 8px 0; }

    .job-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      cursor: pointer;
      border-bottom: 1px solid var(--border);
      transition: background 0.14s;

      &:last-child { border-bottom: none; }
      &:hover { background: rgba(88,166,255,.04); }
    }

    .job-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #fff;
      flex-shrink: 0;
    }

    .job-info {
      flex: 1;
      min-width: 0;
    }

    .job-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .job-device {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .job-chevron {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    /* ─── Status Badge (Job statuses) ─────────────────────── */
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .status-badge.RECEIVED      { background: rgba(88,166,255,.15); color: #58a6ff; }
    .status-badge.DIAGNOSING    { background: rgba(163,113,247,.15); color: #a371f7; }
    .status-badge.AWAITING_PARTS{ background: rgba(210,153,34,.15); color: #d29922; }
    .status-badge.IN_REPAIR     { background: rgba(57,208,200,.15); color: #39d0c8; }
    .status-badge.READY         { background: rgba(63,185,80,.15); color: #3fb950; }
    .status-badge.DELIVERED     { background: rgba(110,118,129,.15); color: #8b949e; }

    /* ─── Quick Actions ───────────────────────────────────── */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: var(--border);
      border-top: 1px solid var(--border);
    }

    .qa-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 18px 8px;
      background: var(--bg-card);
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: background 0.14s, color 0.14s;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: var(--accent-blue);
        transition: transform 0.15s;
      }

      &:hover {
        background: rgba(88,166,255,.08);
        color: var(--text-primary);
        mat-icon { transform: scale(1.15); }
      }
    }

    /* ─── Invoice / Purchase Rows ──────────────────────────── */
    .invoice-list { padding: 4px 0; }

    .invoice-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.14s;

      &:last-child { border-bottom: none; }
      &:hover { background: rgba(88,166,255,.04); }
    }

    .inv-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .inv-number { font-size: 12px; }

    .inv-customer {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .inv-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
    }

    .inv-amount {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  today = new Date();
  greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  // Derived counts
  invoiceCount = 0;
  unpaidCount = 0;
  totalRevenue = 0;
  purchaseCount = 0;
  totalPurchase = 0;
  customerCount = 0;
  receiptCount = 0;
  totalReceived = 0;

  recentJobs: JobSheet[] = [];
  recentInvoices: SalesInvoice[] = [];
  recentPurchases: PurchaseInvoice[] = [];

  pipelineItems = [
    { label: 'Received',       count: 0, color: '#58a6ff' },
    { label: 'Diagnosing',     count: 0, color: '#a371f7' },
    { label: 'Awaiting Parts', count: 0, color: '#d29922' },
    { label: 'In Repair',      count: 0, color: '#39d0c8' },
    { label: 'Ready for Pickup', count: 0, color: '#3fb950' },
  ];

  constructor(
    private jobSvc: JobSheetService,
    private invoiceSvc: SalesInvoiceService,
    private purchaseSvc: PurchaseService,
    private customerSvc: CustomerService,
    private receiptSvc: ReceiptService
  ) {}

  ngOnInit(): void {
    // Load job stats
    this.jobSvc.getStats().subscribe({
      next: (data: any) => {
        this.stats = data;
        this.recentJobs = (data.recentJobs || []).slice(0, 6);
        this.pipelineItems[0].count = data.received || 0;
        this.pipelineItems[1].count = data.diagnosing || 0;
        this.pipelineItems[2].count = data.awaitingParts || 0;
        this.pipelineItems[3].count = data.inRepair || 0;
        this.pipelineItems[4].count = data.readyForPickup || 0;
      },
      error: (err: any) => console.error('Dashboard stats error', err)
    });

    // Load invoices
    this.invoiceSvc.getAll().subscribe({
      next: (invs) => {
        this.invoiceCount = invs.length;
        this.unpaidCount = invs.filter(i => i.status === 'UNPAID').length;
        this.totalRevenue = invs.reduce((s, i) => s + (i.grandTotal || 0), 0);
        this.recentInvoices = [...invs].reverse().slice(0, 6);
      },
      error: () => {}
    });

    // Load purchases
    this.purchaseSvc.getAll().subscribe({
      next: (purs) => {
        this.purchaseCount = purs.length;
        this.totalPurchase = purs.reduce((s, p) => s + (p.grandTotal || 0), 0);
        this.recentPurchases = [...purs].reverse().slice(0, 5);
      },
      error: () => {}
    });

    // Load customers
    this.customerSvc.getAll().subscribe({
      next: (custs) => { this.customerCount = custs.length; },
      error: () => {}
    });

    // Load receipts
    this.receiptSvc.getAll().subscribe({
      next: (recs: any[]) => {
        this.receiptCount = recs.length;
        this.totalReceived = recs.reduce((s: number, r: any) => s + (r.amount || 0), 0);
      },
      error: () => {}
    });
  }

  getPercent(count: number): number {
    if (!count || !this.stats || this.stats.totalJobs === 0) return 0;
    return Math.max(4, (count / this.stats.totalJobs) * 100);
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      RECEIVED: 'Received',
      DIAGNOSING: 'Diagnosing',
      AWAITING_PARTS: 'Awaiting Parts',
      IN_REPAIR: 'In Repair',
      READY: 'Ready',
      DELIVERED: 'Delivered'
    };
    return map[status] || status;
  }
}

