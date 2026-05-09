import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JobSheetService } from '../../../core/services/job-sheet.service';
import { CustomerService } from '../../../core/services/customer.service';
import { LookupService, Brand, CommonIssue } from '../../../core/services/lookup.service';
import { UserService } from '../../../core/services/user.service';
import { JOB_STATUSES } from '../../../core/models/job-sheet.model';
import { Customer } from '../../../core/models/customer.model';
import { User } from '../../../core/models/user.model';
import { CustomerFormComponent } from '../../customers/customer-form/customer-form.component';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatDividerModule,
    MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Edit Job Sheet #JOB-' + jobId : 'New Job Sheet' }}</h1>
          <p>{{ isEdit ? 'Update repair job details' : 'Create a new repair job record' }}</p>
        </div>
        <a mat-stroked-button routerLink="/jobs">
          <mat-icon>arrow_back</mat-icon>
          Back
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">

        <!-- Customer & Device Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">person</mat-icon>
            <h3>Customer & Device</h3>
          </div>

          <div class="form-grid">
            <div class="span-2">
              <div class="customer-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Customer</mat-label>
                  <mat-select formControlName="customerId">
                    <mat-option *ngFor="let c of customers" [value]="c.id">
                      {{ c.name }} — {{ c.phone }}
                    </mat-option>
                  </mat-select>
                  <mat-error>Customer is required</mat-error>
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="addCustomer()" class="inline-btn">
                  <mat-icon>person_add</mat-icon> New
                </button>
                <button mat-icon-button type="button" (click)="loadCustomers()" matTooltip="Refresh">
                  <mat-icon>refresh</mat-icon>
                </button>
              </div>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Device Type</mat-label>
              <mat-select formControlName="deviceType">
                <mat-option value="">-- Select Device --</mat-option>
                <mat-option *ngFor="let dt of deviceTypes" [value]="dt">{{ dt }}</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="field-with-add">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Brand</mat-label>
                <mat-select formControlName="brand">
                  <mat-option value="">-- Select Brand --</mat-option>
                  <mat-option *ngFor="let b of brands" [value]="b.name">{{ b.name }}</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-icon-button type="button" (click)="addBrand()" matTooltip="Add Brand">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Model</mat-label>
              <input matInput formControlName="model" placeholder="e.g. Inspiron 15">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Serial Number</mat-label>
              <input matInput formControlName="serialNumber">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Technician</mat-label>
              <mat-select formControlName="technician">
                <mat-option value="">-- Select Technician --</mat-option>
                <mat-option *ngFor="let t of technicians" [value]="t.fullName">{{ t.fullName }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card>

        <!-- Problem Details Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">build</mat-icon>
            <h3>Problem Details</h3>
          </div>

          <div class="form-grid">
            <div class="span-2">
              <div class="field-with-add" style="margin-bottom: 8px;">
                <mat-form-field appearance="outline" class="flex-1" subscriptSizing="dynamic">
                  <mat-label>Common Issue</mat-label>
                  <mat-select (selectionChange)="onIssueSelect($event.value)">
                    <mat-option *ngFor="let i of issues" [value]="i.issue">{{ i.issue }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-icon-button type="button" (click)="addIssue()" matTooltip="Add Issue">
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Problem Description</mat-label>
                <textarea matInput formControlName="problemDescription" rows="4"
                          placeholder="Specific problem details..."></textarea>
                <mat-error>Problem description is required</mat-error>
              </mat-form-field>
            </div>

            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Accessories Received</mat-label>
                <textarea matInput formControlName="accessories" rows="2"
                          placeholder="e.g. Power adapter, Mouse, Bag"></textarea>
              </mat-form-field>
            </div>
          </div>
        </mat-card>

        <!-- Cost & Status Section -->
        <mat-card class="form-section">
          <div class="section-header">
            <mat-icon class="section-icon">payments</mat-icon>
            <h3>Cost & Status</h3>
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Estimated Cost (Rs.)</mat-label>
              <input matInput type="number" formControlName="estimatedCost" min="0">
              <mat-icon matPrefix>currency_rupee</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Final Cost (Rs.)</mat-label>
              <input matInput type="number" formControlName="finalCost" min="0">
              <mat-icon matPrefix>currency_rupee</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option *ngFor="let s of statuses" [value]="s.value">{{ s.label }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Received Date</mat-label>
              <input matInput [matDatepicker]="recPicker" formControlName="receivedDate">
              <mat-datepicker-toggle matIconSuffix [for]="recPicker"></mat-datepicker-toggle>
              <mat-datepicker #recPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Expected Delivery Date</mat-label>
              <input matInput [matDatepicker]="delPicker" formControlName="deliveryDate">
              <mat-datepicker-toggle matIconSuffix [for]="delPicker"></mat-datepicker-toggle>
              <mat-datepicker #delPicker></mat-datepicker>
            </mat-form-field>

            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Internal Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" placeholder="Internal notes..."></textarea>
              </mat-form-field>
            </div>
            
            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Material Used (Spares)</mat-label>
                <textarea matInput formControlName="materialUsed" rows="2" placeholder="List of materials/spares used..."></textarea>
              </mat-form-field>
            </div>

            <div class="span-2">
              <mat-form-field appearance="outline">
                <mat-label>Action Taken</mat-label>
                <textarea matInput formControlName="actionTaken" rows="2" placeholder="Repair actions performed..."></textarea>
              </mat-form-field>
            </div>
          </div>
        </mat-card>

        <!-- Actions -->
        <div class="form-actions">
          <a mat-stroked-button routerLink="/jobs">Cancel</a>
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <mat-icon>{{ isEdit ? 'save' : 'add_circle' }}</mat-icon>
            {{ loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Create Job Sheet') }}
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .section-icon {
      color: var(--accent-blue);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .section-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }

    .span-2 { grid-column: span 2; }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }

    .customer-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field-with-add {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .flex-1 { flex: 1; }

    .inline-btn {
      height: 56px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 40px;
    }
  `]
})
export class JobFormComponent implements OnInit {
  customers: Customer[] = [];
  brands: Brand[] = [];
  technicians: User[] = [];
  issues: CommonIssue[] = [];
  statuses    = JOB_STATUSES;
  deviceTypes = ['Laptop', 'Desktop', 'Printer', 'Monitor', 'Phone', 'Tablet', 'Other'];
  isEdit      = false;
  loading     = false;
  jobId?: number;

  form = this.fb.group({
    customerId:         ['' as any, Validators.required],
    deviceType:         [''],
    brand:              [''],
    model:              [''],
    serialNumber:       [''],
    problemDescription: ['', Validators.required],
    accessories:        [''],
    technician:         [''],
    estimatedCost:      [null as number | null],
    finalCost:          [null as number | null],
    status:             ['RECEIVED'],
    notes:              [''],
    materialUsed:       [''],
    actionTaken:        [''],
    receivedDate:       [this.today()],
    deliveryDate:       [''],
  });

  constructor(
    private fb: FormBuilder,
    private svc: JobSheetService,
    private custSvc: CustomerService,
    private lookupSvc: LookupService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.lookupSvc.getBrands().subscribe(b => this.brands = b);
    this.loadTechnicians();
    this.lookupSvc.getIssues().subscribe(i => this.issues = i);

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.jobId  = +id;
      this.svc.getById(+id).subscribe(j => {
        this.form.patchValue({
          ...(j as any),
          customerId:   j.customer?.id ?? '',
          receivedDate: j.receivedDate ?? '',
          deliveryDate: j.deliveryDate ?? '',
        });
      });
    }
  }

  loadCustomers() {
    this.custSvc.getAll().subscribe(c => (this.customers = c));
  }

  addCustomer() {
    const dialogRef = this.dialog.open(CustomerFormComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: Customer | undefined) => {
      if (result) {
        this.customers.push(result);
        this.form.patchValue({ customerId: result.id });
        this.snackBar.open('Customer created!', 'OK', { duration: 3000 });
      }
    });
  }

  addBrand() {
    const name = prompt('Enter new brand name:');
    if (name) this.lookupSvc.createBrand({ name }).subscribe(b => {
      this.brands.push(b);
      this.form.patchValue({ brand: b.name });
    });
  }

  loadTechnicians() {
    this.userService.getAll().subscribe(users => {
      this.technicians = users;
    });
  }



  addIssue() {
    const issue = prompt('Enter new common issue:');
    if (issue) this.lookupSvc.createIssue({ issue }).subscribe(i => {
      this.issues.push(i);
      this.onIssueSelect(i.issue);
    });
  }

  onIssueSelect(val: string) {
    if (!val) return;
    const current = this.form.get('problemDescription')?.value || '';
    this.form.patchValue({
      problemDescription: current ? current + '\n' + val : val
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const val = this.form.value;
    const payload = {
      ...val,
      customerId:   +val.customerId,
      receivedDate: val.receivedDate ? this.formatDate(val.receivedDate) : null,
      deliveryDate: val.deliveryDate ? this.formatDate(val.deliveryDate) : null,
    };
    const req = this.isEdit
      ? this.svc.update(this.jobId!, payload)
      : this.svc.create(payload);
    req.subscribe({
      next: j => {
        this.snackBar.open(`Job ${this.isEdit ? 'updated' : 'created'} successfully!`, 'OK', { duration: 3000 });
        this.router.navigate(['/jobs', j.id]);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error saving job.', 'OK', { duration: 3000 });
      },
    });
  }

  private today(): string {
    const d = new Date();
    return this.formatDate(d);
  }

  private formatDate(d: any): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
