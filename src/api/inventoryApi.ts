// src/api/inventoryApi.ts
import api from "@/api/authApi";
import {
  mapCategory,
  mapInventoryItem,
  mapVendor,
  mapInvoice,
  mapLedgerAccount,
  mapJournalEntry,
  mapCreditNote,
  mapAuditLog,
  mapStockAdjustment,
} from "@/pages/inventory/mapper/inventoryMapper"

/* =========================================================
   DASHBOARD
========================================================= */
export const getInventoryDashboardApi = async () => {
  const res = await api.get("/inventory/dashboard");
  return res.data.data;
};

/* =========================================================
   CATEGORIES
========================================================= */
export const getCategoriesApi = async () => {
  const res = await api.get("/inventory/categories");
  return res.data.data.map(mapCategory);
};

export const createCategoryApi = async (payload: any) => {
  const res = await api.post("/inventory/categories", payload);
  return mapCategory(res.data.data);
};

export const updateCategoryApi = async (id: string, payload: any) => {
  const res = await api.put(`/inventory/categories/${id}`, payload);
  return mapCategory(res.data.data);
};

export const toggleCategoryApi = async (id: string) => {
  const res = await api.patch(`/inventory/categories/${id}/toggle`);
  return mapCategory(res.data.data);
};

/* =========================================================
   ITEMS
========================================================= */
export const getItemsApi = async () => {
  const res = await api.get("/inventory/items");
  return res.data.data.map(mapInventoryItem);
};

export const getItemApi = async (id: string) => {
  const res = await api.get(`/inventory/items/${id}`);
  return mapInventoryItem(res.data.data);
};

export const createItemApi = async (payload: any) => {
  const res = await api.post("/inventory/items", payload);
  return mapInventoryItem(res.data.data);
};

export const updateItemApi = async (id: string, payload: any) => {
  const res = await api.put(`/inventory/items/${id}`, payload);
  return mapInventoryItem(res.data.data);
};

export const toggleItemApi = async (id: string) => {
  const res = await api.patch(`/inventory/items/${id}/toggle`);
  return mapInventoryItem(res.data.data);
};

export const getItemStockHistoryApi = async (id: string) => {
  const res = await api.get(`/inventory/items/${id}/stock-history`);
  return res.data.data;
};

/* =========================================================
   VENDORS
========================================================= */
export const getVendorsApi = async () => {
  const res = await api.get("/inventory/vendors");
  return res.data.data.map(mapVendor);
};

export const createVendorApi = async (payload: any) => {
  const res = await api.post("/inventory/vendors", payload);
  return mapVendor(res.data.data);
};

export const updateVendorApi = async (id: string, payload: any) => {
  const res = await api.put(`/inventory/vendors/${id}`, payload);
  return mapVendor(res.data.data);
};

export const toggleVendorApi = async (id: string) => {
  const res = await api.patch(`/inventory/vendors/${id}/toggle`);
  return mapVendor(res.data.data);
};

export const getVendorLedgerApi = async (id: string) => {
  const res = await api.get(`/inventory/vendors/${id}/ledger`);
  return res.data.data;
};

export const getVendorOutstandingApi = async (vendorId: string) => {
  const res = await api.get(`/inventory/vendors/${vendorId}/outstanding`);
  return res.data.data;
};

/* =========================================================
   INVOICES
========================================================= */
export const getInvoicesApi = async () => {
  const res = await api.get("/inventory/invoices");
  return res.data.data.map(mapInvoice);
};

export const getInvoiceApi = async (id: string) => {
  const res = await api.get(`/inventory/invoices/${id}`);
  return mapInvoice(res.data.data);
};

export const createInvoiceApi = async (payload: any) => {
  const res = await api.post("/inventory/invoices", payload);
  return mapInvoice(res.data.data);
};

export const approveInvoiceApi = async (id: string) => {
  const res = await api.patch(`/inventory/invoices/${id}/approve`);
  return mapInvoice(res.data.data);
};

export const postInvoiceApi = async (id: string) => {
  const res = await api.patch(`/inventory/invoices/${id}/post`);
  return mapInvoice(res.data.data);
};

export const cancelInvoiceApi = async (id: string) => {
  const res = await api.patch(`/inventory/invoices/${id}/cancel`);
  return mapInvoice(res.data.data);
};

/* =========================================================
   PAYMENTS
========================================================= */
export const recordPaymentApi = async (invoiceId: string, payload: any) => {
  const res = await api.post(`/inventory/invoices/${invoiceId}/payments`, payload);
  return res.data.data;
};

export const getPaymentHistoryApi = async (invoiceId: string) => {
  const res = await api.get(`/inventory/invoices/${invoiceId}/payments`);
  return res.data.data;
};

/* =========================================================
   STOCK
========================================================= */
export const getStockSummaryApi = async () => {
  const res = await api.get("/inventory/stock/summary");
  return res.data.data;
};

export const getStockTransactionsApi = async () => {
  const res = await api.get("/inventory/stock/transactions");
  return res.data.data;
};

export const getExpiryDashboardApi = async (days?: number) => {
  const res = await api.get("/inventory/stock/expiry", {
    params: { days }
  });
  return res.data.data;
};

export const markExpiredBatchesApi = async () => {
  const res = await api.post("/inventory/stock/mark-expired");
  return res.data.data;
};

/* =========================================================
   STOCK ADJUSTMENTS
========================================================= */
export const createStockAdjustmentApi = async (payload: any) => {
  const res = await api.post("/inventory/stock/adjustments", payload);
  return mapStockAdjustment(res.data.data);
};

export const getStockAdjustmentsApi = async () => {
  const res = await api.get("/inventory/stock/adjustments");
  return res.data.data.map(mapStockAdjustment);
};

/* =========================================================
   CREDIT NOTES
========================================================= */
export const createCreditNoteApi = async (payload: any) => {
  const res = await api.post("/inventory/credit-notes", payload);
  return mapCreditNote(res.data.data);
};

export const getCreditNotesApi = async () => {
  const res = await api.get("/inventory/credit-notes");
  return res.data.data.map(mapCreditNote);
};

/* =========================================================
   LEDGER
========================================================= */
export const getLedgerAccountsApi = async () => {
  const res = await api.get("/inventory/ledger/accounts");
  return res.data.data.map(mapLedgerAccount);
};

export const createLedgerAccountApi = async (payload: any) => {
  const res = await api.post("/inventory/ledger/accounts", payload);
  return mapLedgerAccount(res.data.data);
};

export const seedLedgerAccountsApi = async () => {
  const res = await api.post("/inventory/ledger/accounts/seed");
  return res.data.data.map(mapLedgerAccount);
};

export const getTrialBalanceApi = async (fromDate?: string, toDate?: string) => {
  const res = await api.get("/inventory/ledger/trial-balance", {
    params: { fromDate, toDate },
  });
  return res.data.data;
};

export const getAccountDrilldownApi = async (
  id: string,
  params?: { fromDate?: string; toDate?: string; page?: number; limit?: number }
) => {
  const res = await api.get(`/inventory/ledger/accounts/${id}/drilldown`, {
    params,
  });
  return res.data.data;
};

/* =========================================================
   JOURNAL
========================================================= */
export const getJournalEntriesApi = async () => {
  const res = await api.get("/inventory/journal");
  return res.data.data.map(mapJournalEntry);
};

export const getJournalEntryApi = async (id: string) => {
  const res = await api.get(`/inventory/journal/${id}`);
  return mapJournalEntry(res.data.data);
};

export const reverseJournalEntryApi = async (id: string) => {
  const res = await api.post(`/inventory/journal/${id}/reverse`);
  return mapJournalEntry(res.data.data);
};

/* =========================================================
   AUDIT
========================================================= */
export const getAuditLogsApi = async () => {
  const res = await api.get("/inventory/audit");
  return res.data.data.map(mapAuditLog);
};