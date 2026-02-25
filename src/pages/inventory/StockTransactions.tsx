import { Layout as AppLayout } from "@/components/layout/Layout";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getStockTransactionsApi } from "@/api/inventoryApi";

const typeStyles: Record<string, string> = {
  IN: "bg-success/10 text-success border-success/20",
  OUT: "bg-destructive/10 text-destructive border-destructive/20",
  ADJUSTMENT: "bg-warning/10 text-warning border-warning/20",
};

const refStyles: Record<string, string> = {
  PURCHASE: "bg-info/10 text-info border-info/20",
  ROOM_USAGE: "bg-accent/10 text-accent border-accent/20",
  WASTAGE: "bg-destructive/10 text-destructive border-destructive/20",
  MANUAL: "bg-muted text-muted-foreground",
};

const StockTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [refFilter, setRefFilter] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getStockTransactionsApi();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to load stock transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);
  const filtered = transactions.filter((txn) => {
    return (
      (typeFilter === "all" || txn.type === typeFilter) &&
      (refFilter === "all" || txn.referenceType === refFilter)
    );
  });

  return (
     
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stock Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete audit trail of all stock movements
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="IN">Stock In</SelectItem>
                  <SelectItem value="OUT">Stock Out</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={refFilter} onValueChange={setRefFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Reference Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All References</SelectItem>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="ROOM_USAGE">Room Usage</SelectItem>
                  <SelectItem value="WASTAGE">Wastage</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading stock transactions...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date/Time
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Item
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-8 text-center text-muted-foreground"
                        >
                          No stock transactions found.
                        </td>
                      </tr>
                    )}
                    {filtered.map((txn) => (
                      <tr
                        key={txn.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(txn.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {txn.itemSku}
                        </td>
                        <td className="px-5 py-3 font-medium">
                          {txn.itemName}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge
                            variant="outline"
                            className={typeStyles[txn.type]}
                          >
                            {txn.type}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge
                            variant="outline"
                            className={`${refStyles[txn.referenceType]} text-xs`}
                          >
                            {txn.referenceType}
                          </Badge>
                        </td>
                        <td
                          className={`px-5 py-3 text-right font-semibold ${txn.type === "IN" ? "text-success" : "text-destructive"}`}
                        >
                          {txn.type === "IN" ? "+" : "-"}
                          {Math.abs(txn.quantity)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {txn.balanceAfter}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                          {txn.notes}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {txn.createdBy?.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
     
  );
};

export default StockTransactions;
