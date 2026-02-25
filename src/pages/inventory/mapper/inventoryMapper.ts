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
});

/* =====================================================
   INVENTORY ITEM
===================================================== */

export const mapInventoryItem = (raw: any): InventoryItem => ({
  id: mapId(raw),
  sku: raw.sku,
  name: raw.name,
  categoryId: raw.category_id || raw.category?._id,
  categoryName: raw.category?.name || raw.categoryName || "",
  unit: raw.unit,
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
  id: mapId(raw),
  entityType: raw.entityType,
  entityId: raw.entity_id || raw.entityId,
  action: raw.action,
  description: raw.description,
  beforeValue: raw.before,
  afterValue: raw.after,
  performedBy: mapUserName(raw.user),
  performedAt: raw.performedAt,
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