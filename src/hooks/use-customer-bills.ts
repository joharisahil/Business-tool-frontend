import { useQuery } from "@tanstack/react-query";
import { fetchCustomer } from "@/api/dashboardApi";

interface UseCustomerBillsProps {
  customerId: string | null;
  startDate?: string;
  endDate?: string;
}

export function useCustomerBills({
  customerId,
  startDate,
  endDate,
}: UseCustomerBillsProps) {
  return useQuery({
    queryKey: ["customer-bills", customerId, startDate, endDate],

    queryFn: async () => {
      if (!customerId) return null;

      return fetchCustomer(customerId, {
        startDate,
        endDate,
      });
    },

    enabled: !!customerId,
    staleTime: 0,
  });
}