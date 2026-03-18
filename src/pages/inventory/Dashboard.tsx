import { useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardFilters } from "@/components/filters/DashboardFilters";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { SalesTable } from "@/components/tables/SalesTable";
import { PaymentsTable } from "@/components/tables/PaymentsTable";
import { InsightsCards } from "@/components/dashboard/InsightsCards";
import { CustomerPanel } from "@/components/dashboard/CustomerPanel";
import { useSummary, useSales, usePayments, useInsights } from "@/hooks/use-dashboard";
import type { DashboardFilters as Filters, PaymentStatus } from "@/pages/inventory/types/dashboard";

export default function Dashboard() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [salesPage, setSalesPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const filters: Filters = {
    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    search: customerSearch || undefined,
    paymentStatus: paymentStatus && paymentStatus !== ("all" as string) ? paymentStatus : undefined,
    page: salesPage,
    limit: 10,
  };

  const summaryQuery = useSummary(filters);
  const salesQuery = useSales({ ...filters, page: salesPage });
  const paymentsQuery = usePayments({ ...filters, page: paymentsPage });
  const insightsQuery = useInsights(filters);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
    setSalesPage(1);
    setPaymentsPage(1);
  };

  // Transform data to match expected format
  const salesData = salesQuery.data ? {
    data: salesQuery.data.data,
    summary: salesQuery.data.summary || {
      totalSales: 0,
      totalPaid: 0,
      totalPending: 0,
      avgOrderValue: 0
    },
    pagination: salesQuery.data.pagination
  } : undefined;

  const paymentsData = paymentsQuery.data ? {
    data: paymentsQuery.data.data,
    summary: paymentsQuery.data.summary || {
      totalReceived: 0,
      totalPayments: 0,
      avgPayment: 0
    },
    pagination: paymentsQuery.data.pagination
  } : undefined;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Inventory & sales overview
          </p>
        </div>

        {/* Filters */}
        <DashboardFilters
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          customerSearch={customerSearch}
          onCustomerSearchChange={(v) => { setCustomerSearch(v); setSalesPage(1); }}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={(v) => { setPaymentStatus(v); setSalesPage(1); }}
        />

        {/* KPI Cards */}
        <KpiCards 
          data={summaryQuery.data} 
          isLoading={summaryQuery.isLoading} 
          isError={summaryQuery.isError} 
        />

        {/* Insights */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Insights</h2>
          <InsightsCards 
            data={insightsQuery.data} 
            isLoading={insightsQuery.isLoading} 
            isError={insightsQuery.isError} 
          />
        </div>

        {/* Tabs: Sales & Payments */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesTable
              data={salesData}
              isLoading={salesQuery.isLoading}
              isError={salesQuery.isError}
              page={salesPage}
              onPageChange={setSalesPage}
              onCustomerClick={setSelectedCustomerId}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTable
              data={paymentsData}
              isLoading={paymentsQuery.isLoading}
              isError={paymentsQuery.isError}
              page={paymentsPage}
              onPageChange={setPaymentsPage}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Customer Side Panel */}
      <CustomerPanel customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
    </>
  );
}