import { useQuery } from "@tanstack/react-query";
import { fetchSummary, fetchSales, fetchPayments, fetchInsights, fetchCustomer } from "@/api/dashboardApi";
import type { DashboardFilters } from "@/pages/inventory/types/dashboard";
import { useDebounce } from "./useDebounce";

export function useDashboardFilters(filters: DashboardFilters) {
  return useDebounce(filters, 400);
}

export function useSummary(filters: DashboardFilters) {
  const debounced = useDebounce(filters);
  return useQuery({
    queryKey: ["summary", debounced],
    queryFn: () => fetchSummary(debounced),
  });
}

export function useSales(filters: DashboardFilters) {
  const debounced = useDebounce(filters);
  return useQuery({
    queryKey: ["sales", debounced],
    queryFn: () => fetchSales(debounced),
  });
}

export function usePayments(filters: DashboardFilters) {
  const debounced = useDebounce(filters);
  return useQuery({
    queryKey: ["payments", debounced],
    queryFn: () => fetchPayments(debounced),
  });
}

export function useInsights(filters: DashboardFilters) {
  const debounced = useDebounce(filters);
  return useQuery({
    queryKey: ["insights", debounced],
    queryFn: () => fetchInsights(debounced),
  });
}

export function useCustomerDashboard(customerId: string | null) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => fetchCustomer(customerId!),
    enabled: !!customerId,
  });
}
