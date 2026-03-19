import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllSalesPaymentsApi } from "@/api/inventoryApi";
import { useEffect, useState } from "react";
import { IndianRupee, CreditCard, Banknote, Smartphone } from "lucide-react";

// 🔹 Icons per method
const methodIcons: Record<string, any> = {
  CASH: Banknote,
  UPI: Smartphone,
  BANK_TRANSFER: CreditCard,
  CHEQUE: CreditCard,
  CARD: CreditCard,
};

// 🔹 Color system (same as dashboard)
const paymentMethodStyles: Record<
  string,
  { bg: string; text: string }
> = {
  UPI: {
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  CASH: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  BANK_TRANSFER: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  CARD: {
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
  CHEQUE: {
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
};

const SalesPayments = () => {
  const [salesPayments, setSalesPayments] = useState<any[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await getAllSalesPaymentsApi();
      setSalesPayments(data);
    } catch (err) {
      console.error("Failed to load payments", err);
    }
  };

  const totalCollected = salesPayments.reduce(
    (s, p) => s + (p.amount || 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* 🔹 Header */}
      <div>
        <h1 className="text-2xl font-bold">Sales Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Payment receipts against sales invoices
        </p>
      </div>

      {/* 🔹 Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Collected
                </p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  ₹{totalCollected.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {salesPayments.length} transactions
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔹 Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Received At</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {salesPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                salesPayments.map((p) => {
                  const Icon = methodIcons[p.method] || CreditCard;

                  const style = paymentMethodStyles[p.method] || {
                    bg: "bg-gray-100",
                    text: "text-gray-600",
                  };

                  return (
                    <TableRow
                      key={p._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Invoice */}
                      <TableCell className="font-mono text-xs">
                        {p.invoice_id?.invoiceNumber || "—"}
                      </TableCell>

                      {/* Method with color */}
                      <TableCell>
                        <Badge
                          className={`gap-1 text-[10px] border-0 ${style.bg} ${style.text}`}
                        >
                          <Icon className="h-3 w-3" />
                          {p.method}
                        </Badge>
                      </TableCell>

                      {/* Reference */}
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {p.reference || "—"}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-muted-foreground">
                        {p.receivedAt
                          ? `${new Date(p.receivedAt).toLocaleDateString("en-IN")} ${new Date(
                              p.receivedAt
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "—"}
                      </TableCell>

                      {/* Recorded By */}
                      <TableCell className="text-sm">
                        {p.recordedBy?.name || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPayments;