import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, CreditCard, Clock } from "lucide-react";
import type { SummaryData } from "@/pages/inventory/types/dashboard";

interface KpiCardsProps {
  data?: SummaryData;
  isLoading: boolean;
  isError: boolean;
}

// ✅ Safe currency formatter
function formatCurrency(val?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(val ?? 0);
}

// ✅ Cards config (safe formatters)
const cards = [
  {
    key: "totalSales" as const,
    label: "Total Sales",
    icon: DollarSign,
    format: (v?: number) => formatCurrency(v),
  },
  {
    key: "totalOrders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
    format: (v?: number) => (v ?? 0).toLocaleString(),
  },
  {
    key: "paymentsReceived" as const,
    label: "Payments Received",
    icon: CreditCard,
    format: (v?: number) => formatCurrency(v),
  },
  {
    key: "pendingAmount" as const,
    label: "Pending Amount",
    icon: Clock,
    format: (v?: number) => formatCurrency(v),
  },
];

export function KpiCards({ data, isLoading, isError }: KpiCardsProps) {

  if (isError) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.key} className="border-destructive/30">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-sm text-destructive">Failed to load</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;

        // ✅ Safe value extraction
        const value = data?.[c.key];

        // 🔥 Debug each card value
      

        return (
          <Card key={c.key} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{c.label}</p>

                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                    {data ? c.format(value ?? 0) : "—"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}