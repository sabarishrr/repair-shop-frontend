import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportService } from '../../../core/services/report.service';
import { CompanyDetailsService, CompanyDetails } from '../../../core/services/company-details.service';
import { ReportSummaryResponse } from '../../../core/models/report.model';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatIconModule, MatProgressBarModule,
    MatButtonModule, MatTooltipModule, MatDividerModule, MatTabsModule
  ],
  template: `
    <div class="page-container reports-root">

      <!-- ─── Print Header (Only visible in A4 Printouts) ────────────────── -->
      <div class="print-only print-header">
        <div class="print-brand">
          <mat-icon>build</mat-icon>
          <span class="print-brand-name">{{ company?.companyName || 'TECHFIX PRO' }}</span>
        </div>
        <div class="print-report-title">PERIODIC BUSINESS ANALYTICS REPORT</div>
        <div class="print-meta">
          <span><strong>Period:</strong> {{ startDate | date:'longDate' }} to {{ endDate | date:'longDate' }}</span>
          <span><strong>Generated On:</strong> {{ today | date:'medium' }}</span>
        </div>
        <mat-divider style="margin: 15px 0 25px;"></mat-divider>
      </div>

      <!-- ─── Control & Filter Bar (Hidden in Print) ────────────────────── -->
      <div class="filter-bar no-print">
        <div class="title-section">
          <h1>Business Reports</h1>
          <p>Gain insights and analyze performance of your repair business.</p>
        </div>

        <div class="controls-section">
          <!-- Date Selectors -->
          <div class="date-inputs">
            <div class="input-group">
              <label>Start Date</label>
              <input type="date" [(ngModel)]="startDate" (change)="loadReport()">
            </div>
            <div class="input-group">
              <label>End Date</label>
              <input type="date" [(ngModel)]="endDate" (change)="loadReport()">
            </div>
          </div>

          <!-- Presets -->
          <div class="presets-row">
            <button mat-stroked-button (click)="setPreset('today')">Today</button>
            <button mat-stroked-button (click)="setPreset('last7')">7 Days</button>
            <button mat-stroked-button (click)="setPreset('thisMonth')">This Month</button>
            <button mat-stroked-button (click)="setPreset('lastMonth')">Last Month</button>
            <button mat-stroked-button (click)="setPreset('ytd')">YTD</button>
          </div>

          <!-- Print / Action -->
          <button mat-flat-button color="primary" class="print-btn" (click)="printReport()">
            <mat-icon>print</mat-icon>
            Print Report
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <span>Compiling report analytics...</span>
      </div>

      <!-- Error State -->
      <div class="error-panel" *ngIf="error">
        <mat-icon>warning</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadReport()">Retry</button>
      </div>

      <!-- ─── Main Content Tabs ─────────────────────────────────────────── -->
      <mat-tab-group class="reports-tabs" *ngIf="report && !loading && !error" [dynamicHeight]="true">

        <!-- ================= T1: SALES & REVENUE ================= -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">payments</mat-icon>
            Sales & Revenue
          </ng-template>

          <div class="tab-content">
            <!-- KPIs -->
            <div class="kpi-grid">
              <div class="kpi-card green-glow">
                <span class="kpi-label">Gross Sales Invoices</span>
                <span class="kpi-value">₹ {{ report.salesReport.totalSalesAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">{{ report.salesReport.totalSalesCount }} active invoices</span>
              </div>
              <div class="kpi-card red-glow">
                <span class="kpi-label">Sales Refunds (CN)</span>
                <span class="kpi-value">₹ {{ report.salesReport.totalRefundsAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">{{ report.salesReport.totalRefundsCount }} credit notes</span>
              </div>
              <div class="kpi-card purple-glow">
                <span class="kpi-label">Net Store Income</span>
                <span class="kpi-value">₹ {{ report.salesReport.netSalesAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">Total sales minus refunds</span>
              </div>
              <div class="kpi-card blue-glow">
                <span class="kpi-label">Receipts Collected</span>
                <span class="kpi-value">₹ {{ report.salesReport.totalReceiptsAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">Cash received in period</span>
              </div>
            </div>

            <!-- Detailed Grid Split -->
            <div class="sub-grid">
              <!-- Left: Splits and Tax rates -->
              <div class="sub-column">
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Revenue Splits</h3>
                  </div>
                  <div class="splits-body">
                    <!-- Cash vs Credit -->
                    <div class="split-progress">
                      <div class="progress-labels">
                        <span>Cash Sales (₹ {{ report.salesReport.cashSalesAmount | number:'1.0-0' }})</span>
                        <span>Credit Sales (₹ {{ report.salesReport.creditSalesAmount | number:'1.0-0' }})</span>
                      </div>
                      <div class="custom-progress">
                        <div class="progress-fill cash" [style.width.%]="getCashPercent()"></div>
                        <div class="progress-fill credit" [style.width.%]="getCreditPercent()"></div>
                      </div>
                    </div>

                    <mat-divider style="margin: 20px 0;"></mat-divider>

                    <!-- Payment Methods -->
                    <h4>Payment Methods Breakdown</h4>
                    <div class="payment-method-row" *ngFor="let method of getPaymentMethods()">
                      <div class="pm-info">
                        <span class="pm-name">{{ formatMethodName(method.key) }}</span>
                        <span class="pm-val">₹ {{ method.val | number:'1.2-2' }}</span>
                      </div>
                      <div class="pm-track">
                        <div class="pm-fill" [style.width.%]="getMethodPercent(method.val)"></div>
                      </div>
                    </div>
                  </div>
                </mat-card>

                <!-- Tax splits -->
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Tax Collection Split (Net)</h3>
                  </div>
                  <div class="tax-body">
                    <table class="premium-table">
                      <thead>
                        <tr>
                          <th>Tax Category</th>
                          <th class="text-right">Taxable Value</th>
                          <th class="text-right">CGST</th>
                          <th class="text-right">SGST</th>
                          <th class="text-right">IGST</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Outward Supplies</strong></td>
                          <td class="text-right">₹ {{ report.salesReport.taxSplit.taxableValue | number:'1.2-2' }}</td>
                          <td class="text-right">₹ {{ report.salesReport.taxSplit.cgst | number:'1.2-2' }}</td>
                          <td class="text-right">₹ {{ report.salesReport.taxSplit.sgst | number:'1.2-2' }}</td>
                          <td class="text-right">₹ {{ report.salesReport.taxSplit.igst | number:'1.2-2' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </mat-card>
              </div>

              <!-- Right: Detailed Invoices list -->
              <div class="sub-column flex-2">
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Detailed Sales Ledger</h3>
                  </div>
                  <div class="ledger-body">
                    <table class="premium-table">
                      <thead>
                        <tr>
                          <th>Invoice No</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th class="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let inv of report.salesReport.invoices" [class.cancelled-row]="inv.status === 'CANCELLED'">
                          <td class="mono-text">{{ inv.invoiceNumber }}</td>
                          <td>{{ inv.customer?.name }}</td>
                          <td>{{ inv.invoiceDate | date:'mediumDate' }}</td>
                          <td><span class="type-badge" [class.cash]="inv.salesType === 'CASH'">{{ inv.salesType }}</span></td>
                          <td><span class="status-badge" [class.paid]="inv.status === 'PAID'" [class.cancelled]="inv.status === 'CANCELLED'">{{ inv.status }}</span></td>
                          <td class="text-right font-bold">₹ {{ inv.grandTotal | number:'1.2-2' }}</td>
                        </tr>
                        <tr *ngIf="report.salesReport.invoices.length === 0">
                          <td colspan="6" class="text-center text-muted">No sales invoices found in this period.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- ================= T2: PURCHASES & EXPENSES ================= -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">shopping_cart</mat-icon>
            Purchases & Expenses
          </ng-template>

          <div class="tab-content">
            <!-- KPIs -->
            <div class="kpi-grid">
              <div class="kpi-card orange-glow">
                <span class="kpi-label">Gross Purchases</span>
                <span class="kpi-value">₹ {{ report.purchaseReport.totalPurchasesAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">{{ report.purchaseReport.totalPurchasesCount }} invoices</span>
              </div>
              <div class="kpi-card pink-glow">
                <span class="kpi-label">Purchase Returns (DN)</span>
                <span class="kpi-value">₹ {{ report.purchaseReport.totalDebitNotesAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">{{ report.purchaseReport.totalDebitNotesCount }} debit notes</span>
              </div>
              <div class="kpi-card red-glow">
                <span class="kpi-label">Net Purchases</span>
                <span class="kpi-value">₹ {{ report.purchaseReport.netPurchasesAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">Total expense on products</span>
              </div>
              <div class="kpi-card cyan-glow">
                <span class="kpi-label">Supplier Payments</span>
                <span class="kpi-value">₹ {{ report.purchaseReport.totalPaymentsAmount | number:'1.2-2' }}</span>
                <span class="kpi-sub">Actual amount paid out</span>
              </div>
            </div>

            <!-- Split Grid -->
            <div class="sub-grid">
              <!-- Left: Tax Inward ITC -->
              <div class="sub-column">
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Inward Tax Credit Split (Net ITC)</h3>
                  </div>
                  <div class="tax-body">
                    <table class="premium-table">
                      <thead>
                        <tr>
                          <th>Tax Category</th>
                          <th class="text-right">Taxable Value</th>
                          <th class="text-right">CGST</th>
                          <th class="text-right">SGST</th>
                          <th class="text-right">IGST</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Inward Supplies (ITC)</strong></td>
                          <td class="text-right">₹ {{ report.purchaseReport.taxSplit.taxableValue | number:'1.2-2' }}</td>
                          <td class="text-right">₹ {{ report.purchaseReport.taxSplit.cgst | number:'1.2-2' }}</td>
                          <td class="text-right">₹ {{ report.purchaseReport.taxSplit.sgst | number:'1.2-2' }}</td>
                          <td class="text-right">₹ {{ report.purchaseReport.taxSplit.igst | number:'1.2-2' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </mat-card>
              </div>

              <!-- Right: Detailed Purchases list -->
              <div class="sub-column flex-2">
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Detailed Purchases Ledger</h3>
                  </div>
                  <div class="ledger-body">
                    <table class="premium-table">
                      <thead>
                        <tr>
                          <th>Invoice No</th>
                          <th>Supplier</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th class="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let pur of report.purchaseReport.invoices" [class.cancelled-row]="pur.status === 'CANCELLED'">
                          <td class="mono-text">{{ pur.invoiceNumber }}</td>
                          <td>{{ pur.supplier?.name }}</td>
                          <td>{{ pur.invoiceDate | date:'mediumDate' }}</td>
                          <td><span class="status-badge" [class.paid]="pur.status === 'RECEIVED'" [class.cancelled]="pur.status === 'CANCELLED'">{{ pur.status }}</span></td>
                          <td class="text-right font-bold">₹ {{ pur.grandTotal | number:'1.2-2' }}</td>
                        </tr>
                        <tr *ngIf="report.purchaseReport.invoices.length === 0">
                          <td colspan="5" class="text-center text-muted">No purchase invoices found in this period.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- ================= T3: JOB & REPAIR ANALYTICS ================= -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">handyman</mat-icon>
            Jobs & Repairs
          </ng-template>

          <div class="tab-content">
            <div class="kpi-grid">
              <div class="kpi-card purple-glow">
                <span class="kpi-label">Jobs Created</span>
                <span class="kpi-value">{{ report.jobSheetReport.totalJobsCreated }}</span>
                <span class="kpi-sub">Total incoming repairs</span>
              </div>
              <div class="kpi-card green-glow">
                <span class="kpi-label">Jobs Delivered</span>
                <span class="kpi-value">{{ getStatusCount('DELIVERED') }}</span>
                <span class="kpi-sub">{{ getDeliveredPercent() | number:'1.0-0' }}% completion rate</span>
              </div>
              <div class="kpi-card orange-glow">
                <span class="kpi-label">Active / Pending Repairs</span>
                <span class="kpi-value">{{ getPendingJobsCount() }}</span>
                <span class="kpi-sub">Jobs in progress</span>
              </div>
            </div>

            <!-- Job Splits -->
            <div class="sub-grid">
              <!-- Left Column: Status Pipeline & Brand share -->
              <div class="sub-column">
                <!-- Pipeline status list -->
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Repair Pipeline Status</h3>
                  </div>
                  <div class="pipeline-body" style="padding: 15px 20px;">
                    <div class="pipeline-row" *ngFor="let item of getPipelineItems()">
                      <div class="pipeline-meta">
                        <div class="pipeline-dot" [style.background]="item.color"></div>
                        <span class="pipeline-name">{{ item.label }}</span>
                        <span class="pipeline-count">{{ item.count }}</span>
                      </div>
                      <div class="pipeline-track">
                        <div class="pipeline-fill" [style.width.%]="getJobPercent(item.count)" [style.background]="item.color"></div>
                      </div>
                    </div>
                  </div>
                </mat-card>

                <!-- Brand leaderboard -->
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Device Brand Popularity</h3>
                  </div>
                  <div class="brands-body" style="padding: 15px 20px;">
                    <div class="payment-method-row" *ngFor="let b of getBrandsLimit()">
                      <div class="pm-info">
                        <span class="pm-name">{{ b.key }}</span>
                        <span class="pm-val">{{ b.val }} jobs ({{ getBrandPercent(b.val) | number:'1.0-0' }}%)</span>
                      </div>
                      <div class="pm-track">
                        <div class="pm-fill brand" [style.width.%]="getBrandPercent(b.val)"></div>
                      </div>
                    </div>
                    <div *ngIf="objectKeys(report.jobSheetReport.brandCounts).length === 0" class="text-center text-muted" style="padding: 20px 0;">No brand records found.</div>
                  </div>
                </mat-card>
              </div>

              <!-- Right Column: Technician Leaderboards -->
              <div class="sub-column flex-2">
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Technician Performance & Revenue Leaderboard</h3>
                  </div>
                  <div class="ledger-body">
                    <table class="premium-table">
                      <thead>
                        <tr>
                          <th>Technician Name</th>
                          <th class="text-center">Jobs Handled</th>
                          <th class="text-right">Estimated Revenue</th>
                          <th class="text-right">Actual Revenue (Final)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let tech of report.jobSheetReport.technicianPerformance">
                          <td class="font-bold">{{ tech.technician }}</td>
                          <td class="text-center"><span class="badge-round">{{ tech.jobCount }}</span></td>
                          <td class="text-right">₹ {{ tech.totalEstimatedCost | number:'1.2-2' }}</td>
                          <td class="text-right text-success font-bold">₹ {{ tech.totalFinalCost | number:'1.2-2' }}</td>
                        </tr>
                        <tr *ngIf="report.jobSheetReport.technicianPerformance.length === 0">
                          <td colspan="4" class="text-center text-muted">No technician metrics recorded in this period.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- ================= T4: STOCK & INVENTORY ================= -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">inventory_2</mat-icon>
            Stock & Inventory
          </ng-template>

          <div class="tab-content">
            <!-- KPIs -->
            <div class="kpi-grid">
              <div class="kpi-card blue-glow">
                <span class="kpi-label">Stock Value (Cost)</span>
                <span class="kpi-value">₹ {{ report.inventoryReport.totalStockValuationPurchase | number:'1.2-2' }}</span>
                <span class="kpi-sub">Total cost valuation</span>
              </div>
              <div class="kpi-card green-glow">
                <span class="kpi-label">Stock Value (Retail)</span>
                <span class="kpi-value">₹ {{ report.inventoryReport.totalStockValuationSale | number:'1.2-2' }}</span>
                <span class="kpi-sub">Potential selling value</span>
              </div>
              <div class="kpi-card" [class.red-glow]="report.inventoryReport.lowStockCount > 0">
                <span class="kpi-label">Low Stock Alerts</span>
                <span class="kpi-value">{{ report.inventoryReport.lowStockCount }}</span>
                <span class="kpi-sub">Items below reorder limit</span>
              </div>
            </div>

            <!-- Split Grid -->
            <div class="sub-grid">
              <!-- Left Column: Low stock alerts list -->
              <div class="sub-column">
                <mat-card class="analytics-card">
                  <div class="card-header alert-header">
                    <mat-icon color="warn">warning</mat-icon>
                    <h3>Low Stock Reorder Alerts</h3>
                  </div>
                  <div class="alerts-body" style="padding: 10px 0;">
                    <div class="low-stock-row" *ngFor="let item of report.inventoryReport.lowStockItems.slice(0, 10)">
                      <div class="ls-left">
                        <span class="ls-name">{{ item.name }}</span>
                        <span class="ls-sub">HSN: {{ item.hsn || '—' }} · Limit: {{ item.reorderLevel }}</span>
                      </div>
                      <span class="alert-qty" [class.danger]="item.stockQuantity === 0">{{ item.stockQuantity }} left</span>
                    </div>
                    <div *ngIf="report.inventoryReport.lowStockItems.length === 0" class="text-center text-muted" style="padding: 40px 0;">
                      <mat-icon style="font-size: 32px; height: 32px; width: 32px; color: green; margin-bottom: 8px;">check_circle</mat-icon>
                      <p>All products are sufficiently stocked!</p>
                    </div>
                    <div class="show-all-link no-print" *ngIf="report.inventoryReport.lowStockItems.length > 10" routerLink="/products">
                      View all low stock products →
                    </div>
                  </div>
                </mat-card>
              </div>

              <!-- Right Column: Top selling spares list -->
              <div class="sub-column flex-2">
                <mat-card class="analytics-card">
                  <div class="card-header">
                    <h3>Top Selling Spares & Services</h3>
                  </div>
                  <div class="ledger-body">
                    <table class="premium-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th class="text-center">Quantity Sold</th>
                          <th class="text-right">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let spare of report.inventoryReport.topSellingSpares">
                          <td class="font-bold">{{ spare.productName }}</td>
                          <td class="text-center"><span class="badge-round">{{ spare.quantitySold }}</span></td>
                          <td class="text-right text-success font-bold">₹ {{ spare.totalRevenue | number:'1.2-2' }}</td>
                        </tr>
                        <tr *ngIf="report.inventoryReport.topSellingSpares.length === 0">
                          <td colspan="3" class="text-center text-muted">No sales items aggregated in this period.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    /* ─── Premium Base and Variables ──────────────────────── */
    .reports-root {
      padding-bottom: 48px;
    }

    h1 { font-size: 26px; font-weight: 700; color: var(--text-primary); }
    h3 { font-size: 15px; font-weight: 600; margin: 0; color: var(--text-primary); }
    h4 { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 0.05em; }

    /* ─── Controls & Filter Bar ────────────────────────────── */
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .title-section p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 3px;
    }

    .controls-section {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
    }

    .date-inputs {
      display: flex;
      gap: 12px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      input[type="date"] {
        background: var(--bg-card);
        border: 1px solid var(--border);
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        width: 140px;
        transition: border-color 0.15s;

        &:focus {
          border-color: var(--accent-blue);
        }
      }
    }

    .presets-row {
      display: flex;
      gap: 6px;
      margin-bottom: 1px;

      button {
        border-radius: 8px !important;
        font-size: 12px;
        color: var(--text-secondary) !important;
        border-color: var(--border) !important;
        padding: 0 10px !important;
        height: 36px !important;
        line-height: 36px !important;

        &:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary) !important;
        }
      }
    }

    .print-btn {
      height: 38px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 6px; }
    }

    /* ─── Loading State ───────────────────────────────────── */
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 15px;
      color: var(--text-secondary);
      font-size: 14px;
      mat-progress-bar { width: 300px; border-radius: 4px; }
    }

    .error-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 12px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px dashed rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-md);
      margin-bottom: 20px;

      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #ef4444; }
      p { font-size: 13px; color: #ef4444; }
    }

    /* ─── KPI STATS Grid ─────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      display: flex;
      flex-direction: column;
      padding: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--bg-card);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--border);
      }
    }

    .kpi-card.green-glow::after { background: #3fb950; }
    .kpi-card.red-glow::after { background: #ef4444; }
    .kpi-card.purple-glow::after { background: #a371f7; }
    .kpi-card.blue-glow::after { background: #58a6ff; }
    .kpi-card.orange-glow::after { background: #db6d28; }
    .kpi-card.pink-glow::after { background: #ec4899; }
    .kpi-card.cyan-glow::after { background: #0891b2; }

    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .kpi-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 5px;
    }

    /* ─── Premium Tabs Navigation ────────────────────────── */
    .reports-tabs ::ng-deep {
      .mat-mdc-tab-header {
        border-bottom: 1px solid var(--border);
        margin-bottom: 20px;
      }
      .mat-mdc-tab {
        height: 48px;
        font-family: inherit;
        .mdc-tab__text-label {
          color: var(--text-secondary) !important;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        &.mdc-tab--active .mdc-tab__text-label {
          color: var(--accent-blue) !important;
        }
      }
      .mat-mdc-tab-body-content {
        padding-top: 8px;
      }
      .mat-mdc-tab-group-active-indicator-wrapper {
        background-color: var(--accent-blue);
      }
    }

    .tab-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* ─── Detailed Grid Splits ────────────────────────────── */
    .sub-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 1000px) {
      .sub-grid { grid-template-columns: 1fr; }
    }

    .sub-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .flex-2 {
      flex: 2;
    }

    .analytics-card {
      padding: 0 !important;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .card-header.alert-header {
      border-bottom-color: rgba(239, 68, 68, 0.2);
    }

    /* ─── Premium Tables ─────────────────────────────────── */
    .premium-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: var(--bg-elevated);
        color: var(--text-secondary);
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid var(--border);
      }

      td {
        padding: 12px 16px;
        font-size: 13px;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border);
      }

      tr:last-child td {
        border-bottom: none;
      }

      tr:hover td {
        background: rgba(255,255,255,0.015);
        color: var(--text-primary);
      }
    }

    .cancelled-row td {
      text-decoration: line-through;
      opacity: 0.5;
    }

    .mono-text {
      font-family: monospace;
      font-size: 12px;
    }

    .text-right { text-align: right !important; }
    .text-center { text-align: center !important; }
    .font-bold { font-weight: 700; color: var(--text-primary); }
    .text-success { color: #3fb950 !important; }

    /* Badges */
    .type-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      background: rgba(163,113,247,0.15);
      color: #a371f7;
    }
    .type-badge.cash {
      background: rgba(57,208,200,0.15);
      color: #39d0c8;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: rgba(210,153,34,0.15);
      color: #d29922;
    }
    .status-badge.paid {
      background: rgba(63,185,80,0.15);
      color: #3fb950;
    }
    .status-badge.cancelled {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .badge-round {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      border-radius: 12px;
      background: rgba(88,166,255,0.15);
      color: var(--accent-blue);
      font-weight: 700;
      font-size: 11px;
      padding: 0 6px;
    }

    /* ─── Splits & Revenue Body ───────────────────────────── */
    .splits-body {
      padding: 20px;
    }

    .split-progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .custom-progress {
      height: 10px;
      background: var(--bg-elevated);
      border-radius: 5px;
      display: flex;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s;
    }
    .progress-fill.cash { background: #3fb950; }
    .progress-fill.credit { background: #58a6ff; }

    /* Payment progress rows */
    .payment-method-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;

      &:last-child { margin-bottom: 0; }
    }

    .pm-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .pm-name { color: var(--text-primary); }

    .pm-track {
      height: 6px;
      background: var(--bg-elevated);
      border-radius: 3px;
      overflow: hidden;
    }

    .pm-fill {
      height: 100%;
      background: var(--accent-blue);
      border-radius: 3px;
      transition: width 0.3s;
    }

    .pm-fill.brand { background: #a371f7; }

    /* ─── Pipeline Body (Jobs) ────────────────────────────── */
    .pipeline-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 12px;
      &:last-child { margin-bottom: 0; }
    }

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
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .pipeline-count {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
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
      transition: width 0.3s;
    }

    /* ─── Inventory Low Stock Row ─────────────────────────── */
    .low-stock-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);

      &:last-child { border-bottom: none; }
    }

    .ls-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .ls-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ls-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    .alert-qty {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(210,153,34,0.12);
      color: #d29922;
      border: 1px solid rgba(210,153,34,0.2);
    }
    .alert-qty.danger {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .show-all-link {
      display: block;
      text-align: center;
      padding: 10px 0 5px;
      font-size: 12px;
      color: var(--accent-blue);
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    /* ─── Print & A4 Rules ────────────────────────────────── */
    .print-only { display: none; }

    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }

      .reports-root {
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
      }

      /* Reset card styling for paper */
      mat-card, .kpi-card {
        background: #fff !important;
        border: 1px solid #ddd !important;
        color: #000 !important;
        box-shadow: none !important;
        margin-bottom: 20px !important;
        page-break-inside: avoid;
      }

      .kpi-grid {
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 10px !important;
        margin-bottom: 20px !important;
      }

      .kpi-card {
        padding: 10px !important;
        &::after { display: none !important; }
      }

      .kpi-value {
        font-size: 18px !important;
        color: #000 !important;
      }

      .kpi-label {
        color: #555 !important;
        font-size: 9px !important;
      }

      .sub-grid {
        grid-template-columns: 1fr !important;
        gap: 15px !important;
      }

      .premium-table {
        th {
          background: #eee !important;
          color: #000 !important;
          border-bottom: 2px solid #555 !important;
        }
        td {
          border-bottom: 1px solid #ddd !important;
          color: #111 !important;
        }
      }

      .progress-fill, .pm-fill {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .print-header {
        margin-bottom: 20px;
      }

      .print-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;
        font-weight: 700;
        color: #000;
        margin-bottom: 5px;
      }

      .print-report-title {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #333;
        margin-bottom: 10px;
      }

      .print-meta {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #555;
      }
    }
  `]
})
export class ReportsDashboardComponent implements OnInit {
  loading = false;
  error?: string;
  report?: ReportSummaryResponse;
  company?: CompanyDetails;
  today = new Date();

  // Date selections default to current month
  startDate: string = '';
  endDate: string = '';

  constructor(
    private reportSvc: ReportService,
    private companySvc: CompanyDetailsService
  ) {
    this.setDefaultDates();
  }

  ngOnInit(): void {
    this.companySvc.get().subscribe(c => this.company = c);
    this.loadReport();
  }

  setDefaultDates(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = this.formatDate(startOfMonth);
    this.endDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  loadReport(): void {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;
    this.error = undefined;

    this.reportSvc.getReportSummary(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Reports load error', err);
        this.error = 'Failed to load report analytics. Please check backend connection.';
        this.loading = false;
      }
    });
  }

  setPreset(type: string): void {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'last7':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
    }

    this.startDate = this.formatDate(start);
    this.endDate = this.formatDate(end);
    this.loadReport();
  }

  // --- Helper calculations for UI ---
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getCashPercent(): number {
    if (!this.report) return 0;
    const cash = this.report.salesReport.cashSalesAmount;
    const credit = this.report.salesReport.creditSalesAmount;
    const total = cash + credit;
    return total > 0 ? (cash / total) * 100 : 0;
  }

  getCreditPercent(): number {
    if (!this.report) return 0;
    const cash = this.report.salesReport.cashSalesAmount;
    const credit = this.report.salesReport.creditSalesAmount;
    const total = cash + credit;
    return total > 0 ? (credit / total) * 100 : 0;
  }

  getPaymentMethods(): { key: string, val: number }[] {
    if (!this.report) return [];
    const breakdown = this.report.salesReport.paymentMethodBreakdown;
    return Object.keys(breakdown).map(k => ({ key: k, val: breakdown[k] }));
  }

  getMethodPercent(val: number): number {
    if (!this.report) return 0;
    const breakdown = this.report.salesReport.paymentMethodBreakdown;
    const max = Object.values(breakdown).reduce((a, b) => Math.max(a, b), 0);
    return max > 0 ? (val / max) * 100 : 0;
  }

  formatMethodName(method: string): string {
    return method.replace('_', ' ');
  }

  getStatusCount(statusName: string): number {
    if (!this.report) return 0;
    return this.report.jobSheetReport.statusCounts[statusName] || 0;
  }

  getPendingJobsCount(): number {
    if (!this.report) return 0;
    const counts = this.report.jobSheetReport.statusCounts;
    return (counts['RECEIVED'] || 0) +
           (counts['DIAGNOSING'] || 0) +
           (counts['AWAITING_PARTS'] || 0) +
           (counts['IN_REPAIR'] || 0) +
           (counts['READY'] || 0);
  }

  getDeliveredPercent(): number {
    if (!this.report || this.report.jobSheetReport.totalJobsCreated === 0) return 0;
    const delivered = this.getStatusCount('DELIVERED');
    const total = this.report.jobSheetReport.totalJobsCreated;
    return (delivered / total) * 100;
  }

  getPipelineItems() {
    return [
      { label: 'Received',       count: this.getStatusCount('RECEIVED'), color: '#58a6ff' },
      { label: 'Diagnosing',     count: this.getStatusCount('DIAGNOSING'), color: '#a371f7' },
      { label: 'Awaiting Parts', count: this.getStatusCount('AWAITING_PARTS'), color: '#d29922' },
      { label: 'In Repair',      count: this.getStatusCount('IN_REPAIR'), color: '#39d0c8' },
      { label: 'Ready for Pickup', count: this.getStatusCount('READY'), color: '#3fb950' },
    ];
  }

  getJobPercent(count: number): number {
    if (!this.report || this.report.jobSheetReport.totalJobsCreated === 0) return 0;
    return (count / this.report.jobSheetReport.totalJobsCreated) * 100;
  }

  getBrandsLimit(): { key: string, val: number }[] {
    if (!this.report) return [];
    const brands = this.report.jobSheetReport.brandCounts;
    return Object.keys(brands).slice(0, 5).map(k => ({ key: k, val: brands[k] }));
  }

  getBrandPercent(val: number): number {
    if (!this.report || this.report.jobSheetReport.totalJobsCreated === 0) return 0;
    return (val / this.report.jobSheetReport.totalJobsCreated) * 100;
  }

  printReport(): void {
    window.print();
  }
}
