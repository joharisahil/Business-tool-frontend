import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { useState, useEffect, useMemo } from "react";
import { getStockTransactionsApi } from "@/api/inventoryApi";
import { Search, Filter, Calendar } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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
  ADJUSTMENT: "bg-warning/10 text-warning border-warning/20",
  SALES: "bg-success/10 text-success border-success/20",
  SALES_CREDIT_NOTE: "bg-destructive/10 text-destructive border-destructive/20",
};

// API Response type
interface StockTransactionsResponse {
  success: boolean;
  data: any[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const StockTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [refFilter, setRefFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        const params: any = {
          page,
          limit,
        };
        
        if (typeFilter !== "all") params.type = typeFilter;
        if (refFilter !== "all") params.referenceType = refFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        if (dateRange.from) params.fromDate = dateRange.from;
        if (dateRange.to) params.toDate = dateRange.to;
        
        const response = await getStockTransactionsApi(params);
        
        // Handle different response formats
        if (response && Array.isArray(response)) {
          // If response is an array (old format)
          setTransactions(response);
          setTotalItems(response.length);
          setTotalPages(Math.ceil(response.length / limit));
        } else if (response && response.data && Array.isArray(response.data)) {
          // If response has data property (new format with pagination)
          setTransactions(response.data);
          setTotalItems(response.total || response.data.length);
          setTotalPages(response.pages || Math.ceil((response.total || response.data.length) / limit));
        } else {
          setTransactions([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to load stock transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page, limit, typeFilter, refFilter, debouncedSearch, dateRange.from, dateRange.to]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, refFilter, debouncedSearch, dateRange.from, dateRange.to]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleDateFilter = () => {
    setPage(1);
  };

  const clearDateFilter = () => {
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  const clearAllFilters = () => {
    setTypeFilter("all");
    setRefFilter("all");
    setSearch("");
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  const hasActiveFilters = typeFilter !== "all" || refFilter !== "all" || search || dateRange.from || dateRange.to;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete audit trail of all stock movements
          </p>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, Item Name, or Reference..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Type Filter */}
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
            
            {/* Reference Filter */}
            <Select value={refFilter} onValueChange={setRefFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Reference Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All References</SelectItem>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
                <SelectItem value="ROOM_USAGE">Room Usage</SelectItem>
                <SelectItem value="WASTAGE">Wastage</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Date Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Date Range
              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Date Range Picker */}
          {showDateFilter && (
            <div className="flex items-end gap-4 pt-2 border-t">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">From Date</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">To Date</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleDateFilter} className="gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
              {(dateRange.from || dateRange.to) && (
                <Button variant="outline" onClick={clearDateFilter}>
                  Clear
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading stock transactions...</p>
              </div>
            </div>
          ) : (
            <>
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
                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-8 text-center text-muted-foreground"
                        >
                          {hasActiveFilters 
                            ? "No stock transactions match your filters" 
                            : "No stock transactions found."}
                        </td>
                      </tr>
                    )}
                    {transactions.map((txn) => (
                      <tr
                        key={txn.id || txn._id}
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
                          className={`px-5 py-3 text-right font-semibold ${
                            txn.type === "IN" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {txn.type === "IN" ? "+" : "-"}
                          {Math.abs(txn.quantity)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {txn.balanceAfter}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                          {txn.notes || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {txn.createdBy?.name || "System"}
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
  );
};

export default StockTransactions;
// import { Layout as AppLayout } from "@/components/layout/Layout";

// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useState, useEffect } from "react";
// import { getStockTransactionsApi } from "@/api/inventoryApi";

// const typeStyles: Record<string, string> = {
//   IN: "bg-success/10 text-success border-success/20",
//   OUT: "bg-destructive/10 text-destructive border-destructive/20",
//   ADJUSTMENT: "bg-warning/10 text-warning border-warning/20",
// };

// const refStyles: Record<string, string> = {
//   PURCHASE: "bg-info/10 text-info border-info/20",
//   ROOM_USAGE: "bg-accent/10 text-accent border-accent/20",
//   WASTAGE: "bg-destructive/10 text-destructive border-destructive/20",
//   MANUAL: "bg-muted text-muted-foreground",
// };

// const StockTransactions = () => {
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [refFilter, setRefFilter] = useState("all");

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         setLoading(true);
//         const data = await getStockTransactionsApi();
//         setTransactions(data);
//       } catch (err) {
//         console.error("Failed to load stock transactions", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, []);
//   const filtered = transactions.filter((txn) => {
//     return (
//       (typeFilter === "all" || txn.type === typeFilter) &&
//       (refFilter === "all" || txn.referenceType === refFilter)
//     );
//   });

//   return (
     
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold">Stock Transactions</h1>
//           <p className="text-muted-foreground text-sm mt-1">
//             Complete audit trail of all stock movements
//           </p>
//         </div>

//         <Card>
//           <CardContent className="p-4">
//             <div className="flex flex-col sm:flex-row gap-3">
//               <Select value={typeFilter} onValueChange={setTypeFilter}>
//                 <SelectTrigger className="w-full sm:w-[180px]">
//                   <SelectValue placeholder="Transaction Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="IN">Stock In</SelectItem>
//                   <SelectItem value="OUT">Stock Out</SelectItem>
//                   <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={refFilter} onValueChange={setRefFilter}>
//                 <SelectTrigger className="w-full sm:w-[180px]">
//                   <SelectValue placeholder="Reference Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All References</SelectItem>
//                   <SelectItem value="PURCHASE">Purchase</SelectItem>
//                   <SelectItem value="ROOM_USAGE">Room Usage</SelectItem>
//                   <SelectItem value="WASTAGE">Wastage</SelectItem>
//                   <SelectItem value="MANUAL">Manual</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-0">
//             {loading ? (
//               <div className="p-6 text-sm text-muted-foreground">
//                 Loading stock transactions...
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b border-border bg-muted/30">
//                       <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Date/Time
//                       </th>
//                       <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         SKU
//                       </th>
//                       <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Item
//                       </th>
//                       <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Type
//                       </th>
//                       <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Reference
//                       </th>
//                       <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Qty
//                       </th>
//                       <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Balance
//                       </th>
//                       <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         Notes
//                       </th>
//                       <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                         By
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-border">
//                     {filtered.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={9}
//                           className="px-5 py-8 text-center text-muted-foreground"
//                         >
//                           No stock transactions found.
//                         </td>
//                       </tr>
//                     )}
//                     {filtered.map((txn) => (
//                       <tr
//                         key={txn.id}
//                         className="hover:bg-muted/30 transition-colors"
//                       >
//                         <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
//                           {new Date(txn.createdAt).toLocaleString("en-IN", {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </td>
//                         <td className="px-5 py-3 font-mono text-xs">
//                           {txn.itemSku}
//                         </td>
//                         <td className="px-5 py-3 font-medium">
//                           {txn.itemName}
//                         </td>
//                         <td className="px-5 py-3 text-center">
//                           <Badge
//                             variant="outline"
//                             className={typeStyles[txn.type]}
//                           >
//                             {txn.type}
//                           </Badge>
//                         </td>
//                         <td className="px-5 py-3 text-center">
//                           <Badge
//                             variant="outline"
//                             className={`${refStyles[txn.referenceType]} text-xs`}
//                           >
//                             {txn.referenceType}
//                           </Badge>
//                         </td>
//                         <td
//                           className={`px-5 py-3 text-right font-semibold ${txn.type === "IN" ? "text-success" : "text-destructive"}`}
//                         >
//                           {txn.type === "IN" ? "+" : "-"}
//                           {Math.abs(txn.quantity)}
//                         </td>
//                         <td className="px-5 py-3 text-right">
//                           {txn.balanceAfter}
//                         </td>
//                         <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
//                           {txn.notes}
//                         </td>
//                         <td className="px-5 py-3 text-xs text-muted-foreground">
//                           {txn.createdBy?.name}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
     
//   );
// };

// export default StockTransactions;
