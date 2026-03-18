// src/pages/inventory/types/dashboard.ts

export type PaymentStatus = "PAID" | "UNPAID" | "PARTIAL" | "PENDING" | "OVERDUE";
export type InvoiceState = "DRAFT" | "APPROVED" | "POSTED" | "CANCELLED"; // Define this FIRST

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  page?: number;
  limit?: number;
  paymentStatus?: PaymentStatus | "";
  search?: string;
}

export interface SummaryData {
  totalSales: number;
  totalOrders: number;
  paymentsReceived: number;
  pendingAmount: number;
}

// Updated SaleRecord to match API response
export interface SaleRecord {
  _id: string;
  organizationId: string;
  invoiceNumber: string;
  customer_id: string;
  customerName: string;
  customerGSTIN?: string;
  roomNumber?: string;
  bookingRef?: string;
  items: Array<{
    item_id: string;
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    taxableAmount: number;
    gstPercentage: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
    saleUnitId?: string;
    saleUnitCode?: string;
    baseQty?: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  invoiceState: InvoiceState; // Now this is defined
  paymentStatus: PaymentStatus;
  paidAmount: number;
  outstandingAmount: number;
  advanceAmount: number;
  paymentTerms: string;
  dueDate?: string | null;
  notes?: string;
  taxBreakdown: {
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  };
  stateLog: Array<{
    from?: string;
    to: string;
    by: string;
    note?: string;
    at: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  postedAt?: string;
  postedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  journalEntry_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// PaymentRecord
export interface PaymentRecord {
  _id: string;
  organizationId: string;
  invoice_id: {
    _id: string;
    invoiceNumber: string;
    customerName: string;
  };
  invoiceNumber: string;
  customer_id: string;
  amount: number;
  method: string;
  reference: string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
  journalEntry_id: string | null;
  advancePortion: number;
  notes: string;
  recordedBy: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  pendingAmount: number;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
}

export interface CustomerDashboard {
  summary: CustomerSummary;
  invoices: CustomerInvoice[];
}

export interface InsightsData {
  topCustomer: { name: string; totalSpent: number };
  highestSale: { invoiceNumber: string; amount: number; customerName: string };
  totalPendingInvoices: number;
}

export interface CustomerOption {
  id: string;
  name: string;
}