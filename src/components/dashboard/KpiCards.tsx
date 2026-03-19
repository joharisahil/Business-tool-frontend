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
    key: "totalSales",
    label: "Total Sales",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200",
    format: (v?: number) => formatCurrency(v),
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
    format: (v?: number) => (v ?? 0).toLocaleString(),
  },
  {
    key: "paymentsReceived",
    label: "Payments Received",
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-100",
    border: "border-purple-200",
    format: (v?: number) => formatCurrency(v),
  },
  {
    key: "pendingAmount",
    label: "Pending Amount",
    icon: Clock,
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200",
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
          <Card
  key={c.key}
  className={`transition-all hover:shadow-md border ${c.border}`}
>
            <CardContent className="flex items-center gap-4 p-5">
             <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}>
  <Icon className={`h-5 w-5 ${c.color}`} />
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