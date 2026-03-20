// src/mappers/inventoryMapper.ts

import type {
  InventoryCategory,
  InventoryItem,
  InventoryBatch,
  Vendor,
  PurchaseInvoice,
  LedgerAccount,
  JournalEntry,
  CreditNote,
  AuditLogEntry,
  StockAdjustment,
  SalesInvoice,
  PaymentRecord,
} from "../types/inventory";

/* =====================================================
   GENERIC HELPERS
===================================================== */

const mapId = (raw: any) => raw?._id || raw?.id;

const mapUserName = (user: any) =>
  typeof user === "string" ? user : user?.name || "";

/* =====================================================
   CATEGORY
===================================================== */

export const mapCategory = (raw: any): InventoryCategory => ({
  id: mapId(raw),
  name: raw.name,
  description: raw.description || "",
  itemCount: raw.itemCount || 0,
  isActive: raw.isActive ?? true, // ✅ IMPORTANT
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

/* =====================================================
   INVENTORY ITEM
===================================================== */

export const mapInventoryItem = (raw: any): InventoryItem => ({
  id: mapId(raw),
  sku: raw.sku,
  name: raw.name,

  categoryId:
    typeof raw.category_id === "object"
      ? raw.category_id._id || raw.category_id.id
      : raw.category_id || raw.category?._id,

  categoryName:
    typeof raw.category_id === "object"
      ? raw.category_id.name
      : raw.category?.name || raw.categoryName || "",

  unit: raw.unit,

  saleUnits: raw.saleUnits || [], // ⭐ ADD THIS

  purchaseUnitId: raw.purchaseUnit_id || null, // optional but good

  costPrice: raw.costPrice,
  sellingPrice: raw.sellingPrice,
  currentStock: raw.currentStock,
  minimumStock: raw.minimumStock,

  isActive: raw.isActive,
  isPerishable: raw.isPerishable,
  shelfLifeDays: raw.shelfLifeDays,

  createdBy: mapUserName(raw.createdBy),
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});
/* =====================================================
   INVENTORY BATCH
===================================================== */

export const mapBatch = (raw: any): InventoryBatch => ({
  id: mapId(raw),
  itemId: raw.item_id || raw.itemId,
  itemName: raw.item?.name || raw.itemName,
  batchNumber: raw.batchNumber,
  expiryDate: raw.expiryDate,
  receivedDate: raw.receivedDate,
  receivedQuantity: raw.receivedQuantity,
  remainingQuantity: raw.remainingQuantity,
  unitCost: raw.unitCost,
  invoiceId: raw.invoice_id || raw.invoiceId,
  invoiceNumber: raw.invoice?.invoiceNumber || raw.invoiceNumber,
  isExpired: raw.isExpired,
});

/* =====================================================
   VENDOR
===================================================== */

export const mapVendor = (raw: any): Vendor => ({
  id: mapId(raw),
  name: raw.name,
  contactPerson: raw.contactPerson,
  email: raw.email,
  phone: raw.phone,
  address: raw.address,
  gstin: raw.gstin,
  panNumber: raw.panNumber,
  gstRegistered: raw.gstRegistered,
  isActive: raw.isActive,
  totalPurchases: raw.totalPurchases || 0,
  creditDays: raw.creditDays || 0,
  paymentTerms: raw.paymentTerms,
  openingBalance: raw.openingBalance || 0,
  bankDetails: raw.bankDetails,
  createdAt: raw.createdAt,
});

/* =====================================================
   PURCHASE INVOICE
===================================================== */

export const mapInvoice = (raw: any): PurchaseInvoice => ({
  id: mapId(raw),
  invoiceNumber: raw.invoiceNumber,
  vendorId: raw.vendor_id || raw.vendor?._id,
  vendorName: raw.vendor?.name || raw.vendorName,
  items: raw.items || [],
  subtotal: raw.subtotal,
  gstAmount: raw.gstAmount,
  taxBreakdown: raw.taxBreakdown,
  grandTotal: raw.grandTotal,
  paymentStatus: raw.paymentStatus,
  invoiceState: raw.invoiceState,
  paidAmount: raw.paidAmount,
  outstandingAmount: raw.outstandingAmount,
  payments: raw.payments || [],
  notes: raw.notes,
  createdBy: mapUserName(raw.createdBy),
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  approvedBy: raw.approvedBy,
  approvedAt: raw.approvedAt,
  postedBy: raw.postedBy,
  postedAt: raw.postedAt,
  cancelledBy: raw.cancelledBy,
  cancelledAt: raw.cancelledAt,
  cancellationReason: raw.cancellationReason,
});

/* =====================================================
   LEDGER ACCOUNT
===================================================== */

export const mapLedgerAccount = (raw: any): LedgerAccount => ({
  id: mapId(raw),
  code: raw.code,
  name: raw.name,
  type: raw.type,
  parentId: raw.parent_id,
  balance: raw.balance,
  isActive: raw.isActive,
  description: raw.description,
});

/* =====================================================
   JOURNAL ENTRY
===================================================== */

export const mapJournalEntry = (raw: any): JournalEntry => ({
  id: mapId(raw),
  entryNumber: raw.entryNumber,
  referenceType: raw.referenceType,
  referenceId: raw.referenceId,
  referenceNumber: raw.referenceNumber,
  lines: raw.lines || [],
  totalDebit: raw.totalDebit,
  totalCredit: raw.totalCredit,
  narration: raw.narration,
  createdBy: mapUserName(raw.createdBy),
  createdAt: raw.createdAt,
  isReversed: raw.isReversed,
  reversalEntryId: raw.reversalEntryId,
  reversalOf: raw.reversalOf,
});

/* =====================================================
   CREDIT NOTE
===================================================== */

export const mapCreditNote = (raw: any): CreditNote => ({
  id: mapId(raw),
  creditNoteNumber: raw.creditNoteNumber,
  originalInvoiceId: raw.originalInvoiceId,
  originalInvoiceNumber: raw.originalInvoiceNumber,
  vendorId: raw.vendor_id,
  vendorName: raw.vendor?.name,
  items: raw.items || [],
  subtotal: raw.subtotal,
  gstAmount: raw.gstAmount,
  grandTotal: raw.grandTotal,
  reason: raw.reason,
  journalEntryId: raw.journalEntryId,
  createdBy: mapUserName(raw.createdBy),
  createdAt: raw.createdAt,
});

/* =====================================================
   AUDIT LOG
===================================================== */

export const mapAuditLog = (raw: any): AuditLogEntry => ({
  id: raw._id,

  entityType: raw.entityType,
  entityId: raw.entity_id,

  action: raw.action,
  description: raw.description,

  beforeValue: raw.beforeValue || undefined,
  afterValue: raw.afterValue || undefined,

  performedBy: raw.performerName || raw.performedBy?.name || "",

  performedAt: raw.createdAt,

  ipAddress: raw.ipAddress,
  role: raw.role,
});

/* =====================================================
   STOCK ADJUSTMENT
===================================================== */

export const mapStockAdjustment = (raw: any): StockAdjustment => ({
  id: mapId(raw),
  itemId: raw.item_id,
  itemName: raw.item?.name,
  itemSku: raw.item?.sku,
  type: raw.type,
  quantity: raw.quantity,
  reason: raw.reason,
  notes: raw.notes,
  balanceBefore: raw.balanceBefore,
  balanceAfter: raw.balanceAfter,
  adjustedBy: mapUserName(raw.adjustedBy),
  adjustedAt: raw.adjustedAt,
});

export const mapSalesInvoice = (raw: any): SalesInvoice => ({
  id: raw._id || raw.id,
customerId: raw.customer_id?._id || raw.customerId,
  invoiceNumber: raw.invoiceNumber,

  // ✅ FIXED CUSTOMER MAPPING
  customerName: raw.customer_id?.name || raw.customerName || "",
  customerGSTIN: raw.customer_id?.gstin || raw.customerGSTIN || "",
  customerPhone: raw.customer_id?.phone || raw.customerPhone || "",

  invoiceState: raw.invoiceState,
  paymentStatus: raw.paymentStatus,

  items:
    raw.items?.map((i: any) => ({
      id: i._id || i.id,

      itemId: i.item_id || i.itemId,

      description: i.description || i.itemName || "",
      itemName: i.itemName || i.description || "",

      quantity: i.quantity,
      unitPrice: i.unitPrice,

      gstPercentage: i.gstPercentage,

      discount: i.discount || 0,

      totalAmount: i.totalAmount,

      saleUnitCode: i.saleUnitCode || "",
      baseQty: i.baseQty || undefined,
    })) || [],

  subtotal: raw.subtotal,
  totalDiscount: raw.totalDiscount || 0,

  taxBreakdown: {
    cgst: raw.taxBreakdown?.cgst || 0,
    sgst: raw.taxBreakdown?.sgst || 0,
    igst: raw.taxBreakdown?.igst || 0,
    totalTax:
      raw.taxBreakdown?.totalTax ??
      (raw.taxBreakdown?.cgst || 0) +
        (raw.taxBreakdown?.sgst || 0) +
        (raw.taxBreakdown?.igst || 0),
  },

  grandTotal: raw.grandTotal,

  paidAmount: raw.paidAmount || 0,
  outstandingAmount: raw.outstandingAmount || 0,

  notes: raw.notes,

  payments:
    raw.payments?.map((p: any) => ({
      id: p._id || p.id,
      invoiceId: p.invoiceId || raw._id,
      amount: p.amount,
      method: p.method,
      reference: p.reference,
      paidAt: p.paidAt,
      recordedBy:
        typeof p.recordedBy === "string"
          ? p.recordedBy
          : p.recordedBy?.name || "",
      journalEntryId: p.journalEntryId,
    })) || [],

  approvedBy: raw.approvedBy,
  approvedAt: raw.approvedAt,
  postedBy: raw.postedBy,
  postedAt: raw.postedAt,

  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt || raw.createdAt,
});

/* =====================================================
   CUSTOMER
===================================================== */

export const mapCustomer = (raw: any) => ({
  id: mapId(raw),

  name: raw.name,
  email: raw.email || "",
  phone: raw.phone || "",

  gstin: raw.gstin || "",
  panNumber: raw.panNumber || "",

  address: raw.address || "",

  customerType: raw.customerType,
  paymentTerms: raw.paymentTerms,

  creditLimit: raw.creditLimit || 0,
  openingBalance: raw.openingBalance || 0,

  isActive: raw.isActive ?? true,

  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});
/* =====================================================
   SALES CREDIT NOTE
===================================================== */

export const mapSalesCreditNote = (raw: any) => ({
  id: mapId(raw),

  creditNoteNumber: raw.creditNoteNumber,

  originalInvoiceId: raw.originalInvoiceId || raw.originalInvoice?._id,

  originalInvoiceNumber:
    raw.originalInvoiceNumber || raw.originalInvoice?.invoiceNumber,

  customerId: raw.customer_id,
  customerName: raw.customer?.name || raw.customerName,

  items: raw.items || [],

  subtotal: raw.subtotal,
  gstAmount: raw.gstAmount,
  grandTotal: raw.grandTotal,

  reason: raw.reason,

  journalEntryId: raw.journalEntryId,

  createdBy: mapUserName(raw.createdBy),
  createdAt: raw.createdAt,
});
/* =====================================================
   UNIT
===================================================== */

export const mapUnit = (raw: any) => ({
  id: mapId(raw),

  name: raw.name,
  symbol: raw.symbol,

  category: raw.category,

  baseUnit: raw.baseUnit,
  conversionFactor: raw.conversionFactor,

  isBaseUnit: raw.isBaseUnit,
  isActive: raw.isActive ?? true,

  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});
/* =====================================================
   PAYMENT RECORD
===================================================== */

export const mapPaymentRecord = (raw: any): PaymentRecord => ({
  id: mapId(raw),

  invoiceId: raw.invoiceId,
  amount: raw.amount,

  method: raw.method,
  reference: raw.reference,

  paidAt: raw.paidAt,

  recordedBy: mapUserName(raw.recordedBy),

  journalEntryId: raw.journalEntryId,
});
