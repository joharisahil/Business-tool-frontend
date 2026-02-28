import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Send,
  Ban,
  CreditCard,
  Lock,
  Printer,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import PrintInvoice from "@/components/PrintInvoice";
import type {
  SalesInvoice,
  InvoiceState,
  PaymentMethod,
} from "./types/inventory";

// TODO: Replace with actual API imports when available
import {
  getSalesInvoicesApi,
  createSalesInvoiceApi,
  approveSalesInvoiceApi,
  postSalesInvoiceApi,
  cancelSalesInvoiceApi,
  recordSalesPaymentApi,
  getItemsApi,
} from "@/api/inventoryApi";

// // Stub API functions — replace with real imports
// const getSalesInvoicesApi = async (): Promise<SalesInvoice[]> => [];
// const createSalesInvoiceApi = async (payload: Record<string, unknown>): Promise<SalesInvoice> => {
//   return { id: crypto.randomUUID(), invoiceNumber: `SI-${Date.now()}`, ...payload } as unknown as SalesInvoice;
// };
// const approveSalesInvoiceApi = async (id: string): Promise<SalesInvoice> => ({} as SalesInvoice);
// const postSalesInvoiceApi = async (id: string): Promise<SalesInvoice> => ({} as SalesInvoice);
// const cancelSalesInvoiceApi = async (id: string): Promise<SalesInvoice> => ({} as SalesInvoice);
// const recordSalesPaymentApi = async (id: string, payload: Record<string, unknown>): Promise<SalesInvoice> => ({} as SalesInvoice);
// const getItemsApi = async (): Promise<Array<{ id: string; name: string; sku: string; sellingPrice: number; isActive: boolean }>> => [];

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  isActive: boolean;
}

const statusStyles: Record<string, string> = {
  PAID: "bg-success/10 text-success border-success/20",
  UNPAID: "bg-destructive/10 text-destructive border-destructive/20",
  PARTIAL: "bg-warning/10 text-warning border-warning/20",
};

const stateStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  APPROVED: "bg-info/10 text-info border-info/20",
  POSTED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    invoiceId: string;
    newState: InvoiceState;
    label: string;
  } | null>(null);
  const { toast } = useToast();

  const [customerName, setCustomerName] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "CREDIT">("CREDIT");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("BANK_TRANSFER");
  const [paymentRef, setPaymentRef] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const [lineItems, setLineItems] = useState<
    Array<{
      itemId: string;
      quantity: string;
      unitPrice: string;
      gstPercentage: string;
    }>
  >([{ itemId: "", quantity: "", unitPrice: "", gstPercentage: "18" }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoiceData, itemData] = await Promise.all([
          getSalesInvoicesApi(),
          getItemsApi(),
        ]);
        setInvoices(invoiceData);
        setInventoryItems(itemData);
      } catch (err) {
        console.error("Failed to load sales invoice data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addLineItem = () =>
    setLineItems((prev) => [
      ...prev,
      { itemId: "", quantity: "", unitPrice: "", gstPercentage: "18" },
    ]);

  const removeLineItem = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateLineItem = (idx: number, field: string, value: string) =>
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );

  const calcSubtotal = () =>
    lineItems.reduce(
      (sum, li) =>
        sum + parseFloat(li.quantity || "0") * parseFloat(li.unitPrice || "0"),
      0,
    );

  const calcGst = () =>
    lineItems.reduce((sum, li) => {
      const base =
        parseFloat(li.quantity || "0") * parseFloat(li.unitPrice || "0");
      return sum + (base * parseFloat(li.gstPercentage || "0")) / 100;
    }, 0);

  const handleCreate = async () => {
    if (
      !customerName ||
      lineItems.some((li) => !li.itemId || !li.quantity || !li.unitPrice)
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill customer name and all line item fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        customerName,
        customerGSTIN: customerGSTIN || undefined,
        notes,
        paymentMode,
        items: lineItems.map((li) => ({
          itemId: li.itemId,
          quantity: Number(li.quantity),
          unitPrice: Number(li.unitPrice),
          gstPercentage: Number(li.gstPercentage),
        })),
      };
      const created = await createSalesInvoiceApi(payload);
      setInvoices((prev) => [created, ...prev]);
      setCreateOpen(false);
      resetCreateForm();
      toast({
        title: "Invoice Created",
        description: `${created.invoiceNumber} created as Draft.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create invoice.",
        variant: "destructive",
      });
    }
  };

  const resetCreateForm = () => {
    setCustomerName("");
    setCustomerGSTIN("");
    setNotes("");
    setLineItems([
      { itemId: "", quantity: "", unitPrice: "", gstPercentage: "18" },
    ]);
    setPaymentMode("CREDIT");
  };

  const handleStateTransition = async (
    invoiceId: string,
    newState: InvoiceState,
  ) => {
    try {
      let updated: SalesInvoice | undefined;
      if (newState === "APPROVED")
        updated = await approveSalesInvoiceApi(invoiceId);
      else if (newState === "POSTED")
        updated = await postSalesInvoiceApi(invoiceId);
      else if (newState === "CANCELLED")
        updated = await cancelSalesInvoiceApi(invoiceId);

      if (updated) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? updated! : inv)),
        );
      }
      toast({
        title: `Invoice ${newState}`,
        description: `Invoice successfully ${newState.toLowerCase()}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${newState.toLowerCase()} invoice.`,
        variant: "destructive",
      });
    }
    setConfirmAction(null);
  };

  const handleRecordPayment = async () => {
    if (!paymentInvoice || !paymentAmount || !paymentRef) {
      toast({
        title: "Validation Error",
        description: "Please fill all payment fields.",
        variant: "destructive",
      });
      return;
    }
    const amount = Number(paymentAmount);
    if (amount > paymentInvoice.outstandingAmount) {
      toast({
        title: "Validation Error",
        description: "Payment cannot exceed outstanding amount.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = { amount, method: paymentMethod, reference: paymentRef };
      const updatedInvoice = await recordSalesPaymentApi(
        paymentInvoice.id,
        payload,
      );
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === paymentInvoice.id ? updatedInvoice : inv,
        ),
      );
      setPaymentOpen(false);
      setPaymentAmount("");
      setPaymentRef("");
      setPaymentInvoice(null);
      toast({
        title: "Payment Recorded",
        description: "Payment successfully recorded.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to record payment.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = (invoice: SalesInvoice) => {
    setSelectedInvoice(invoice);
    setTimeout(() => window.print(), 300);
  };

  return (
    <>
      <div className="space-y-6 no-print">
       <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">
      Sales Invoices
    </h1>
    <p className="text-muted-foreground text-sm mt-1">
      DRAFT → APPROVED → POSTED lifecycle with Accounts Receivable tracking
    </p>
  </div>
  <Button
    className="gold-gradient text-accent-foreground font-medium"
    onClick={() => setCreateOpen(true)}
  >
    <Plus className="h-4 w-4 mr-2" />
    New Invoice
  </Button>
</div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                Loading sales invoices...
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                No sales invoices found. Create your first invoice.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Invoice #
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Customer
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">
                        State
                      </th>
                      <th className="text-right p-3 font-medium text-muted-foreground">
                        Grand Total
                      </th>
                      <th className="text-right p-3 font-medium text-muted-foreground">
                        Paid
                      </th>
                      <th className="text-right p-3 font-medium text-muted-foreground">
                        Outstanding
                      </th>
                      <th className="text-center p-3 font-medium text-muted-foreground">
                        Payment
                      </th>
                      <th className="text-center p-3 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-mono text-xs">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3">{inv.customerName}</td>
                        <td className="p-3">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {inv.invoiceState === "POSTED" && (
                              <Lock className="h-3 w-3" />
                            )}
                            <Badge
                              variant="outline"
                              className={stateStyles[inv.invoiceState]}
                            >
                              {inv.invoiceState}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          ₹{inv.grandTotal.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right">
                          ₹{inv.paidAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right">
                          {inv.outstandingAmount > 0
                            ? `₹${inv.outstandingAmount.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={statusStyles[inv.paymentStatus]}
                          >
                            {inv.paymentStatus}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedInvoice(inv)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {inv.invoiceState === "DRAFT" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setConfirmAction({
                                    invoiceId: inv.id,
                                    newState: "APPROVED",
                                    label: "Approve",
                                  })
                                }
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {inv.invoiceState === "APPROVED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setConfirmAction({
                                    invoiceId: inv.id,
                                    newState: "POSTED",
                                    label: "Post",
                                  })
                                }
                                title="Post"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {(inv.invoiceState === "DRAFT" ||
                              inv.invoiceState === "APPROVED") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setConfirmAction({
                                    invoiceId: inv.id,
                                    newState: "CANCELLED",
                                    label: "Cancel",
                                  })
                                }
                                title="Cancel"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            {inv.invoiceState === "POSTED" &&
                              inv.outstandingAmount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setPaymentInvoice(inv);
                                    setPaymentOpen(true);
                                  }}
                                  title="Record Payment"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                            {inv.invoiceState === "POSTED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePrint(inv)}
                                title="Print Invoice"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Print Area — hidden on screen, visible on print */}
      {selectedInvoice && (
        <PrintInvoice ref={printRef} invoice={selectedInvoice} />
      )}

      {/* Confirm State Transition */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.newState === "POSTED" && "Post Invoice?"}
              {confirmAction?.newState === "APPROVED" && "Approve Invoice?"}
              {confirmAction?.newState === "CANCELLED" && "Cancel Invoice?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.newState === "POSTED" &&
                "This will lock the invoice permanently. Stock levels will be deducted and journal entries (Accounts Receivable Dr, Revenue Cr, GST Cr, COGS entries) will be created automatically. This action cannot be undone."}
              {confirmAction?.newState === "APPROVED" &&
                "This will approve the invoice and allow it to be posted. Make sure all details are correct before approving."}
              {confirmAction?.newState === "CANCELLED" &&
                "This will cancel the invoice. No stock or ledger changes will occur. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmAction &&
                handleStateTransition(
                  confirmAction.invoiceId,
                  confirmAction.newState,
                )
              }
              className={
                confirmAction?.newState === "CANCELLED"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmAction?.newState === "POSTED" && (
                <>
                  <Lock className="h-4 w-4 mr-1" /> Post & Lock Invoice
                </>
              )}
              {confirmAction?.newState === "APPROVED" && (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve Invoice
                </>
              )}
              {confirmAction?.newState === "CANCELLED" && (
                <>
                  <Ban className="h-4 w-4 mr-1" /> Cancel Invoice
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Invoice Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedInvoice?.invoiceNumber}</span>
              {selectedInvoice && (
                <Badge
                  variant="outline"
                  className={stateStyles[selectedInvoice.invoiceState]}
                >
                  {selectedInvoice.invoiceState}
                </Badge>
              )}
              {selectedInvoice?.invoiceState === "POSTED" && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  {selectedInvoice.customerGSTIN && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedInvoice.customerGSTIN}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
                {selectedInvoice.approvedBy && (
                  <div>
                    <p className="text-muted-foreground">Approved By</p>
                    <p className="font-medium">
                      {/* {selectedInvoice.approvedBy} ·{" "} */}
                      {new Date(selectedInvoice.approvedAt!).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                )}
                {selectedInvoice.postedBy && (
                  <div>
                    <p className="text-muted-foreground">Posted By</p>
                    <p className="font-medium">
                      {/* {selectedInvoice.postedBy} ·{" "} */}
                      {new Date(selectedInvoice.postedAt!).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                )}
              </div>

              {selectedInvoice.invoiceState === "POSTED" && (
                <div className="flex items-center gap-2 text-xs p-3 rounded-md bg-muted text-muted-foreground border">
                  <Lock className="h-3.5 w-3.5" />
                  This invoice is locked (POSTED). Modifications require a
                  credit note or reversal entry to maintain audit integrity.
                </div>
              )}

              {/* Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium text-muted-foreground">
                        Item
                      </th>
                      <th className="text-right p-2 font-medium text-muted-foreground">
                        Qty
                      </th>
                      <th className="text-right p-2 font-medium text-muted-foreground">
                        Unit Price
                      </th>
                      <th className="text-right p-2 font-medium text-muted-foreground">
                        GST %
                      </th>
                      <th className="text-right p-2 font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((li) => (
                      <tr key={li.id} className="border-b">
                        <td className="p-2">{li.itemName}</td>
                        <td className="p-2 text-right">{li.quantity}</td>
                        <td className="p-2 text-right">
                          ₹{li.unitPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="p-2 text-right">{li.gstPercentage}%</td>
                        <td className="p-2 text-right font-medium">
                          ₹{li.totalAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      ₹{selectedInvoice.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST</span>
                    <span>
                      ₹
                      {selectedInvoice.taxBreakdown.cgst.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST</span>
                    <span>
                      ₹
                      {selectedInvoice.taxBreakdown.sgst.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  {selectedInvoice.taxBreakdown.igst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IGST</span>
                      <span>
                        ₹
                        {selectedInvoice.taxBreakdown.igst.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Grand Total</span>
                    <span>
                      ₹{selectedInvoice.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid</span>
                    <span>
                      ₹{selectedInvoice.paidAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Outstanding</span>
                    <span>
                      ₹
                      {selectedInvoice.outstandingAmount.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment history */}
              {selectedInvoice.payments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Payment History (Cash/Bank Dr → Accounts Receivable Cr)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="text-left p-2 font-medium text-muted-foreground">
                            Method
                          </th>
                          <th className="text-left p-2 font-medium text-muted-foreground">
                            Reference
                          </th>
                          <th className="text-right p-2 font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-left p-2 font-medium text-muted-foreground">
                            Journal Ref
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.payments.map((p) => (
                          <tr key={p.id} className="border-b">
                            <td className="p-2">
                              {new Date(p.paidAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-[10px]">
                                {p.method.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="p-2 font-mono">{p.reference}</td>
                            <td className="p-2 text-right font-medium">
                              ₹{p.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2 font-mono text-muted-foreground">
                              {p.journalEntryId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Print button in dialog for POSTED invoices */}
              {selectedInvoice.invoiceState === "POSTED" && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePrint(selectedInvoice)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Sales Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label>Customer GSTIN</Label>
                <Input
                  value={customerGSTIN}
                  onChange={(e) => setCustomerGSTIN(e.target.value)}
                  placeholder="Optional GSTIN"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <Select
                value={paymentMode}
                onValueChange={(v) => setPaymentMode(v as "CASH" | "CREDIT")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT">Credit Sale</SelectItem>
                  <SelectItem value="CASH">Cash Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {lineItems.map((li, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_80px_100px_80px_40px] gap-2 items-end"
                  >
                    <div>
                      {idx === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          Item
                        </Label>
                      )}
                      <Select
                        value={li.itemId}
                        onValueChange={(v) => {
                          const item = inventoryItems.find((i) => i.id === v);
                          updateLineItem(idx, "itemId", v);
                          if (item)
                            updateLineItem(
                              idx,
                              "unitPrice",
                              item.sellingPrice.toString(),
                            );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems
                            .filter((i) => i.isActive)
                            .map((i) => (
                              <SelectItem key={i.id} value={i.id}>
                                {i.name} ({i.sku})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      {idx === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          Qty
                        </Label>
                      )}
                      <Input
                        type="number"
                        value={li.quantity}
                        onChange={(e) =>
                          updateLineItem(idx, "quantity", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      {idx === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          Unit Price
                        </Label>
                      )}
                      <Input
                        type="number"
                        value={li.unitPrice}
                        onChange={(e) =>
                          updateLineItem(idx, "unitPrice", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      {idx === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          GST %
                        </Label>
                      )}
                      <Input
                        type="number"
                        value={li.gstPercentage}
                        onChange={(e) =>
                          updateLineItem(idx, "gstPercentage", e.target.value)
                        }
                        placeholder="18"
                      />
                    </div>
                    <div>
                      {lineItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(idx)}
                          className="h-9 w-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{calcSubtotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>₹{calcGst().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Grand Total</span>
                  <span>
                    ₹{(calcSubtotal() + calcGst()).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Invoice (Draft)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {paymentInvoice && (
            <div className="space-y-4">
              <div className="text-sm space-y-1 p-3 border rounded-lg bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono">
                    {paymentInvoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grand Total</span>
                  <span>
                    ₹{paymentInvoice.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span>
                    ₹{paymentInvoice.paidAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Outstanding</span>
                  <span className="text-destructive">
                    ₹{paymentInvoice.outstandingAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Journal: Cash/Bank (Dr) → Accounts Receivable (Cr)
              </p>
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Max ₹${paymentInvoice.outstandingAmount.toLocaleString("en-IN")}`}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">
                      Bank Transfer (NEFT/RTGS)
                    </SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference # *</Label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="NEFT/UTR/Cheque/UPI reference"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={
                !paymentInvoice || paymentInvoice.outstandingAmount === 0
              }
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesInvoices;
