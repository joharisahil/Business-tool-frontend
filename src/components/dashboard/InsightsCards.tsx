import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import type { InsightsData } from "@/pages/inventory/types/dashboard";

interface InsightsCardsProps {
  data?: InsightsData;
  isLoading: boolean;
  isError: boolean;
}

function currency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);
}

export function InsightsCards({ data, isLoading, isError }: InsightsCardsProps) {
  if (isError) {
    return <div className="rounded-lg border p-8 text-center text-muted-foreground">Failed to load insights.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-paid/10">
            <Award className="h-4.5 w-4.5 text-status-paid" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Customer</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-28" />
            ) : (
              <>
                <p className="mt-0.5 font-semibold">{data?.topCustomer.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{data ? currency(data.topCustomer.totalSpent) : ""}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Highest Sale</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-28" />
            ) : (
              <>
                <p className="mt-0.5 font-semibold">{data ? currency(data.highestSale.amount) : "—"}</p>
                <p className="text-sm text-muted-foreground">{data?.highestSale.customerName} · {data?.highestSale.invoiceNumber}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-pending/10">
            <AlertCircle className="h-4.5 w-4.5 text-status-pending" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Invoices</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-16" />
            ) : (
              <p className="mt-0.5 text-2xl font-semibold">{data?.totalPendingInvoices ?? "—"}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
