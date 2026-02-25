export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type ReferenceType = 'PURCHASE' | 'ROOM_USAGE' | 'WASTAGE' | 'MANUAL' | 'ADJUSTMENT';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type UserRole = 'Admin' | 'Accountant' | 'FrontDesk';
export type InvoiceState = 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';
export type LedgerAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type JournalEntryType = 'DEBIT' | 'CREDIT';
export type TaxType = 'CGST' | 'SGST' | 'IGST';
export type PaymentTerms = 'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60';

export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  costPrice: number;
  sellingPrice?: number;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  isPerishable: boolean;
  shelfLifeDays?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  itemName: string;
  batchNumber: string;
  expiryDate: string;
  receivedDate: string;
  receivedQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  invoiceId: string;
  invoiceNumber: string;
  isExpired: boolean;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  type: TransactionType;
  referenceType: ReferenceType;
  quantity: number;
  balanceAfter: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  referenceId?: string;
  batchId?: string;
  batchNumber?: string;
  reason?: string;
}

export interface VendorBankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  panNumber?: string;
  gstRegistered: boolean;
  isActive: boolean;
  totalPurchases: number;
  creditDays: number;
  paymentTerms: PaymentTerms;
  openingBalance: number;
  bankDetails?: VendorBankDetails;
  createdAt: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  batchNumber?: string;
  expiryDate?: string;
  isPerishable?: boolean;
}

export interface TaxBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI';
  reference: string;
  paidAt: string;
  recordedBy: string;
  journalEntryId: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  items: PurchaseInvoiceItem[];
  subtotal: number;
  gstAmount: number;
  taxBreakdown: TaxBreakdown;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  invoiceState: InvoiceState;
  paidAmount: number;
  outstandingAmount: number;
  payments: PaymentRecord[];
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: LedgerAccountType;
  parentId?: string;
  balance: number;
  isActive: boolean;
  description: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  entryType: JournalEntryType;
  amount: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  referenceType: 'PURCHASE_INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'ADJUSTMENT' | 'REVERSAL';
  referenceId: string;
  referenceNumber: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  narration: string;
  createdBy: string;
  createdAt: string;
  isReversed: boolean;
  reversalEntryId?: string;
  reversalOf?: string;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  vendorId: string;
  vendorName: string;
  items: PurchaseInvoiceItem[];
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  reason: string;
  journalEntryId: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'PURCHASE_INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'STOCK_TRANSACTION' | 'JOURNAL_ENTRY' | 'VENDOR' | 'INVENTORY_ITEM' | 'STOCK_ADJUSTMENT';
  entityId: string;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'POSTED' | 'CANCELLED' | 'REVERSED' | 'PAYMENT_RECORDED' | 'ACTIVATED' | 'DEACTIVATED' | 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTED';
  description: string;
  beforeValue?: string;
  afterValue?: string;
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  role?: UserRole;
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: 'DAMAGED' | 'EXPIRED' | 'THEFT' | 'CORRECTION' | 'OPENING_STOCK' | 'OTHER';
  notes: string;
  balanceBefore: number;
  balanceAfter: number;
  adjustedBy: string;
  adjustedAt: string;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalStockValue: number;
  pendingInvoices: number;
  totalVendors: number;
  expiringCount: number;
  totalPayable: number;
  recentTransactions: StockTransaction[];
}
