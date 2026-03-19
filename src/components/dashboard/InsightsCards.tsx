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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(val);
}
export function InsightsCards({ data, isLoading, isError }: InsightsCardsProps) {
  if (isError) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Failed to load insights.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      
      {/* 🟢 Top Customer */}
      <Card className="border-green-200 transition-all hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Award className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Top Customer</p>

            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-28" />
            ) : (
              <>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {data?.topCustomer.name ?? "—"}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  {data ? currency(data.topCustomer.totalSpent) : ""}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔵 Highest Sale */}
      <Card className="border-blue-200 transition-all hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Highest Sale</p>

            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-28" />
            ) : (
              <>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {data ? currency(data.highestSale.amount) : "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data?.highestSale.customerName} ·{" "}
                  {data?.highestSale.invoiceNumber}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔴 Pending */}
      <Card className="border-red-200 transition-all hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Pending Invoices</p>

            {isLoading ? (
              <Skeleton className="mt-1 h-5 w-16" />
            ) : (
              <p className="mt-0.5 text-2xl font-semibold text-red-600">
                {data?.totalPendingInvoices ?? "—"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
