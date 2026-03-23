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
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getAuditLogsApi } from "@/api/inventoryApi";
import type { AuditLogEntry } from "@/pages/inventory/types/inventory";
import { useDebounce } from "@/hooks/useDebounce";

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

// API Response type
interface AuditLogsApiResponse {
  success: boolean;
  data: AuditLogEntry[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const AuditTrail = () => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 500);

  /* ================= FETCH FROM BACKEND WITH PAGINATION ================= */
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        
        const params: any = {
          page,
          limit,
        };
        
        if (debouncedSearch) params.search = debouncedSearch;
        if (entityFilter !== "all") params.entityType = entityFilter;
        if (actionFilter !== "all") params.action = actionFilter;
        if (dateFrom) params.fromDate = dateFrom;
        if (dateTo) params.toDate = dateTo;
        
        const response = await getAuditLogsApi(params);
        
        // Handle different response formats
        if (response && Array.isArray(response)) {
          setAuditLog(response);
          setTotalItems(response.length);
          setTotalPages(Math.ceil(response.length / limit));
        } else if (response && response.data && Array.isArray(response.data)) {
          setAuditLog(response.data);
          setTotalItems(response.total || response.data.length);
          setTotalPages(response.pages || Math.ceil((response.total || response.data.length) / limit));
        } else {
          setAuditLog([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [page, limit, debouncedSearch, entityFilter, actionFilter, dateFrom, dateTo]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, entityFilter, actionFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch("");
    setEntityFilter("all");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const formatAuditValue = (value: string) => {
    if (!value) return "—";
    
    try {
      const parsed = JSON.parse(value);

      if (parsed.invoiceState) {
        return parsed.invoiceState;
      }

      if (parsed.paymentStatus) {
        return parsed.paymentStatus;
      }

      if (parsed.stock !== undefined) {
        return parsed.stock;
      }

      if (parsed.isActive !== undefined) {
        return parsed.isActive ? "Active" : "Inactive";
      }

      return Object.entries(parsed)
        .filter(([_, val]) => typeof val !== "object")
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
    } catch {
      return value;
    }
  };

  const hasActiveFilters = search || entityFilter !== "all" || actionFilter !== "all" || dateFrom || dateTo;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Trail</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Immutable log of all financial, inventory, and system operations
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear All Filters
            </Button>
          )}
        </div>

        {/* FILTER CARD */}
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
                  }}
                  className="pl-9"
                />
              </div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                }}
                className="w-40"
                placeholder="From Date"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                }}
                className="w-40"
                placeholder="To Date"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Select
                value={entityFilter}
                onValueChange={(v) => {
                  setEntityFilter(v);
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
                  <SelectItem value="SALES_INVOICE">Sales Invoices</SelectItem>
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
                  <SelectItem value="CUSTOMER">Customers</SelectItem>
                  <SelectItem value="INVENTORY_ITEM">Inventory Items</SelectItem>
                  <SelectItem value="INVENTORY_CATEGORY">Categories</SelectItem>
                  <SelectItem value="USER">Users</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v);
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

              {loading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </div>
              )}
              
              <span className="text-xs text-muted-foreground ml-auto">
                {totalItems} records found
              </span>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardContent className="p-0">
            {loading && auditLog.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading audit logs...</p>
                </div>
              </div>
            ) : (
              <>
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
                      {auditLog.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                            {hasActiveFilters
                              ? "No audit logs match your filters"
                              : "No audit logs found."}
                          </td>
                        </tr>
                      )}
                      {auditLog.map((entry) => (
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
                              {entry.entityType?.replace(/_/g, " ") || "—"}
                            </Badge>
                          </td>

                          <td className="px-5 py-3 text-center">
                            <Badge
                              variant="outline"
                              className={`${actionStyles[entry.action] || ""} text-[10px] whitespace-nowrap`}
                            >
                              {entry.action?.replace(/_/g, " ") || "—"}
                            </Badge>
                          </td>

                          <td className="px-5 py-3 max-w-xs">
                            <p className="truncate" title={entry.description}>
                              {entry.description || "—"}
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
                            ) : entry.afterValue ? (
                              <span className="text-success font-semibold">
                                {formatAuditValue(entry.afterValue)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          <td className="px-5 py-3 font-medium whitespace-nowrap">
                            {entry.performedBy || "System"}
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

                {/* Pagination */}
                {totalPages > 0 && (
                  <DataTablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={limit}
                    totalItems={totalItems}
                    onPageChange={(newPage: number) => setPage(newPage)}
                    onPageSizeChange={(newSize: number) => {
                      setLimit(newSize);
                      setPage(1);
                    }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AuditTrail;