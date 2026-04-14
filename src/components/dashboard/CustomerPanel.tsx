import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreditCard } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useCustomerDashboard } from "@/hooks/use-dashboard";
import { CustomerBillsPDFButton } from "./CustomerBillsPDFButton";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { recordSalesPaymentApi } from "@/api/inventoryApi";

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

// ✅ Enhanced badge variants with proper colors
function getPaymentStatusConfig(status: string) {
  switch (status) {
    case "PAID":
      return {
        variant: "success" as const,
        color: "bg-green-100 text-green-800 border-green-200",
        icon: "✅",
        label: "Paid"
      };
    case "PARTIAL":
      return {
        variant: "warning" as const,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "⚠️",
        label: "Partial"
      };
    case "UNPAID":
      return {
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "❌",
        label: "Unpaid"
      };
    default:
      return {
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "📄",
        label: status
      };
  }
}

// ✅ Invoice state badge variants
function getInvoiceStateConfig(state: string) {
  switch (state) {
    case "DRAFT":
      return {
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "📝",
        label: "Draft"
      };
    case "APPROVED":
      return {
        variant: "info" as const,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "✓",
        label: "Approved"
      };
    case "POSTED":
      return {
        variant: "default" as const,
        color: "bg-green-100 text-green-800 border-green-200",
        icon: "🔒",
        label: "Posted"
      };
    case "CANCELLED":
      return {
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "✗",
        label: "Cancelled"
      };
    default:
      return {
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "📄",
        label: state
      };
  }
}

export function CustomerPanel({ customerId, onClose }: CustomerPanelProps) {
  const { data, isLoading, isError, refetch } = useCustomerDashboard(customerId);
  const { toast } = useToast();
  
  // State for payment dialog
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // ✅ Safe data extraction
  const responseData = data?.data || data;
  const summary = responseData?.summary;
  const invoices = responseData?.invoices || [];
  const customerName = invoices.length > 0 ? invoices[0]?.customerName : "Customer";

  // Handle payment record
  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount || !paymentRef) {
      toast({
        title: "Missing fields",
        description: "Please fill all payment details",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedInvoice.outstandingAmount) {
      toast({
        title: "Invalid amount",
        description: `Payment cannot exceed outstanding amount of ${currency(selectedInvoice.outstandingAmount)}`,
        variant: "destructive",
      });
      return;
    }

    setIsPaying(true);
    try {
      await recordSalesPaymentApi(selectedInvoice._id, {
        amount: amount,
        method: paymentMethod,
        reference: paymentRef,
      });

      toast({
        title: "Payment Recorded",
        description: `Successfully recorded ${currency(amount)} payment`,
      });

      await refetch();
      
      setPaymentOpen(false);
      setSelectedInvoice(null);
      setPaymentAmount("");
      setPaymentRef("");
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };

  // Handle click on invoice row
  const handleInvoiceClick = (invoice: any) => {
    if (invoice.paymentStatus === "UNPAID" || invoice.paymentStatus === "PARTIAL") {
      setSelectedInvoice(invoice);
      setPaymentOpen(true);
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Sheet open={!!customerId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {/* HEADER */}
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>
              {isLoading ? <Skeleton className="h-6 w-40" /> : customerName}
            </SheetTitle>

            {!isLoading && customerId && invoices.length > 0 && (
              <CustomerBillsPDFButton
                customerId={customerId}
                customerName={customerName}
                customerEmail={invoices[0]?.customerEmail}
                customerPhone={invoices[0]?.customerPhone}
                customerAddress={invoices[0]?.customerAddress}
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
              {/* SUMMARY CARDS with colors */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-blue-600 font-medium">Total Orders</p>
                    {isLoading ? (
                      <Skeleton className="mx-auto mt-1 h-6 w-16" />
                    ) : (
                      <p className="mt-0.5 text-2xl font-bold text-blue-700">
                        {summary?.totalOrders ?? "—"}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-green-600 font-medium">Total Spent</p>
                    {isLoading ? (
                      <Skeleton className="mx-auto mt-1 h-6 w-16" />
                    ) : (
                      <p className="mt-0.5 text-lg font-bold text-green-700">
                        {summary ? currency(summary.totalSpent) : "—"}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-orange-600 font-medium">Pending</p>
                    {isLoading ? (
                      <Skeleton className="mx-auto mt-1 h-6 w-16" />
                    ) : (
                      <p className="mt-0.5 text-lg font-bold text-orange-700">
                        {summary ? currency(summary.totalPending) : "—"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* INVOICE HISTORY TABLE */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Invoice History
                </h3>

                <div className="rounded-lg border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Invoice #</TableHead>
                          <TableHead className="font-semibold">Bill Date</TableHead>
                          <TableHead className="text-right font-semibold">Amount</TableHead>
                          <TableHead className="text-right font-semibold">Paid</TableHead>
                          <TableHead className="text-right font-semibold">Due</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Invoice State</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 7 }).map((_, j) => (
                                <TableCell key={j}>
                                  <Skeleton className="h-4 w-16" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : invoices.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-20 text-center text-muted-foreground"
                            >
                              No invoices found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          invoices.map((inv: any) => {
                            const isClickable = inv.paymentStatus === "UNPAID" || inv.paymentStatus === "PARTIAL";
                            const paymentConfig = getPaymentStatusConfig(inv.paymentStatus);
                            const stateConfig = getInvoiceStateConfig(inv.invoiceState);
                            
                            return (
                              <TableRow
                                key={inv._id}
                                className={
                                  isClickable
                                    ? "cursor-pointer hover:bg-muted/50 transition-colors"
                                    : ""
                                }
                                onClick={() => isClickable && handleInvoiceClick(inv)}
                              >
                                <TableCell className="font-mono text-xs font-medium">
                                  {inv.invoiceNumber}
                                </TableCell>

                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                  {formatDate(inv.createdAt)}
                                </TableCell>

                                <TableCell className="text-right font-medium whitespace-nowrap">
                                  {currency(inv.grandTotal)}
                                </TableCell>

                                <TableCell className="text-right text-success whitespace-nowrap">
                                  {currency(inv.paidAmount)}
                                </TableCell>

                                <TableCell className="text-right whitespace-nowrap">
                                  {inv.outstandingAmount > 0 ? (
                                    <span className="text-destructive font-bold">
                                      {currency(inv.outstandingAmount)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      {currency(inv.outstandingAmount)}
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell>
                                  <Badge className={`${paymentConfig.color} font-medium px-2 py-1`}>
                                    <span className="mr-1">{paymentConfig.icon}</span>
                                    {paymentConfig.label}
                                  </Badge>
                                </TableCell>

                                <TableCell>
                                  <Badge className={`${stateConfig.color} font-medium px-2 py-1`}>
                                    <span className="mr-1">{stateConfig.icon}</span>
                                    {stateConfig.label}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Payment Hint */}
                {!isLoading && invoices.some((inv: any) => inv.paymentStatus === "UNPAID" || inv.paymentStatus === "PARTIAL") && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center flex items-center justify-center gap-2">
                      <span>💡</span>
                      Click on any 
                      <Badge className="bg-red-100 text-red-800">UNPAID</Badge>
                      or 
                      <Badge className="bg-yellow-100 text-yellow-800">PARTIAL</Badge>
                      invoice to record payment
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* PAYMENT DIALOG */}
      <Dialog open={paymentOpen} onOpenChange={(open) => {
        if (!open) {
          setPaymentOpen(false);
          setSelectedInvoice(null);
          setPaymentAmount("");
          setPaymentRef("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-600" />
              Record Payment
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Summary */}
              <div className="text-sm space-y-2 p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono font-bold">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Date</span>
                  <span>{formatDate(selectedInvoice.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{selectedInvoice.customerName}</span>
                </div>
                
                <div className="border-t my-2"></div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grand Total</span>
                  <span className="font-semibold">{currency(selectedInvoice.grandTotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="text-green-600 font-semibold">
                    {currency(selectedInvoice.paidAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between bg-orange-50 p-2 rounded -mx-2">
                  <span className="font-semibold">Outstanding Balance</span>
                  <span className="text-orange-600 font-bold text-base">
                    {currency(selectedInvoice.outstandingAmount)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <span>📝</span>
                  Journal Entry: Cash/Bank (Dr) → Accounts Receivable (Cr)
                </p>
              </div>

              {/* Payment Form */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-semibold">
                    Payment Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Enter amount (Max: ${currency(selectedInvoice.outstandingAmount)})`}
                    className="font-mono"
                  />
                  {paymentAmount && parseFloat(paymentAmount) > selectedInvoice.outstandingAmount && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      Amount exceeds outstanding balance
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method" className="font-semibold">
                    Payment Method *
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">💳 UPI</SelectItem>
                      <SelectItem value="CASH">💵 Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">🏦 Bank Transfer</SelectItem>
                      <SelectItem value="CHEQUE">📝 Cheque</SelectItem>
                      <SelectItem value="CARD">💳 Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="font-semibold">
                    Reference / Transaction ID *
                  </Label>
                  <Input
                    id="reference"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="UPI ID / Transaction Ref / Cheque No."
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={isPaying || !paymentAmount || !paymentRef || (selectedInvoice && parseFloat(paymentAmount) > selectedInvoice.outstandingAmount)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
            >
              {isPaying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useCustomerDashboard } from "@/hooks/use-dashboard";
// import { CustomerBillsPDFButton } from "./CustomerBillsPDFButton";

// interface CustomerPanelProps {
//   customerId: string | null;
//   onClose: () => void;
// }

// // ✅ Safe currency formatter
// function currency(val: number = 0) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(val);
// }

// // ✅ Correct badge variants (as per your UI)
// function statusVariant(status: string) {
//   switch (status) {
//     case "PAID":
//       return "default";
//     case "PARTIAL":
//       return "secondary";
//     case "UNPAID":
//       return "destructive";
//     default:
//       return "outline";
//   }
// }

// export function CustomerPanel({ customerId, onClose }: CustomerPanelProps) {
//   const { data, isLoading, isError } = useCustomerDashboard(customerId);

//   // ✅ Safe data extraction
//   const summary = data?.summary;
//   const invoices = data?.invoices || [];
//   const customerName =
//     invoices.length > 0 ? invoices[0]?.customerName : "Customer";

//   return (
//     <Sheet open={!!customerId} onOpenChange={(open) => !open && onClose()}>
//       <SheetContent className="w-full overflow-y-auto sm:max-w-lg">

//         {/* HEADER */}
//         <SheetHeader className="flex flex-row items-center justify-between">
//           <SheetTitle>
//             {isLoading ? (
//               <Skeleton className="h-6 w-40" />
//             ) : (
//               customerName
//             )}
//           </SheetTitle>

//           {!isLoading && customerId && (
//     <CustomerBillsPDFButton
//       customerId={customerId}
//       customerName={customerName}
//       customerEmail={invoices[0]?.customerEmail} // Add if you have email
//       customerPhone={invoices[0]?.customerPhone} // Add if you have phone
//       customerAddress={invoices[0]?.customerAddress} // Add if you have address
//     />
//   )}
//         </SheetHeader>

//         {/* ERROR */}
//         {isError ? (
//           <p className="mt-6 text-center text-muted-foreground">
//             Failed to load customer data.
//           </p>
//         ) : (
//           <div className="mt-6 space-y-6">

//             {/* SUMMARY */}
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 {
//                   label: "Orders",
//                   value: summary?.totalOrders,
//                 },
//                 {
//                   label: "Total Spent",
//                   value: summary
//                     ? currency(summary.totalSpent)
//                     : undefined,
//                 },
//                 {
//                   label: "Pending",
//                   value: summary
//                     ? currency(summary.totalPending)
//                     : undefined,
//                 },
//               ].map((item) => (
//                 <Card key={item.label}>
//                   <CardContent className="p-4 text-center">
//                     <p className="text-xs text-muted-foreground">
//                       {item.label}
//                     </p>

//                     {isLoading ? (
//                       <Skeleton className="mx-auto mt-1 h-6 w-16" />
//                     ) : (
//                       <p className="mt-0.5 text-lg font-semibold">
//                         {item.value ?? "—"}
//                       </p>
//                     )}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* INVOICE HISTORY */}
//             <div>
//               <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//                 Invoice History
//               </h3>

//               <div className="rounded-lg border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Invoice</TableHead>
//                       <TableHead>Date</TableHead>
//                       <TableHead className="text-right">Amount</TableHead>
//                       <TableHead className="text-right">Due</TableHead>
//                       <TableHead>Status</TableHead>
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {isLoading ? (
//                       Array.from({ length: 3 }).map((_, i) => (
//                         <TableRow key={i}>
//                           {Array.from({ length: 5 }).map((_, j) => (
//                             <TableCell key={j}>
//                               <Skeleton className="h-4 w-16" />
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))
//                     ) : invoices.length === 0 ? (
//                       <TableRow>
//                         <TableCell
//                           colSpan={5}
//                           className="h-20 text-center text-muted-foreground"
//                         >
//                           No invoices.
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       invoices.map((inv: any) => (
//                         <TableRow key={inv._id}>
//                           <TableCell className="font-medium">
//                             {inv.invoiceNumber}
//                           </TableCell>

//                           <TableCell className="text-muted-foreground">
//                             {new Date(inv.createdAt).toLocaleDateString()}
//                           </TableCell>

//                           <TableCell className="text-right">
//                             {currency(inv.grandTotal)}
//                           </TableCell>

//                           <TableCell className="text-right">
//                             {currency(inv.outstandingAmount)}
//                           </TableCell>

//                           <TableCell>
//                             <Badge variant={statusVariant(inv.paymentStatus)}>
//                               {inv.paymentStatus}
//                             </Badge>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>

//           </div>
//         )}
//       </SheetContent>
//     </Sheet>
//   );
// }