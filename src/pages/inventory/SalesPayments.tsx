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
import { getAllSalesPaymentsApi } from "@/api/inventoryApi";
import { useEffect, useState } from "react";
import { IndianRupee, CreditCard, Banknote, Smartphone, Search, Calendar, Filter } from "lucide-react";

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

// API Response type
interface PaymentsApiResponse {
  success: boolean;
  data: any[];
  total: number;
  page: number;
  pages: number;
}

const SalesPayments = () => {
  const [salesPayments, setSalesPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [page, limit, search, methodFilter, dateRange.from, dateRange.to]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
      
      if (search) params.search = search;
      if (methodFilter !== "ALL") params.method = methodFilter;
      if (dateRange.from) params.fromDate = dateRange.from;
      if (dateRange.to) params.toDate = dateRange.to;
      
      const response = await getAllSalesPaymentsApi(params);
      
      // Handle different response formats
      if (response && Array.isArray(response)) {
        // If response is an array (old format)
        setSalesPayments(response);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / limit));
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response has data property (new format)
        setSalesPayments(response.data);
        setTotalItems(response.total || response.data.length);
        setTotalPages(response.pages || Math.ceil((response.total || response.data.length) / limit));
      } else {
        // Fallback
        setSalesPayments([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
      setSalesPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total collected from current page
  const totalCollected = salesPayments.reduce(
    (s, p) => s + (p.amount || 0),
    0
  );

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Handle method filter
  const handleMethodFilter = (value: string) => {
    setMethodFilter(value);
    setPage(1);
  };

  // Handle date filter
  const handleDateFilter = () => {
    setPage(1);
    loadPayments();
  };

  const clearDateFilter = () => {
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  // Reset all filters
  const clearAllFilters = () => {
    setSearch("");
    setMethodFilter("ALL");
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Payment receipts against sales invoices
          </p>
        </div>
        
        {(search || methodFilter !== "ALL" || dateRange.from || dateRange.to) && (
          <Button variant="outline" onClick={clearAllFilters} size="sm">
            Clear Filters
          </Button>
        )}
      </div>

      {/* 🔹 Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Collected (Current Page)
                </p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  ₹{totalCollected.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {salesPayments.length} transactions on this page
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold mt-1">{totalItems}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Across all pages
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔹 Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or reference..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Method Filter */}
        <Select value={methodFilter} onValueChange={handleMethodFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="CHEQUE">Cheque</SelectItem>
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
        <Card className="p-4">
          <div className="flex items-end gap-4">
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
        </Card>
      )}

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span>Loading payments...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : salesPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search || methodFilter !== "ALL" || dateRange.from || dateRange.to
                      ? "No payments match your filters"
                      : "No payments found"}
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

      {/* 🔹 Pagination */}
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
    </div>
  );
};

export default SalesPayments;
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { getAllSalesPaymentsApi } from "@/api/inventoryApi";
// import { useEffect, useState } from "react";
// import { IndianRupee, CreditCard, Banknote, Smartphone } from "lucide-react";

// // 🔹 Icons per method
// const methodIcons: Record<string, any> = {
//   CASH: Banknote,
//   UPI: Smartphone,
//   BANK_TRANSFER: CreditCard,
//   CHEQUE: CreditCard,
//   CARD: CreditCard,
// };

// // 🔹 Color system (same as dashboard)
// const paymentMethodStyles: Record<
//   string,
//   { bg: string; text: string }
// > = {
//   UPI: {
//     bg: "bg-purple-100",
//     text: "text-purple-600",
//   },
//   CASH: {
//     bg: "bg-green-100",
//     text: "text-green-600",
//   },
//   BANK_TRANSFER: {
//     bg: "bg-blue-100",
//     text: "text-blue-600",
//   },
//   CARD: {
//     bg: "bg-orange-100",
//     text: "text-orange-600",
//   },
//   CHEQUE: {
//     bg: "bg-gray-100",
//     text: "text-gray-600",
//   },
// };

// const SalesPayments = () => {
//   const [salesPayments, setSalesPayments] = useState<any[]>([]);

//   useEffect(() => {
//     loadPayments();
//   }, []);

//   const loadPayments = async () => {
//     try {
//       const data = await getAllSalesPaymentsApi();
//       setSalesPayments(data);
//     } catch (err) {
//       console.error("Failed to load payments", err);
//     }
//   };

//   const totalCollected = salesPayments.reduce(
//     (s, p) => s + (p.amount || 0),
//     0
//   );

//   return (
//     <div className="space-y-6">

//       {/* 🔹 Header */}
//       <div>
//         <h1 className="text-2xl font-bold">Sales Payments</h1>
//         <p className="text-muted-foreground text-sm mt-1">
//           Payment receipts against sales invoices
//         </p>
//       </div>

//       {/* 🔹 Summary Card */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="border-green-200">
//           <CardContent className="p-5">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Collected
//                 </p>
//                 <p className="text-2xl font-bold mt-1 text-green-600">
//                   ₹{totalCollected.toLocaleString("en-IN")}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-0.5">
//                   {salesPayments.length} transactions
//                 </p>
//               </div>

//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
//                 <IndianRupee className="h-5 w-5" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* 🔹 Table */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base">Payment History</CardTitle>
//         </CardHeader>

//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Invoice</TableHead>
//                 <TableHead>Method</TableHead>
//                 <TableHead>Reference</TableHead>
//                 <TableHead className="text-right">Amount</TableHead>
//                 <TableHead>Received At</TableHead>
//                 <TableHead>Recorded By</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {salesPayments.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
//                     No payments found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 salesPayments.map((p) => {
//                   const Icon = methodIcons[p.method] || CreditCard;

//                   const style = paymentMethodStyles[p.method] || {
//                     bg: "bg-gray-100",
//                     text: "text-gray-600",
//                   };

//                   return (
//                     <TableRow
//                       key={p._id}
//                       className="hover:bg-muted/30 transition-colors"
//                     >
//                       {/* Invoice */}
//                       <TableCell className="font-mono text-xs">
//                         {p.invoice_id?.invoiceNumber || "—"}
//                       </TableCell>

//                       {/* Method with color */}
//                       <TableCell>
//                         <Badge
//                           className={`gap-1 text-[10px] border-0 ${style.bg} ${style.text}`}
//                         >
//                           <Icon className="h-3 w-3" />
//                           {p.method}
//                         </Badge>
//                       </TableCell>

//                       {/* Reference */}
//                       <TableCell className="text-xs text-muted-foreground font-mono">
//                         {p.reference || "—"}
//                       </TableCell>

//                       {/* Amount */}
//                       <TableCell className="text-right font-semibold text-green-600">
//                         ₹{p.amount.toLocaleString("en-IN")}
//                       </TableCell>

//                       {/* Date */}
//                       <TableCell className="text-xs text-muted-foreground">
//                         {p.receivedAt
//                           ? `${new Date(p.receivedAt).toLocaleDateString("en-IN")} ${new Date(
//                               p.receivedAt
//                             ).toLocaleTimeString("en-IN", {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}`
//                           : "—"}
//                       </TableCell>

//                       {/* Recorded By */}
//                       <TableCell className="text-sm">
//                         {p.recordedBy?.name || "—"}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SalesPayments;