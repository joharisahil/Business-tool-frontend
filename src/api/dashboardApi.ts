// src/api/dashboardApi.ts
import api from "@/api/authApi";
import type {
  DashboardFilters,
  SummaryData,
  SaleRecord,
  PaginatedResponse,
  PaymentRecord,
  CustomerDashboard,
  InsightsData,
} from "@/pages/inventory/types/dashboard";

// ✅ Updated to match your route mounting
const API_BASE = "/inventory";

// Helper function to build query parameters
function buildParams(filters?: DashboardFilters): Record<string, any> {
  const params: Record<string, any> = {};
  
  if (!filters) return params;
  
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.customerId) params.customerId = filters.customerId;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
  if (filters.search) params.search = filters.search;
  
  return params;
}

/* =========================================================
   DASHBOARD
========================================================= */

/**
 * Fetch dashboard summary data
 * GET /api/inventory/summary
 */
export const fetchSummary = async (filters?: DashboardFilters): Promise<SummaryData> => {
  const res = await api.get(`${API_BASE}/summary`, {
    params: buildParams(filters),
  });

  const d = res.data.data;

  return {
    totalSales: d.totalSales,
    totalOrders: d.totalOrders,
    paymentsReceived: d.totalReceived,   
    pendingAmount: d.totalPending,       
  };
};

/**
 * Fetch paginated sales records
 * GET /api/inventory/sales
 */
export const fetchSales = async (filters?: DashboardFilters): Promise<PaginatedResponse<SaleRecord>> => {
  const res = await api.get(`${API_BASE}/sales`, {
    params: buildParams(filters),
  });
  return res.data;
};

/**
 * Fetch paginated payment records
 * GET /api/inventory/payments
 */
export const fetchPayments = async (filters?: DashboardFilters): Promise<PaginatedResponse<PaymentRecord>> => {
  const res = await api.get(`${API_BASE}/payments`, {
    params: buildParams(filters),
  });
  return res.data;
};

/**
 * Fetch customer dashboard data by ID
 * GET /api/inventory/customer/:id
 */
export const fetchCustomer = async (id: string): Promise<CustomerDashboard> => {
  if (!id) throw new Error("Customer ID is required");
  const res = await api.get(`${API_BASE}/customer/${id}`);
  return res.data;
};

/**
 * Fetch insights data
 * GET /api/inventory/insights
 */
export const fetchInsights = async (filters?: DashboardFilters): Promise<InsightsData> => {
  const res = await api.get(`${API_BASE}/insights`, {
    params: buildParams(filters),
  });

  const d = res.data.data;

  return {
    topCustomer: {
      name: d.topCustomer?._id ?? "Unknown",
      totalSpent: d.topCustomer?.total ?? 0,
    },
    highestSale: {
      amount: d.highestSale?.grandTotal ?? 0,
      customerName: d.highestSale?.customerName ?? "—",
      invoiceNumber: d.highestSale?.invoiceNumber ?? "—",
    },
    totalPendingInvoices: d.pendingInvoices ?? 0,
  };
};