import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { JobSheetService } from '../../core/services/job-sheet.service';
import { DashboardStats } from '../../core/models/job-sheet.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatDividerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your repair shop operations</p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid" *ngIf="stats">

        <mat-card class="stat-card">
          <div class="stat-icon purple">
            <mat-icon>handyman</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Jobs</span>
            <span class="stat-value">{{ stats.totalJobs }}</span>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon blue">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Active Repairs</span>
            <span class="stat-value">{{ stats.pendingJobs }}</span>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon green">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Delivered Today</span>
            <span class="stat-value">{{ stats.deliveredToday }}</span>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-icon orange">
            <mat-icon>payments</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Revenue</span>
            <span class="stat-value">Rs. {{ stats.totalRevenue | number:'1.0-0' }}</span>
          </div>
        </mat-card>

      </div>

      <!-- Status Overview -->
      <mat-card class="overview-card" *ngIf="stats">
        <mat-card-header>
          <mat-icon mat-card-avatar class="section-icon">analytics</mat-icon>
          <mat-card-title>Repair Status Overview</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="status-bars">
            <div class="status-row" *ngFor="let item of statusItems">
              <div class="status-header">
                <span class="status-name">{{ item.label }}</span>
                <strong>{{ item.count }}</strong>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="getPercent(item.count)"
                [color]="item.matColor">
              </mat-progress-bar>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,.4) !important;
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #fff; }
    }
    .stat-icon.purple { background: linear-gradient(135deg, #a371f7, #6e40c9); }
    .stat-icon.blue   { background: linear-gradient(135deg, #58a6ff, #1f6feb); }
    .stat-icon.green  { background: linear-gradient(135deg, #3fb950, #238636); }
    .stat-icon.orange { background: linear-gradient(135deg, #db6d28, #bd561d); }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
      margin-top: 2px;
    }

    .overview-card {
      .section-icon {
        background: rgba(88,166,255,.1);
        color: var(--accent-blue);
        border-radius: 10px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .status-bars {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 8px;
    }

    .status-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .status-header strong {
      font-size: 14px;
      color: var(--text-primary);
    }

    mat-progress-bar {
      border-radius: 4px;
      height: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  statusItems: { label: string; count: number; matColor: 'primary' | 'accent' | 'warn' }[] = [];

  constructor(private jobSvc: JobSheetService) {}

  ngOnInit(): void {
    this.jobSvc.getStats().subscribe({
      next: (data: any) => {
        this.stats = data;
        this.statusItems = [
          { label: 'Received',       count: data.received || 0,       matColor: 'primary' },
          { label: 'Diagnosing',     count: data.diagnosing || 0,     matColor: 'accent' },
          { label: 'Awaiting Parts', count: data.awaitingParts || 0,  matColor: 'warn' },
          { label: 'In Repair',      count: data.inRepair || 0,       matColor: 'accent' },
          { label: 'Ready',          count: data.readyForPickup || 0, matColor: 'primary' },
        ];
      },
      error: (err: any) => console.error('Failed to load dashboard stats', err)
    });
  }

  getPercent(count?: number): number {
    if (!count || !this.stats || this.stats.totalJobs === 0) return 0;
    return (count / this.stats.totalJobs) * 100;
  }
}
