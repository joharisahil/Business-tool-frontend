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
  mapSalesInvoice,
} from "@/pages/inventory/mapper/inventoryMapper";

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
export const getItemsApi = async (params?: { search?: string }) => {
  const res = await api.get("/inventory/items", { params });
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
  const res = await api.post(
    `/inventory/invoices/${invoiceId}/payments`,
    payload,
  );
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
    params: { days },
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

export const getTrialBalanceApi = async (
  fromDate?: string,
  toDate?: string,
) => {
  const res = await api.get("/inventory/ledger/trial-balance", {
    params: { fromDate, toDate },
  });
  return res.data.data;
};

export const getAccountDrilldownApi = async (
  id: string,
  params?: {
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  },
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
  return res.data.logs.map(mapAuditLog);
};

/* =========================================================
   SALES INVOICES
========================================================= */
export const getSalesInvoicesApi = async () => {
  const res = await api.get("/inventory/sales-invoices");
  return res.data.data.map(mapSalesInvoice);
};

export const getSalesInvoiceApi = async (id: string) => {
  const res = await api.get(`/inventory/sales-invoices/${id}`);
  return mapSalesInvoice(res.data.data);
};

export const createSalesInvoiceApi = async (payload: any) => {
  const res = await api.post("/inventory/sales-invoices", payload);
  return mapSalesInvoice(res.data.data);
};

export const approveSalesInvoiceApi = async (id: string) => {
  const res = await api.patch(`/inventory/sales-invoices/${id}/approve`);
  return mapSalesInvoice(res.data.data);
};

export const postSalesInvoiceApi = async (id: string) => {
  const res = await api.patch(`/inventory/sales-invoices/${id}/post`);
  return mapSalesInvoice(res.data.data);
};

export const cancelSalesInvoiceApi = async (id: string) => {
  const res = await api.patch(`/inventory/sales-invoices/${id}/cancel`);
  return mapSalesInvoice(res.data.data);
};

/* =========================================================
   SALES PAYMENTS
========================================================= */
export const recordSalesPaymentApi = async (
  invoiceId: string,
  payload: any,
) => {
  const res = await api.post(
    `/inventory/sales-invoices/${invoiceId}/payments`,
    payload,
  );
  return mapSalesInvoice(res.data.data);
};

export const getSalesPaymentHistoryApi = async (invoiceId: string) => {
  const res = await api.get(`/inventory/sales-invoices/${invoiceId}/payments`);
  return res.data.data;
};
export const getAllSalesPaymentsApi = async () => {
  const res = await api.get("/inventory/sales-payments");
  return res.data.data;
};
/* =========================================================
   SALES CREDIT NOTES
========================================================= */
export const createSalesCreditNoteApi = async (payload: any) => {
  const res = await api.post("/inventory/sales/credit-notes", payload);
  return res.data.data;
};

export const getSalesCreditNotesApi = async () => {
  const res = await api.get("/inventory/sales/credit-notes");
  return res.data.data;
};
/* =========================================================
   SALES REPORTS
========================================================= */
export const getSalesSummaryApi = async (params?: any) => {
  const res = await api.get("/inventory/sales/reports/summary", {
    params,
  });
  return res.data.data;
};

export const getGSTReportApi = async (params?: any) => {
  const res = await api.get("/inventory/sales/reports/gst", {
    params,
  });
  return res.data.data;
};

export const getReceivableAgingApi = async () => {
  const res = await api.get("/inventory/sales/reports/receivable-aging");
  return res.data.data;
};

export const getDailyCollectionApi = async (params?: any) => {
  const res = await api.get("/inventory/sales/reports/daily-collection", {
    params,
  });
  return res.data.data;
};

export const getCustomerLedgerApi = async (customerId: string) => {
  const res = await api.get(`/inventory/customers/${customerId}/ledger`);
  return res.data.data;
};
/* =========================================================
   UNIT MASTER
========================================================= */
export const getUnitsApi = async () => {
  const res = await api.get("/inventory/units");
  return res.data.data;
};

export const getUnitApi = async (id: string) => {
  const res = await api.get(`/inventory/units/${id}`);
  return res.data.data;
};

export const createUnitApi = async (payload: any) => {
  const res = await api.post("/inventory/units", payload);
  return res.data.data;
};

export const updateUnitApi = async (id: string, payload: any) => {
  const res = await api.put(`/inventory/units/${id}`, payload);
  return res.data.data;
};

export const toggleUnitApi = async (id: string) => {
  const res = await api.patch(`/inventory/units/${id}/toggle`);
  return res.data.data;
};

export const previewUnitConversionApi = async (payload: any) => {
  const res = await api.post("/inventory/units/convert", payload);
  return res.data.data;
};

export const getRelatedUnitsApi = async (id: string) => {
  const res = await api.get(`/inventory/units/${id}/related`);
  return res.data.data;
};

/* =========================================================
   CUSTOMERS
========================================================= */
export const getCustomersApi = async () => {
  const res = await api.get("/inventory/customers");
  return res.data.data.map(mapVendor); // if you create mapCustomer replace this
};

export const getCustomerApi = async (id: string) => {
  const res = await api.get(`/inventory/customers/${id}`);
  return res.data.data;
};

export const createCustomerApi = async (payload: any) => {
  const res = await api.post("/inventory/customers", payload);
  return res.data.data;
};

export const updateCustomerApi = async (id: string, payload: any) => {
  const res = await api.put(`/inventory/customers/${id}`, payload);
  return res.data.data;
};

export const toggleCustomerApi = async (id: string) => {
  const res = await api.patch(`/inventory/customers/${id}/toggle`);
  return res.data.data;
};

export const getCustomerOutstandingApi = async (customerId: string) => {
  const res = await api.get(`/inventory/customers/${customerId}/outstanding`);
  return res.data.data;
};
