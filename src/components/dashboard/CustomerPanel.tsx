import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDashboard } from "@/hooks/use-dashboard";
import { CustomerBillsPDFButton } from "./CustomerBillsPDFButton";

interface CustomerPanelProps {
  customerId: string | null;
  onClose: () => void;
}

// ✅ Safe currency formatter
function currency(val: number = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(val);
}

// ✅ Correct badge variants (as per your UI)
function statusVariant(status: string) {
  switch (status) {
    case "PAID":
      return "default";
    case "PARTIAL":
      return "secondary";
    case "UNPAID":
      return "destructive";
    default:
      return "outline";
  }
}

export function CustomerPanel({ customerId, onClose }: CustomerPanelProps) {
  const { data, isLoading, isError } = useCustomerDashboard(customerId);

  // ✅ Safe data extraction
  const summary = data?.summary;
  const invoices = data?.invoices || [];
  const customerName =
    invoices.length > 0 ? invoices[0]?.customerName : "Customer";

  return (
    <Sheet open={!!customerId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">

        {/* HEADER */}
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              customerName
            )}
          </SheetTitle>

          {!isLoading && customerId && (
    <CustomerBillsPDFButton
      customerId={customerId}
      customerName={customerName}
      customerEmail={invoices[0]?.customerEmail} // Add if you have email
      customerPhone={invoices[0]?.customerPhone} // Add if you have phone
      customerAddress={invoices[0]?.customerAddress} // Add if you have address
    />
  )}
        </SheetHeader>

        {/* ERROR */}
        {isError ? (
          <p className="mt-6 text-center text-muted-foreground">
            Failed to load customer data.
          </p>
        ) : (
          <div className="mt-6 space-y-6">

            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Orders",
                  value: summary?.totalOrders,
                },
                {
                  label: "Total Spent",
                  value: summary
                    ? currency(summary.totalSpent)
                    : undefined,
                },
                {
                  label: "Pending",
                  value: summary
                    ? currency(summary.totalPending)
                    : undefined,
                },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>

                    {isLoading ? (
                      <Skeleton className="mx-auto mt-1 h-6 w-16" />
                    ) : (
                      <p className="mt-0.5 text-lg font-semibold">
                        {item.value ?? "—"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* INVOICE HISTORY */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Invoice History
              </h3>

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
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-20 text-center text-muted-foreground"
                        >
                          No invoices.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv: any) => (
                        <TableRow key={inv._id}>
                          <TableCell className="font-medium">
                            {inv.invoiceNumber}
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </TableCell>

                          <TableCell className="text-right">
                            {currency(inv.grandTotal)}
                          </TableCell>

                          <TableCell className="text-right">
                            {currency(inv.outstandingAmount)}
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusVariant(inv.paymentStatus)}>
                              {inv.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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