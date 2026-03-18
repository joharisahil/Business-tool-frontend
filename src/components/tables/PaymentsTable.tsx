import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaymentRecord } from "@/pages/inventory/types/dashboard";

interface PaymentsTableProps {
  data?: {
    data: PaymentRecord[];
    summary: {
      totalReceived: number;
      totalPayments: number;
      avgPayment: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

function currency(val: number): string {
  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(val);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    UPI: "UPI",
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
    CHEQUE: "Cheque",
    CARD: "Card",
  };
  return map[method] || method;
}

export function PaymentsTable({ data, isLoading, isError, page, onPageChange }: PaymentsTableProps) {
  if (isError) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Failed to load payments.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Summary Cards */}
      {data?.summary && !isLoading && (
        <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/20">
          <div>
            <p className="text-xs text-muted-foreground">Total Received</p>
            <p className="text-lg font-bold text-success">{currency(data.summary.totalReceived)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Payments</p>
            <p className="text-lg font-bold">{data.summary.totalPayments}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average Payment</p>
            <p className="text-lg font-bold">{currency(data.summary.avgPayment)}</p>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              </TableRow>
            ))
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell className="font-medium font-mono text-xs">
                  {payment.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {payment.invoice_id?.customerName || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {payment.customer_id}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currency(payment.amount)}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {getPaymentMethodLabel(payment.method)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {payment.reference || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(payment.receivedAt || payment.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} payments
          </p>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              disabled={page <= 1} 
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              disabled={page >= data.pagination.totalPages} 
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};