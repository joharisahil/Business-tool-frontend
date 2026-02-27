import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getAuditLogsApi } from "@/api/inventoryApi";
import type { AuditLogEntry } from "@/types/inventory";

const actionStyles: Record<string, string> = {
  CREATED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  UPDATED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POSTED: "bg-primary/10 text-primary border-primary/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  REVERSED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  PAYMENT_RECORDED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  ACTIVATED: "bg-success/10 text-success border-success/20",
  DEACTIVATED: "bg-muted text-muted-foreground border-border",
  STOCK_IN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  STOCK_OUT: "bg-destructive/10 text-destructive border-destructive/20",
  ADJUSTED: "bg-warning/10 text-warning border-warning/20",
};

const roleStyles: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  Accountant: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FrontDesk: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const PAGE_SIZE = 10;

const AuditTrail = () => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH FROM BACKEND ================= */

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const data = await getAuditLogsApi(); // must return mapped array
        setAuditLog(data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return auditLog
      .filter((e) => entityFilter === "all" || e.entityType === entityFilter)
      .filter((e) => actionFilter === "all" || e.action === actionFilter)
      .filter(
        (e) =>
          search === "" ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.performedBy.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((e) => !dateFrom || new Date(e.performedAt) >= new Date(dateFrom))
      .filter(
        (e) =>
          !dateTo || new Date(e.performedAt) <= new Date(dateTo + "T23:59:59"),
      )
      .sort(
        (a, b) =>
          new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
      );
  }, [auditLog, search, entityFilter, actionFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setEntityFilter("all");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };
  const formatAuditValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);

      // If invoiceState exists → show only that
      if (parsed.invoiceState) {
        return parsed.invoiceState;
      }

      // If paymentStatus exists → show that cleanly
      if (parsed.paymentStatus) {
        return parsed.paymentStatus;
      }

      // If stock adjustment
      if (parsed.stock !== undefined) {
        return parsed.stock;
      }

      return Object.entries(parsed)
        .filter(([_, val]) => typeof val !== "object")
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    } catch {
      return value;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Immutable log of all financial, inventory, and system operations
          </p>
        </div>

        {/* FILTER CARD (UNCHANGED UI) */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description or user..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={entityFilter}
                onValueChange={(v) => {
                  setEntityFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="PURCHASE_INVOICE">
                    Purchase Invoices
                  </SelectItem>
                  <SelectItem value="PAYMENT">Payments</SelectItem>
                  <SelectItem value="JOURNAL_ENTRY">Journal Entries</SelectItem>
                  <SelectItem value="STOCK_TRANSACTION">
                    Stock Transactions
                  </SelectItem>
                  <SelectItem value="STOCK_ADJUSTMENT">
                    Stock Adjustments
                  </SelectItem>
                  <SelectItem value="CREDIT_NOTE">Credit Notes</SelectItem>
                  <SelectItem value="VENDOR">Vendors</SelectItem>
                  <SelectItem value="INVENTORY_ITEM">
                    Inventory Items
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.keys(actionStyles).map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(search ||
                entityFilter !== "all" ||
                actionFilter !== "all" ||
                dateFrom ||
                dateTo) && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              )}

              <span className="text-xs text-muted-foreground self-center ml-auto">
                {filtered.length} records found
              </span>
            </div>
          </CardContent>
        </Card>

        {/* TABLE (UNCHANGED UI) */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Timestamp
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Entity
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Action
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Description
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                      Before → After
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      By
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase">
                      Role
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {paginated.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(entry.performedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] whitespace-nowrap"
                        >
                          {entry.entityType.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-5 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`${actionStyles[entry.action] || ""} text-[10px] whitespace-nowrap`}
                        >
                          {entry.action.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-5 py-3 max-w-xs">
                        <p className="truncate" title={entry.description}>
                          {entry.description}
                        </p>
                      </td>

                    <td className="px-5 py-3 text-xs whitespace-nowrap">
  {entry.beforeValue && entry.afterValue ? (
    <span className="flex items-center gap-2">
      <span className="text-destructive line-through truncate max-w-[200px]">
        {formatAuditValue(entry.beforeValue)}
      </span>

      <span className="text-muted-foreground">→</span>

      <span className="text-success font-semibold truncate max-w-[200px]">
        {formatAuditValue(entry.afterValue)}
      </span>
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  )}
</td>

                      <td className="px-5 py-3 font-medium whitespace-nowrap">
                        {entry.performedBy}
                      </td>

                      <td className="px-5 py-3 text-center">
                        {entry.role && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${roleStyles[entry.role] || ""}`}
                          >
                            {entry.role}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AuditTrail;
