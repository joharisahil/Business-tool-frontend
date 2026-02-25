

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
import type { AuditLogEntry } from "./types/inventory";

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
  Admin: "bg-primary/10 text-primary border-primary/20",
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

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const data = await getAuditLogsApi();
        setAuditLog(data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

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
  }, [search, entityFilter, actionFilter, dateFrom, dateTo]);

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

  return (
     
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Immutable log of all financial, inventory, and system operations
          </p>
        </div>

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
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="UPDATED">Updated</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="POSTED">Posted</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REVERSED">Reversed</SelectItem>
                  <SelectItem value="PAYMENT_RECORDED">
                    Payment Recorded
                  </SelectItem>
                  <SelectItem value="STOCK_IN">Stock IN</SelectItem>
                  <SelectItem value="STOCK_OUT">Stock OUT</SelectItem>
                  <SelectItem value="ADJUSTED">Adjusted</SelectItem>
                  <SelectItem value="ACTIVATED">Activated</SelectItem>
                  <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
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
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-muted-foreground"
                      >
                        Loading audit logs...
                      </td>
                    </tr>
                  )}
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
                          <span className="flex items-center gap-1">
                            <span className="text-destructive line-through">
                              {entry.beforeValue}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-success font-semibold">
                              {entry.afterValue}
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
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-muted-foreground"
                      >
                        No audit records match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {filtered.length} records
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2;
              if (pg < 1 || pg > totalPages) return null;
              return (
                <Button
                  key={pg}
                  variant={pg === page ? "default" : "outline"}
                  size="sm"
                  className={`w-8 ${pg === page ? "gold-gradient text-accent-foreground" : ""}`}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
     
  );
};

export default AuditTrail;
