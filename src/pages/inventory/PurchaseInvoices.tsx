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
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Send,
  Ban,
  CreditCard,
  Lock,
  Leaf,
  Printer,
  Loader2,
} from "lucide-react";
import {
  printDocument,
  generatePurchaseInvoiceReceipt,
} from "@/utils/printUtils";
import { useState, useEffect } from "react";
import {
  getInvoicesApi,
  createInvoiceApi,
  approveInvoiceApi,
  postInvoiceApi,
  cancelInvoiceApi,
  recordPaymentApi,
  getVendorsApi,
  getPaginatedItemsApi,
  getUnitsApi,
} from "@/api/inventoryApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  PurchaseInvoice,
  PurchaseInvoiceItem,
  InvoiceState,
} from "@/pages/inventory/types/inventory";

// Add interface for Item
interface InventoryItem {
  id: string;
  _id?: string;
  name: string;
  sku: string;
  description?: string;
  unit: string;
  currentStock: number;
  sellingPrice?: number;
  costPrice: number;
  purchaseUnitId?: string;
  isPerishable?: boolean;
  isActive: boolean;
}

interface Unit {
  id: string;
  _id?: string;
  name: string;
  shortCode: string;
  conversionFactor: number;
  decimalPrecision: number;
  isActive: boolean;
  baseUnitId?: string | null;
  baseUnit_id?: {
    id: string;
    shortCode: string;
  };
}

const statusStyles: Record<string, string> = {
  PAID: "bg-success/10 text-success border-success/20",
  UNPAID: "bg-destructive/10 text-destructive border-destructive/20",
  PARTIAL: "bg-warning/10 text-warning border-warning/20",
};

const stateStyles: Record<InvoiceState, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  APPROVED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  POSTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchResults, setSearchResults] = useState<Record<string, InventoryItem[]>>({});
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    invoiceId: string;
    newState: InvoiceState;
    label: string;
  } | null>(null);
  const { toast } = useToast();

  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [paymentInvoice, setPaymentInvoice] = useState<PurchaseInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CHEQUE" | "UPI">("BANK_TRANSFER");
  const [paymentRef, setPaymentRef] = useState("");

  // Item search state
  const [itemSearch, setItemSearch] = useState<Record<string, string>>({});
  const [activeSearch, setActiveSearch] = useState("");
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({});
  const debouncedSearch = useDebounce(activeSearch, 500);

  const [lineItems, setLineItems] = useState<
    Array<{
      itemId: string;
      quantity: string;
      unitPrice: string;
      gstPercentage: string;
      batchNumber: string;
      expiryDate: string;
      purchaseUnitId: string;
    }>
  >([
    {
      itemId: "",
      quantity: "",
      unitPrice: "",
      gstPercentage: "18",
      batchNumber: "",
      expiryDate: "",
      purchaseUnitId: "",
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoiceRes, vendorRes, unitRes] = await Promise.all([
        getInvoicesApi(),
        getVendorsApi(),
        getUnitsApi(),
      ]);

      setInvoices(invoiceRes);
      setVendors(vendorRes);
      setUnits(
        unitRes.map((u: any) => ({
          ...u,
          id: u._id || u.id,
        })),
      );
    } catch (err) {
      toast({
        title: "Failed to load purchase invoices",
        variant: "destructive",
      });
    }
  };

  // Search items when typing in the create dialog
  useEffect(() => {
    if (!createOpen || !debouncedSearch || debouncedSearch.length < 2) return;

    const fetchItems = async () => {
      const activeLineId = Object.keys(itemSearch).find(
        (key) => itemSearch[key],
      );

      if (!activeLineId) return;

      setIsSearching((prev) => ({ ...prev, [activeLineId]: true }));

      try {
        const response = await getPaginatedItemsApi({
          search: debouncedSearch,
          page: 1,
          limit: 10,
          active: true,
        });

        setSearchResults((prev) => ({
          ...prev,
          [activeLineId]: response.data,
        }));

        // Also update inventory items with search results
        setInventoryItems((prev) => {
          const newItems = [...prev];
          response.data.forEach((item: InventoryItem) => {
            if (!newItems.find((i) => i.id === item.id)) {
              newItems.push(item);
            }
          });
          return newItems;
        });
      } catch (err) {
        toast({
          title: "Failed to search items",
          variant: "destructive",
        });
      } finally {
        setIsSearching((prev) => ({ ...prev, [activeLineId]: false }));
      }
    };

    fetchItems();
  }, [debouncedSearch, createOpen, itemSearch, toast]);

  const addLineItem = () =>
    setLineItems((prev) => [
      ...prev,
      {
        itemId: "",
        quantity: "",
        unitPrice: "",
        gstPercentage: "18",
        batchNumber: "",
        expiryDate: "",
        purchaseUnitId: "",
      },
    ]);

  const removeLineItem = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateLineItem = (idx: number, field: string, value: string) =>
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );

  const handleSelectItem = (idx: number, itemId: string) => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) return;

    updateLineItem(idx, "itemId", itemId);
    updateLineItem(idx, "unitPrice", item.costPrice.toString());
    updateLineItem(idx, "purchaseUnitId", item.purchaseUnitId || "");

    // Clear search for this line
    const lineId = `line-${idx}`;
    setItemSearch((prev) => ({ ...prev, [lineId]: "" }));
  };

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
      !vendorId ||
      lineItems.some((li) => !li.itemId || !li.quantity || !li.unitPrice)
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill vendor and all line item fields.",
        variant: "destructive",
      });
      return;
    }
    const vendor = vendors.find((v) => v.id === vendorId);
    const year = new Date().getFullYear();
    const nextNum = (invoices.length + 1).toString().padStart(4, "0");
    const invoiceNumber = `INV-PUR-${year}-${nextNum}`;

    const items: PurchaseInvoiceItem[] = lineItems.map((li, idx) => {
      const item = inventoryItems.find((i) => i.id === li.itemId);
      const qty = parseFloat(li.quantity);
      const price = parseFloat(li.unitPrice);
      const gstPct = parseFloat(li.gstPercentage);
      const base = qty * price;
      const gst = (base * gstPct) / 100;
      return {
        id: `ii-${Date.now()}-${idx}`,
        itemId: li.itemId,
        itemName: item?.name || "",
        quantity: qty,
        unitPrice: price,
        gstPercentage: gstPct,
        gstAmount: gst,
        totalAmount: base + gst,
        isPerishable: item?.isPerishable,
        batchNumber: item?.isPerishable ? li.batchNumber : undefined,
        expiryDate: item?.isPerishable ? li.expiryDate : undefined,
      };
    });

    const subtotal = calcSubtotal();
    const gstAmount = calcGst();
    const grand = subtotal + gstAmount;
    const newInvoice: PurchaseInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      vendorId,
      vendorName: vendor?.name || "",
      items,
      subtotal,
      gstAmount,
      taxBreakdown: {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: 0,
        totalTax: gstAmount,
      },
      grandTotal: grand,
      paymentStatus: "UNPAID",
      invoiceState: "DRAFT",
      paidAmount: 0,
      outstandingAmount: grand,
      payments: [],
      notes,
      createdBy: "Admin",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    const created = await createInvoiceApi(newInvoice);

    setInvoices((prev) => [created, ...prev]);
    setVendorId("");
    setNotes("");
    setLineItems([
      {
        itemId: "",
        quantity: "",
        unitPrice: "",
        gstPercentage: "18",
        batchNumber: "",
        expiryDate: "",
        purchaseUnitId: "",
      },
    ]);
    setCreateOpen(false);
    toast({
      title: "Invoice Created",
      description: `${invoiceNumber} created as Draft.`,
    });
  };

  const handleStateTransition = async (
    invoiceId: string,
    newState: InvoiceState,
  ) => {
    try {
      let updated: PurchaseInvoice | undefined;

      if (newState === "APPROVED") {
        updated = await approveInvoiceApi(invoiceId);
      }

      if (newState === "POSTED") {
        updated = await postInvoiceApi(invoiceId);
      }

      if (newState === "CANCELLED") {
        updated = await cancelInvoiceApi(invoiceId);
      }

      if (!updated) return;

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? updated : inv)),
      );

      toast({
        title: `Invoice ${newState}`,
      });
    } catch (err) {
      toast({
        title: "Operation failed",
        variant: "destructive",
      });
    }

    setConfirmAction(null);
  };

  const handleRecordPayment = async () => {
    if (!paymentInvoice || !paymentAmount || !paymentRef) {
      toast({
        title: "Validation Error",
        description: "Fill all payment fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(paymentAmount);

      const updated = await recordPaymentApi(paymentInvoice.id, {
        amount,
        method: paymentMethod,
        reference: paymentRef,
      });

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updated.id ? updated : inv)),
      );

      toast({
        title: "Payment Recorded",
        description: `₹${amount.toLocaleString("en-IN")} recorded.`,
      });
    } catch (err) {
      toast({
        title: "Payment failed",
        variant: "destructive",
      });
    }

    setPaymentOpen(false);
    setPaymentAmount("");
    setPaymentRef("");
    setPaymentInvoice(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase Invoices</h1>
            <p className="text-muted-foreground text-sm mt-1">
              DRAFT → APPROVED → POSTED lifecycle with double-entry accounting
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      State
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Grand Total
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {inv.vendorName}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {inv.invoiceState === "POSTED" && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          <Badge
                            variant="outline"
                            className={stateStyles[inv.invoiceState]}
                          >
                            {inv.invoiceState}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        ₹{inv.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-right text-success">
                        ₹{inv.paidAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-right text-destructive font-medium">
                        {inv.outstandingAmount > 0
                          ? `₹${inv.outstandingAmount.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={statusStyles[inv.paymentStatus]}
                        >
                          {inv.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(inv)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Print"
                            onClick={() =>
                              printDocument({
                                title: `Purchase Invoice - ${inv.invoiceNumber}`,
                                content: generatePurchaseInvoiceReceipt({
                                  ...inv,
                                  vendorGSTIN: vendors.find(
                                    (v) => v.id === inv.vendorId,
                                  )?.gstin,
                                }),
                              })
                            }
                          >
                            <Printer className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {inv.invoiceState === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmAction({
                                  invoiceId: inv.id,
                                  newState: "APPROVED",
                                  label: "Approve",
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4 text-blue-400" />
                            </Button>
                          )}
                          {inv.invoiceState === "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmAction({
                                  invoiceId: inv.id,
                                  newState: "POSTED",
                                  label: "Post",
                                })
                              }
                            >
                              <Send className="h-4 w-4 text-emerald-400" />
                            </Button>
                          )}
                          {(inv.invoiceState === "DRAFT" ||
                            inv.invoiceState === "APPROVED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmAction({
                                  invoiceId: inv.id,
                                  newState: "CANCELLED",
                                  label: "Cancel",
                                })
                              }
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          {inv.invoiceState === "POSTED" &&
                            inv.outstandingAmount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPaymentInvoice(inv);
                                  setPaymentOpen(true);
                                }}
                              >
                                <CreditCard className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm State Transition */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label} Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.newState === "POSTED" &&
                "This will lock the invoice. Stock and journal entries (Inventory Dr, Input GST Dr, AP Cr) will be created."}
              {confirmAction?.newState === "APPROVED" && "Approve for posting."}
              {confirmAction?.newState === "CANCELLED" &&
                "Cancel this invoice permanently."}
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
                  ? "bg-destructive text-destructive-foreground"
                  : "gold-gradient text-accent-foreground"
              }
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Invoice */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="font-mono">
                {selectedInvoice?.invoiceNumber}
              </DialogTitle>
              {selectedInvoice && (
                <Badge
                  variant="outline"
                  className={stateStyles[selectedInvoice.invoiceState]}
                >
                  {selectedInvoice.invoiceState}
                </Badge>
              )}
            </div>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vendor</p>
                  <p className="font-medium">{selectedInvoice.vendorName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>
              {selectedInvoice.invoiceState === "POSTED" && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Locked (POSTED). Use credit note for corrections.
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Item
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        Qty
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        GST %
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedInvoice.items.map((li) => (
                      <tr key={li.id}>
                        <td className="px-4 py-2">
                          {li.itemName}
                          {li.isPerishable && (
                            <Leaf className="inline ml-1 h-3 w-3 text-success" />
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">{li.quantity}</td>
                        <td className="px-4 py-2 text-right">
                          ₹{li.unitPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {li.gstPercentage}%
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          ₹{li.totalAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <div className="w-72 space-y-1 text-sm border rounded-lg p-3 bg-muted/30">
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
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Grand Total</span>
                    <span>
                      ₹{selectedInvoice.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="text-success">
                      ₹{selectedInvoice.paidAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Outstanding</span>
                    <span className="text-destructive">
                      ₹
                      {selectedInvoice.outstandingAmount.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {selectedInvoice.payments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Payment History</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                            Method
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                            Reference
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedInvoice.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-2 text-xs">
                              {new Date(p.paidAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-2">
                              <Badge variant="outline" className="text-[10px]">
                                {p.method.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 font-mono text-xs">
                              {p.reference}
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              ₹{p.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    printDocument({
                      title: `Purchase Invoice - ${selectedInvoice.invoiceNumber}`,
                      content: generatePurchaseInvoiceReceipt({
                        ...selectedInvoice,
                        vendorGSTIN: vendors.find(
                          (v) => v.id === selectedInvoice.vendorId,
                        )?.gstin,
                      }),
                    });
                  }}
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors
                      .filter((v) => v.isActive)
                      .map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice # (Auto)</Label>
                <Input
                  value={`INV-PUR-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(4, "0")}`}
                  disabled
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items</Label>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {lineItems.map((li, idx) => {
                  const selectedItem = inventoryItems.find(
                    (i) => i.id === li.itemId,
                  );
                  const pu = units.find(
                    (u) => u.id === selectedItem?.purchaseUnitId,
                  );
                  const lineId = `line-${idx}`;

                  return (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-[1fr_60px_80px_100px_80px_32px] gap-2 items-end">
                        <div className="relative">
                          {idx === 0 && (
                            <Label className="text-xs text-muted-foreground">
                              Item
                            </Label>
                          )}
                          <div className="relative">
                            <Input
                              placeholder="Search item (min 2 chars)..."
                              value={
                                li.itemId
                                  ? selectedItem?.name || ""
                                  : itemSearch[lineId] || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setItemSearch((prev) => ({
                                  ...prev,
                                  [lineId]: value,
                                }));
                                setActiveSearch(value);
                                
                                // Clear item if searching
                                if (li.itemId) {
                                  updateLineItem(idx, "itemId", "");
                                  updateLineItem(idx, "purchaseUnitId", "");
                                }
                              }}
                              className={li.itemId ? "bg-muted" : ""}
                              disabled={!!li.itemId}
                            />
                            {itemSearch[lineId] && itemSearch[lineId].length >= 2 && (
                              <div className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
                                {isSearching[lineId] ? (
                                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                    Searching...
                                  </div>
                                ) : searchResults[lineId] && searchResults[lineId].length > 0 ? (
                                  searchResults[lineId].map((item) => (
                                    <div
                                      key={item.id}
                                      className="px-3 py-2 cursor-pointer text-sm hover:bg-muted"
                                      onClick={() => handleSelectItem(idx, item.id)}
                                    >
                                      {item.name} ({item.sku}) — ₹{item.costPrice}
                                      {item.isPerishable && " 🌿"}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    No items found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          {idx === 0 && (
                            <Label className="text-xs text-muted-foreground">
                              Unit
                            </Label>
                          )}
                          <Input
                            value={pu?.shortCode || selectedItem?.unit || "—"}
                            disabled
                            className="bg-muted text-xs"
                          />
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
                              updateLineItem(
                                idx,
                                "gstPercentage",
                                e.target.value,
                              )
                            }
                            placeholder="18"
                          />
                        </div>
                        <div>
                          {lineItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(idx)}
                              className="h-9 w-9 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {selectedItem?.isPerishable && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed">
                          <div className="space-y-1">
                            <Label className="text-xs text-success flex items-center gap-1">
                              <Leaf className="h-3 w-3" />
                              Batch #
                            </Label>
                            <Input
                              value={li.batchNumber}
                              onChange={(e) =>
                                updateLineItem(
                                  idx,
                                  "batchNumber",
                                  e.target.value,
                                )
                              }
                              placeholder="BR-2025-003"
                              className="font-mono h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-success flex items-center gap-1">
                              <Leaf className="h-3 w-3" />
                              Expiry
                            </Label>
                            <Input
                              type="date"
                              value={li.expiryDate}
                              onChange={(e) =>
                                updateLineItem(
                                  idx,
                                  "expiryDate",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-sm border rounded-lg p-3 bg-muted/30">
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
            <Button
              onClick={handleCreate}
              className="gold-gradient text-accent-foreground"
            >
              Create Invoice (Draft)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment */}
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
                  <span className="text-muted-foreground">Paid</span>
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
                Journal: AP (Dr) → Cash/Bank (Cr)
              </p>
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Method *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as typeof paymentMethod)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
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
                  placeholder="NEFT/UTR/Cheque ref"
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
              className="gold-gradient text-accent-foreground"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PurchaseInvoices;