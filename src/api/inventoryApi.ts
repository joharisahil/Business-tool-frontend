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
  mapCustomer
} from "@/pages/inventory/mapper/inventoryMapper";
import { useParams } from "react-router-dom";

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
export const getCategoriesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) => {
  const queryString = new URLSearchParams();
  if (params?.page) queryString.append("page", params.page.toString());
  if (params?.limit) queryString.append("limit", params.limit.toString());
  if (params?.search) queryString.append("search", params.search);
  if (params?.isActive !== undefined) queryString.append("isActive", params.isActive.toString());
  
  const url = `/inventory/categories${queryString.toString() ? `?${queryString.toString()}` : ""}`;
  const res = await api.get(url);
  return res.data;
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

export const getPaginatedItemsApi = async (params?: { 
  page?: number; 
  limit?: number; 
  search?: string;
  category?: string;
  active?: boolean;
}) => {
  const res = await api.get("/inventory/items/paginated", { 
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search,
      category: params?.category,
      active: params?.active
    } 
  });
  
  return {
    data: res.data.data.map(mapInventoryItem),
    pagination: res.data.pagination
  };
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
export const getInvoicesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.state && params.state !== "ALL") queryParams.append("state", params.state);
  if (params?.paymentStatus && params.paymentStatus !== "ALL") queryParams.append("paymentStatus", params.paymentStatus);
  if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
  if (params?.toDate) queryParams.append("toDate", params.toDate);
  
  const url = `/inventory/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await api.get(url);
  
  // If backend already returns paginated response
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return {
      success: res.data.success,
      data: res.data.data.map(mapInvoice),
      total: res.data.total,
      page: res.data.page,
      pages: res.data.pages,
      limit: res.data.limit,
    };
  }
  
  // If backend returns array directly, paginate client-side
  if (Array.isArray(res.data)) {
    const allInvoices = res.data.map(mapInvoice);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = allInvoices.slice(start, end);
    
    return {
      success: true,
      data: paginatedData,
      total: allInvoices.length,
      page: page,
      pages: Math.ceil(allInvoices.length / limit),
      limit: limit,
    };
  }
  
  // Fallback for any other format
  return {
    success: true,
    data: [],
    total: 0,
    page: params?.page || 1,
    pages: 1,
    limit: params?.limit || 10,
  };
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

export const getStockTransactionsApi = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  referenceType?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.type && params.type !== "all") queryParams.append("type", params.type);
  if (params?.referenceType && params.referenceType !== "all") queryParams.append("referenceType", params.referenceType);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
  if (params?.toDate) queryParams.append("toDate", params.toDate);
  
  const url = `/inventory/stock/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await api.get(url);
  
  // Return the full response with pagination info
  return res.data;
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

export const reverseJournalEntryApi = async (
  id: string,
  data: { narration?: string } = {}
) => {
  const res = await api.post(`/inventory/journal/${id}/reverse`, data);
  return mapJournalEntry(res.data.data);
};
/* =========================================================
   AUDIT
========================================================= */
export const getAuditLogsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  action?: string;
  performedBy?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.entityType && params.entityType !== "all") queryParams.append("entityType", params.entityType);
  if (params?.action && params.action !== "all") queryParams.append("action", params.action);
  if (params?.performedBy) queryParams.append("performedBy", params.performedBy);
  if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
  if (params?.toDate) queryParams.append("toDate", params.toDate);
  
  const url = `/inventory/audit${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await api.get(url);
  
  // If backend already returns paginated response with logs array
  if (res.data && res.data.logs && Array.isArray(res.data.logs)) {
    return {
      success: res.data.success,
      data: res.data.logs.map(mapAuditLog),
      total: res.data.total,
      page: res.data.page,
      pages: res.data.pages,
      limit: res.data.limit,
    };
  }
  
  // If backend returns paginated response with data array
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return {
      success: res.data.success,
      data: res.data.data.map(mapAuditLog),
      total: res.data.total,
      page: res.data.page,
      pages: res.data.pages,
      limit: res.data.limit,
    };
  }
  
  // If backend returns array directly (no pagination)
  if (Array.isArray(res.data)) {
    const allLogs = res.data.map(mapAuditLog);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = allLogs.slice(start, end);
    
    return {
      success: true,
      data: paginatedData,
      total: allLogs.length,
      page: page,
      pages: Math.ceil(allLogs.length / limit),
      limit: limit,
    };
  }
  
  // If backend returns logs array directly
  if (res.data && Array.isArray(res.data.logs)) {
    const allLogs = res.data.logs.map(mapAuditLog);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = allLogs.slice(start, end);
    
    return {
      success: true,
      data: paginatedData,
      total: allLogs.length,
      page: page,
      pages: Math.ceil(allLogs.length / limit),
      limit: limit,
    };
  }
  
  // Fallback for any other format
  return {
    success: true,
    data: [],
    total: 0,
    page: params?.page || 1,
    pages: 1,
    limit: params?.limit || 10,
  };
};
/* =========================================================
   SALES INVOICES
========================================================= */
export const getSalesInvoicesApi = async (params?: any) => {
  const res = await api.get("/inventory/sales-invoices", { params });

  return {
    data: (res.data?.data || []).map(mapSalesInvoice),

    // ✅ FIX HERE
    total: res.data?.pagination?.total || 0,
    pages: res.data?.pagination?.totalPages || 1,
    page: res.data?.pagination?.page || 1,
  };
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
export const getAllSalesPaymentsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.method) queryParams.append("method", params.method);
  if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
  if (params?.toDate) queryParams.append("toDate", params.toDate);
  
  const url = `/inventory/sales-payments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await api.get(url);
  
  // Return the full response with pagination info
  return res.data;
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
// In your inventoryApi.ts file

export const getCustomersApi = async (params?: { 
  search?: string; 
  page?: number; 
  limit?: number;
  isActive?: boolean;
  customerType?: string; // ✅ add this
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.customerType) queryParams.append("customerType", params.customerType); // ✅

  const url = `/inventory/customers/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await api.get(url);

  // ✅ RETURN FULL RESPONSE (IMPORTANT)
  return {
    success: res.data.success,
    data: (res.data.data || []).map(mapCustomer),
    total: res.data.total || 0,
    page: res.data.page || 1,
    pages: res.data.pages || 1,
  };
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
