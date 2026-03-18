import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SaleRecord, PaymentStatus } from "@/pages/inventory/types/dashboard";
type InvoiceState = "DRAFT" | "APPROVED" | "POSTED" | "CANCELLED";

interface SalesTableProps {
  data?: {
    data: SaleRecord[];
    summary: {
      totalSales: number;
      totalPaid: number;
      totalPending: number;
      avgOrderValue: number;
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
  onCustomerClick: (customerId: string) => void;
}

function statusVariant(status: PaymentStatus): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PAID: "default",
    UNPAID: "secondary",
    PARTIAL: "secondary",
    PENDING: "secondary",
    OVERDUE: "destructive",
    Paid: "default", // Add capitalized version for backward compatibility
    Unpaid: "secondary",
    Partial: "secondary",
    Pending: "secondary",
    Overdue: "destructive",
  };
  return map[status] || "outline";
}

function getStateStyles(state: InvoiceState): string {
  const styles: Record<InvoiceState, string> = {
    DRAFT: "bg-muted text-muted-foreground border-border",
    APPROVED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    POSTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return styles[state] || "bg-muted text-muted-foreground";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function currency(val: number): string {
  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(val);
}

export function SalesTable({ data, isLoading, isError, page, onPageChange, onCustomerClick }: SalesTableProps) {
  if (isError) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Failed to load sales data.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Summary Cards */}
      {data?.summary && !isLoading && (
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/20">
          <div>
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-lg font-bold text-primary">{currency(data.summary.totalSales)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold text-success">{currency(data.summary.totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Pending</p>
            <p className="text-lg font-bold text-destructive">{currency(data.summary.totalPending)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average Order</p>
            <p className="text-lg font-bold">{currency(data.summary.avgOrderValue)}</p>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invoice State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              </TableRow>
            ))
          ) : !data?.data?.length ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No sales found.
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((sale) => (
              <TableRow
                key={sale._id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onCustomerClick(sale.customer_id)}
              >
                <TableCell className="font-medium font-mono text-xs">
                  {sale.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{sale.customerName}</p>
                    {sale.customerGSTIN && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {sale.customerGSTIN}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(sale.createdAt)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currency(sale.grandTotal)}
                </TableCell>
                <TableCell className="text-right text-success">
                  {currency(sale.paidAmount)}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  {currency(sale.outstandingAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(sale.paymentStatus)}>
                    {sale.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStateStyles(sale.invoiceState)}>
                    {sale.invoiceState}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} records
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
}