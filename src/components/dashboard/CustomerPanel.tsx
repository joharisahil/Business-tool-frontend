import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDashboard } from "@/hooks/use-dashboard";
import type { PaymentStatus } from "@/pages/inventory/types/dashboard";

interface CustomerPanelProps {
  customerId: string | null;
  onClose: () => void;
}

function currency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

function statusVariant(status: PaymentStatus) {
  const map: Record<PaymentStatus, "paid" | "pending" | "overdue"> = { Paid: "paid", Pending: "pending", Overdue: "overdue" };
  return map[status];
}

export function CustomerPanel({ customerId, onClose }: CustomerPanelProps) {
  const { data, isLoading, isError } = useCustomerDashboard(customerId);

  return (
    <Sheet open={!!customerId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isLoading ? <Skeleton className="h-6 w-40" /> : data?.summary.name ?? "Customer"}</SheetTitle>
        </SheetHeader>

        {isError ? (
          <p className="mt-6 text-center text-muted-foreground">Failed to load customer data.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Orders", value: data?.summary.totalOrders },
                { label: "Total Spent", value: data ? currency(data.summary.totalSpent) : undefined },
                { label: "Pending", value: data ? currency(data.summary.pendingAmount) : undefined },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {isLoading ? (
                      <Skeleton className="mx-auto mt-1 h-6 w-16" />
                    ) : (
                      <p className="mt-0.5 text-lg font-semibold">{item.value ?? "—"}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Invoice history */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Invoice History</h3>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      : !data?.invoices.length
                      ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No invoices.</TableCell>
                        </TableRow>
                      )
                      : data.invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                            <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                            <TableCell className="text-right">{currency(inv.amount)}</TableCell>
                            <TableCell className="text-right">{currency(inv.dueAmount)}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
