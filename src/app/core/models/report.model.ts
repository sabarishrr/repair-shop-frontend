import { SalesInvoice } from './sales-invoice.model';
import { PurchaseInvoice } from './purchase.model';

export interface TaxSplit {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface SalesReport {
  totalSalesCount: number;
  totalSalesAmount: number;
  totalRefundsCount: number;
  totalRefundsAmount: number;
  netSalesAmount: number;
  totalReceiptsAmount: number;
  cashSalesAmount: number;
  creditSalesAmount: number;
  paymentMethodBreakdown: { [key: string]: number };
  taxSplit: TaxSplit;
  invoices: SalesInvoice[];
}

export interface PurchaseReport {
  totalPurchasesCount: number;
  totalPurchasesAmount: number;
  totalDebitNotesCount: number;
  totalDebitNotesAmount: number;
  netPurchasesAmount: number;
  totalPaymentsAmount: number;
  taxSplit: TaxSplit;
  invoices: PurchaseInvoice[];
}

export interface TechnicianPerformance {
  technician: string;
  jobCount: number;
  totalEstimatedCost: number;
  totalFinalCost: number;
}

export interface JobSheetReport {
  totalJobsCreated: number;
  statusCounts: { [key: string]: number };
  brandCounts: { [key: string]: number };
  technicianPerformance: TechnicianPerformance[];
}

export interface TopProduct {
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface InventoryReport {
  totalStockValuationPurchase: number;
  totalStockValuationSale: number;
  lowStockCount: number;
  lowStockItems: any[]; // List of products
  topSellingSpares: TopProduct[];
}

export interface ReportSummaryResponse {
  startDate: string;
  endDate: string;
  salesReport: SalesReport;
  purchaseReport: PurchaseReport;
  jobSheetReport: JobSheetReport;
  inventoryReport: InventoryReport;
}
