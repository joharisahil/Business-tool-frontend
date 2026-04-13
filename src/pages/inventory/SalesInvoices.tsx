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
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  getSalesInvoicesApi,
  createSalesInvoiceApi,
  createCustomerApi,
  approveSalesInvoiceApi,
  postSalesInvoiceApi,
  cancelSalesInvoiceApi,
  recordSalesPaymentApi,
  getCustomersApi,
  getItemsApi,
  getUnitsApi,
} from "@/api/inventoryApi";

import { useEffect, useRef } from "react";
import {
  FilePlus,
  Search,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Send,
  Ban,
  CreditCard,
  Lock,
  ArrowRightLeft,
  ScanBarcode,
  MessageCircle,
  Printer,
} from "lucide-react";
import { printDocument, generateSalesInvoiceReceipt } from "@/utils/printUtils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type {
  SalesInvoice,
  SalesInvoiceItem,
  InvoiceState,
  SalesCategory,
} from "@/pages/inventory/types/inventory";
import { useDebounce } from "@/hooks/useDebounce";

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
  saleUnits?: string[];
}

interface Unit {
  id: string;
  _id?: string;
  name: string;
  shortCode: string;
  conversionFactor: number;
  decimalPrecision: number;
  baseUnit_id?: {
    id: string;
    shortCode: string;
  };
}

interface Customer {
  id: string;
  _id?: string;
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  isActive: boolean;
}

const stateStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  APPROVED: "bg-info/10 text-info border-info/20",
  POSTED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const paymentStyles: Record<string, string> = {
  UNPAID: "bg-destructive/10 text-destructive border-destructive/20",
  PARTIAL: "bg-warning/10 text-warning border-warning/20",
  PAID: "bg-success/10 text-success border-success/20",
  ADVANCE: "bg-accent/10 text-accent-foreground border-accent/20",
};

interface LineItemForm {
  id: string;
  itemId: string;
  description: string;
  category: SalesCategory;
  quantity: string;
  unitPrice: string;
  discount: string;
  gstPercentage: string;
  saleUnitId: string;
  deductStock: boolean;
}

const emptyLine = (): LineItemForm => ({
  id: crypto.randomUUID(),
  itemId: "",
  description: "",
  category: "GOODS",
  quantity: "",
  unitPrice: "",
  discount: "0",
  gstPercentage: "18",
  saleUnitId: "",
  deductStock: false,
});

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchResults, setSearchResults] = useState<
    Record<string, InventoryItem[]>
  >({});
  const [units, setUnits] = useState<Unit[]>([]);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<{
    invoiceId: string;
    newState: InvoiceState;
    label: string;
  } | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  const { toast } = useToast();

  const [itemSearch, setItemSearch] = useState<Record<string, string>>({});
  const [activeSearch, setActiveSearch] = useState("");

  // Customer search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<
    Customer[]
  >([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Create form state
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("IMMEDIATE");
  const [lineItems, setLineItems] = useState<LineItemForm[]>([emptyLine()]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
const [newCustomerPhone, setNewCustomerPhone] = useState("");
const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Debounced search for customers
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

const dropdownRef = useRef<HTMLDivElement | null>(null);
  // Customer search effect
  useEffect(() => {
    if (!createOpen || debouncedCustomerSearch.length < 2) {
      setCustomerSearchResults([]);
      return;
    }

    const searchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const results = await getCustomersApi({
          search: debouncedCustomerSearch,
          page: 1,
          limit: 10,
          isActive: true,
        });
        setCustomerSearchResults(results.data);
      } catch (error) {
        console.error("Failed to search customers:", error);
        toast({
          title: "Search Failed",
          description: "Could not load customers",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    searchCustomers();
  }, [debouncedCustomerSearch, createOpen, toast]);

  // Click outside handler for customer dropdown
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowCustomerDropdown(false);
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);
  const addLineItem = () => {
    setLineItems((prev) => [...prev, emptyLine()]);
  };

  const removeLineItem = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateLine = (idx: number, field: string, value: any) =>
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );

  useEffect(() => {
    loadData();
  }, [page, limit, stateFilter]);

  const debouncedSearch = useDebounce(activeSearch, 400);

  const loadData = async () => {
    try {
      const [invoicesRes, unitsRes] = await Promise.all([
        getSalesInvoicesApi({
          page,
          limit,
          state: stateFilter === "ALL" ? undefined : stateFilter,
        }),

        getUnitsApi(),
      ]);

      setInvoices(
        
        invoicesRes.data.map((inv: any) => ({
          
          ...inv,
          id: inv._id || inv.id,
    //        customerPhone: inv.customer_id?.phone,
    // customerName: inv.customer_id?.name || inv.customerName,
        })),
      );

      setTotalPages(invoicesRes.pages);
      setTotalItems(invoicesRes.total);

      setUnits(
        unitsRes.map((u: any) => ({
          ...u,
          id: u._id,
        })),
      );
    } catch (err) {
      toast({
        title: "Failed to load data",
        variant: "destructive",
      });
    }
  };
  // Helper function to generate WhatsApp message for invoice
  const generateWhatsAppMessage = (invoice: SalesInvoice): string => {
    const date = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Format currency
    const formatCurrency = (amount: number) =>
      `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Create items list
    const itemsList = invoice.items
      .map(
        (item) =>
          `• ${item.description || item.itemName || "Item"} - ${item.quantity} ${item.saleUnitCode || "PCS"} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.totalAmount)}`,
      )
      .join("\n");
      console.log(invoice);
    const message =
      `*SALES INVOICE*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Invoice #: ${invoice.invoiceNumber}\n` +
      `Date: ${date}\n` +
      `Customer: ${invoice.customerName}\n` +
      `${invoice.customerGSTIN ? `GSTIN: ${invoice.customerGSTIN}\n` : ""}` +
      `Payment Terms: ${invoice.paymentTerms || "IMMEDIATE"}\n\n` +
      `*ITEMS:*\n` +
      `${itemsList}\n\n` +
      `*SUMMARY:*\n` +
      `Subtotal: ${formatCurrency(invoice.subtotal)}\n` +
      `${invoice.totalDiscount > 0 ? `Discount: -${formatCurrency(invoice.totalDiscount)}\n` : ""}` +
      `CGST: ${formatCurrency(invoice.taxBreakdown.cgst)}\n` +
      `SGST: ${formatCurrency(invoice.taxBreakdown.sgst)}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `*GRAND TOTAL: ${formatCurrency(invoice.grandTotal)}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Payment Status: ${invoice.paymentStatus}\n` +
      `Paid: ${formatCurrency(invoice.paidAmount)}\n` +
      `Outstanding: ${formatCurrency(invoice.outstandingAmount)}\n\n` +
      `Thank you for your business!`;

    return encodeURIComponent(message);
  };

  // Function to open WhatsApp
  const openWhatsApp = (invoice: SalesInvoice) => {
    // Find customer phone number
    const customer = customers.find((c) => c.id === invoice.customerId);
    const phoneNumber = customer?.phone || invoice.customerPhone;
    console.log(invoice.customerPhone);

    if (!phoneNumber) {
      toast({
        title: "Phone number not found",
        description: "This customer doesn't have a phone number on record",
        variant: "destructive",
      });
      return;
    }

    // Remove any non-digit characters from phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Generate message
    const message = generateWhatsAppMessage(invoice);

    // Open WhatsApp (works for both web and mobile)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };
  // Search items when typing in the create dialog
  useEffect(() => {
    if (!createOpen || !debouncedSearch || debouncedSearch.length < 2) return;

    const fetchItems = async () => {
      try {
        const items = await getItemsApi({
          search: debouncedSearch,
          page: 1,
          limit: 10,
        });

        const activeLineId = Object.keys(itemSearch).find(
          (key) => itemSearch[key],
        );

        if (!activeLineId) return;

        const mappedItems = items.map((i: any) => ({
          ...i,
          id: i._id || i.id,
          saleUnits: i.saleUnits?.map((id: any) => id.toString()) || [],
        }));

        setSearchResults((prev) => ({
          ...prev,
          [activeLineId]: mappedItems,
        }));

        setInventoryItems((prev) => {
          const newItems = [...prev];
          mappedItems.forEach((item: InventoryItem) => {
            if (!newItems.find((i) => i.id === item.id)) {
              newItems.push(item);
            }
          });
          return newItems;
        });
      } catch {
        toast({
          title: "Failed to load items",
          variant: "destructive",
        });
      }
    };

    fetchItems();
  }, [debouncedSearch, createOpen, itemSearch, toast]);

  // Barcode/SKU scan handler
  const handleBarcodeScan = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const loadItemsForScan = async () => {
      try {
        if (inventoryItems.length === 0) {
          const items = await getItemsApi({});
          setInventoryItems(
            items.map((i: any) => ({
              ...i,
              id: i._id || i.id,
              saleUnits: i.saleUnits?.map((id: any) => id.toString()) || [],
            })),
          );
          return items.map((i: any) => ({
            ...i,
            id: i._id || i.id,
            saleUnits: i.saleUnits?.map((id: any) => id.toString()) || [],
          }));
        }
        return inventoryItems;
      } catch (err) {
        toast({
          title: "Failed to load items for scan",
          variant: "destructive",
        });
        return [];
      }
    };

    if (inventoryItems.length === 0) {
      loadItemsForScan().then((items) => {
        const item = items.find(
          (i: InventoryItem) =>
            i.sku.toUpperCase() === trimmed ||
            i.name.toUpperCase().includes(trimmed),
        );
        processScannedItem(item, trimmed);
      });
    } else {
      const item = inventoryItems.find(
        (i) =>
          i.sku.toUpperCase() === trimmed ||
          i.name.toUpperCase().includes(trimmed),
      );
      processScannedItem(item, trimmed);
    }
  };

  const processScannedItem = (
    item: InventoryItem | undefined,
    scannedCode: string,
  ) => {
    if (!item) {
      toast({
        title: "Item not found",
        description: `No item matches "${scannedCode}"`,
        variant: "destructive",
      });
      setBarcodeInput("");
      return;
    }

    const existingIdx = lineItems.findIndex((li) => li.itemId === item.id);

    if (existingIdx >= 0) {
      const currentQty = parseFloat(lineItems[existingIdx].quantity || "0");
      updateLine(existingIdx, "quantity", String(currentQty + 1));

      toast({
        title: `+1 ${item.name}`,
        description: `Qty → ${currentQty + 1}`,
      });
    } else {
      const saleUnits = getSaleUnitsForItem(item.id);
      const defaultUnit = saleUnits.length > 0 ? saleUnits[0].id : "";

      const newLine: LineItemForm = {
        id: crypto.randomUUID(),
        itemId: item.id,
        description: item.name,
        category: "GOODS",
        quantity: "1",
        unitPrice: (item.sellingPrice || item.costPrice).toString(),
        discount: "0",
        gstPercentage: "18",
        saleUnitId: defaultUnit,
        deductStock: true,
      };

      setLineItems((prev) => {
        const emptyIdx = prev.findIndex((li) => !li.itemId && !li.description);

        if (emptyIdx >= 0) {
          return prev.map((li, i) =>
            i === emptyIdx ? { ...li, ...newLine, id: li.id } : li,
          );
        }

        return [...prev, newLine];
      });

      toast({
        title: "Item added",
        description: `${item.name} (${item.sku})`,
      });
    }
    setBarcodeInput("");
  };

  const getSaleUnitsForItem = (itemId: string): Unit[] => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) return [];

    if (!item.saleUnits || item.saleUnits.length === 0) {
      const baseUnit = units.find(
        (u) => u.shortCode?.toUpperCase() === item.unit?.toUpperCase(),
      );
      return baseUnit ? [baseUnit] : [];
    }

    const saleUnitIds = item.saleUnits.map((id: any) => id.toString());
    return units.filter((u) => saleUnitIds.includes(u.id?.toString()));
  };

  const getSaleUnits = (_idx: number, itemId: string): Unit[] => {
    return getSaleUnitsForItem(itemId);
  };

  const getBaseQty = (qty: number, saleUnitId: string): number => {
    const unit = units.find((u) => u.id === saleUnitId);
    if (!unit) return qty;
    return qty * unit.conversionFactor;
  };

  const calcLineTotals = (li: LineItemForm) => {
    const qty = parseFloat(li.quantity || "0");
    const price = parseFloat(li.unitPrice || "0");
    const discount = parseFloat(li.discount || "0");
    const gstPct = parseFloat(li.gstPercentage || "0");

    const baseQty = li.saleUnitId ? getBaseQty(qty, li.saleUnitId) : qty;

    const taxable = baseQty * price - discount;
    const gst = (taxable * gstPct) / 100;

    return {
      taxable: Math.max(0, taxable),
      gst,
      total: Math.max(0, taxable + gst),
    };
  };

  const calcTotals = () => {
    let subtotal = 0,
      totalDiscount = 0,
      totalTax = 0;

    lineItems.forEach((li) => {
      const qty = parseFloat(li.quantity || "0");
      const price = parseFloat(li.unitPrice || "0");
      const discount = parseFloat(li.discount || "0");
      const gstPct = parseFloat(li.gstPercentage || "0");

      const baseQty = li.saleUnitId ? getBaseQty(qty, li.saleUnitId) : qty;

      const taxable = baseQty * price - discount;

      subtotal += baseQty * price;
      totalDiscount += discount;
      totalTax += (taxable * gstPct) / 100;
    });

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal: Number((subtotal - totalDiscount + totalTax).toFixed(2)),
    };
  };

  const handleSelectItem = (idx: number, itemId: string) => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (!item) {
      const loadItem = async () => {
        try {
          const items = await getItemsApi({ search: itemId });
          const foundItem = items.find(
            (i: any) => i.id === itemId || i._id === itemId,
          );
          if (foundItem) {
            const mappedItem: InventoryItem = {
              ...foundItem,
              id: foundItem._id || foundItem.id,
              saleUnits:
                foundItem.saleUnits?.map((id: any) => id.toString()) || [],
            };
            setInventoryItems((prev) => [...prev, mappedItem]);
            selectItem(idx, mappedItem);
          }
        } catch (err) {
          toast({
            title: "Failed to load item",
            variant: "destructive",
          });
        }
      };
      loadItem();
      return;
    }

    selectItem(idx, item);
  };

  const selectItem = (idx: number, item: InventoryItem) => {
    const saleUnits = getSaleUnits(idx, item.id);
    const defaultUnit = saleUnits.length > 0 ? saleUnits[0].id : "";

    updateLine(idx, "itemId", item.id);
    updateLine(idx, "description", item.name);
    updateLine(
      idx,
      "unitPrice",
      item.sellingPrice?.toString() || item.costPrice.toString(),
    );
    updateLine(idx, "saleUnitId", defaultUnit);
    updateLine(idx, "deductStock", true);

    const lineId = lineItems[idx].id;
    setItemSearch((prev) => ({
      ...prev,
      [lineId]: "",
    }));
  };

  const handleCreate = async () => {
    if (
      !customerId ||
      lineItems.some((li) => !li.description || !li.quantity || !li.unitPrice)
    ) {
      toast({
        title: "Validation Error",
        description: "Fill customer and all line item fields.",
        variant: "destructive",
      });
      return;
    }

    const year = new Date().getFullYear();
    const nextNum = (invoices.length + 1).toString().padStart(4, "0");
    const invoiceNumber = `INV-SAL-${year}-${nextNum}`;
    const totals = calcTotals();

    const items: SalesInvoiceItem[] = lineItems.map((li) => {
      const { taxable, gst, total } = calcLineTotals(li);

      const taxableAmount = Number(taxable.toFixed(2));
      const gstAmount = Number(gst.toFixed(2));
      const totalAmount = Number(total.toFixed(2));

      const halfGst = Number((gstAmount / 2).toFixed(2));

      const unit = units.find((u) => u.id === li.saleUnitId);
      const qty = parseFloat(li.quantity);

      return {
        id: crypto.randomUUID(),
        description: li.description || "Item",
        category: li.category || "GOODS",
        quantity: qty,
        unitPrice: parseFloat(li.unitPrice),
        discount: parseFloat(li.discount || "0"),
        taxableAmount: taxableAmount,
        gstPercentage: parseFloat(li.gstPercentage),
        cgstAmount: halfGst,
        sgstAmount: halfGst,
        igstAmount: 0,
        totalAmount: totalAmount,
        itemId: li.itemId || undefined,
        deductStock: li.deductStock,
        saleUnitId: li.saleUnitId || undefined,
        saleUnitCode: unit?.shortCode,
        baseQty: li.saleUnitId ? getBaseQty(qty, li.saleUnitId) : undefined,
      };
    });

    const customer = customerSearchResults.find((c) => c.id === customerId);
    const newInvoice = {
      customer_id: customerId,
      customerName: customer?.name || "",
      invoiceNumber,
      items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      grandTotal: totals.grandTotal,
      paymentTerms,
      notes,
    };

try {
  await createSalesInvoiceApi(newInvoice);

  await loadData(); // ✅ ONLY THIS

  toast({
    title: "Invoice Created",
    description: `${invoiceNumber} saved as Draft.`,
  });

  // Reset form
  setCustomerId("");
  setCustomerSearch("");
  setCustomerSearchResults([]);
  setNotes("");
  setPaymentTerms("IMMEDIATE");
  setLineItems([emptyLine()]);
  setCreateOpen(false);
} catch (err) {
  toast({
    title: "Failed to create invoice",
    variant: "destructive",
  });
}
  };

  const handleSaleUnitChange = (idx: number, saleUnitId: string) => {
    updateLine(idx, "saleUnitId", saleUnitId);
  };

  const handleStateTransition = async (
    invoiceId: string,
    newState: InvoiceState,
  ) => {
    try {
      let updated: SalesInvoice;

      if (newState === "APPROVED") {
        updated = await approveSalesInvoiceApi(invoiceId);
      } else if (newState === "POSTED") {
        updated = await postSalesInvoiceApi(invoiceId);
      } else if (newState === "CANCELLED") {
        updated = await cancelSalesInvoiceApi(invoiceId);
      } else {
        return;
      }

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
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }

    try {
      const updated = await recordSalesPaymentApi(paymentInvoice.id, {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        reference: paymentRef,
      });

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updated.id ? updated : inv)),
      );

      toast({
        title: "Payment Recorded",
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

  const totals = calcTotals();

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sales Invoices</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create, manage, and track sales billing
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <FilePlus className="h-4 w-4" /> New Invoice
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-xs">
            {["ALL", "DRAFT", "APPROVED", "POSTED"].map((s) => (
              <Badge
                key={s}
                variant="outline"
                className={`cursor-pointer hover:bg-secondary ${stateFilter === s ? "bg-secondary" : ""}`}
                onClick={() => setStateFilter(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
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
                      Customer
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      State
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Grand Total
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
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
                      <td className="px-5 py-3 font-mono text-xs font-medium">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium">
                          {inv.customerName}
                        </p>
                        {inv.customerGSTIN && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {inv.customerGSTIN}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {inv.invoiceState === "POSTED" && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${stateStyles[inv.invoiceState]}`}
                          >
                            {inv.invoiceState}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        ₹{inv.subtotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        ₹{inv.taxBreakdown.totalTax.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        ₹{inv.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${paymentStyles[inv.paymentStatus]}`}
                        >
                          {inv.paymentStatus}
                        </Badge>
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-medium ${inv.outstandingAmount > 0 ? "text-destructive" : "text-success"}`}
                      >
                        ₹{inv.outstandingAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWhatsApp(inv)}
                            className="text-[#25D366] hover:text-[#128C7E]"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              printDocument({
                                title: `Sales Invoice - ${inv.invoiceNumber}`,
                                content: generateSalesInvoiceReceipt({
                                  ...inv,
                                  paymentTerms: inv.paymentTerms || "IMMEDIATE",
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
                              <CheckCircle className="h-4 w-4 text-info" />
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
                              <Send className="h-4 w-4 text-success" />
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
                                <CreditCard className="h-4 w-4 text-accent-foreground" />
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-5 py-10 text-center text-muted-foreground"
                      >
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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
      </div>

      {/* ─── State Transition Confirm ─── */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label} Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.newState === "POSTED" &&
                "This will lock the invoice. Stock will be deducted and journal entries (AR Dr / Revenue Cr / GST Cr) created. Cannot be undone."}
              {confirmAction?.newState === "APPROVED" &&
                "Approve for posting. Ensure all details are correct."}
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
                  : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
              }
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── View Invoice ─── */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 flex-wrap">
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
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
                {selectedInvoice.customerGSTIN && (
                  <div>
                    <p className="text-muted-foreground">GSTIN</p>
                    <p className="font-mono text-xs">
                      {selectedInvoice.customerGSTIN}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Terms</p>
                  <p>{selectedInvoice.paymentTerms}</p>
                </div>
              </div>
              {selectedInvoice.invoiceState === "POSTED" && (
                <div className="rounded-lg border border-success/20 bg-success/5 p-3 text-xs text-success flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  Locked (POSTED). Use credit notes for corrections.
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Description
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Unit
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
                          {li.description || li.itemName || "Item"}
                          {li.baseQty && li.saleUnitCode && (
                            <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              <ArrowRightLeft className="inline h-2.5 w-2.5 mr-0.5" />
                              {li.baseQty} base
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-xs font-mono">
                          {li.saleUnitCode || "—"}
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
                  {selectedInvoice.totalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span>
                        -₹
                        {selectedInvoice.totalDiscount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
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
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-[#25D366] hover:text-[#128C7E] border-[#25D366]/20 hover:border-[#128C7E]"
                  onClick={() => openWhatsApp(selectedInvoice)}
                >
                  <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    printDocument({
                      title: `Sales Invoice - ${selectedInvoice.invoiceNumber}`,
                      content: generateSalesInvoiceReceipt({
                        ...selectedInvoice,
                        paymentTerms:
                          selectedInvoice.paymentTerms || "IMMEDIATE",
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

      {/* ─── Create Invoice ─── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Sales Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Header - Customer Search Field */}
            <div className="grid grid-cols-3 gap-4">
              {/* Customer Selection with Search */}
              <div className="space-y-2 relative">
                <Label>Customer *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customer by name, phone, or GSTIN..."
                    className="pl-9"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                </div>

                {/* Customer dropdown results */}
                {showCustomerDropdown && customerSearch.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingCustomers ? (
                      <div className="px-4 py-6 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto" />
                        <p className="text-xs mt-2">Searching customers...</p>
                      </div>
                    ) : customerSearchResults.length === 0 ? (
                      <div className="px-4 py-6 text-center text-muted-foreground">
                      <div className="px-4 py-4 space-y-3">
  <p className="text-sm font-medium text-muted-foreground">
    No customers found
  </p>

  <Input
    placeholder="Enter customer name"
    value={newCustomerName}
    onChange={(e) => setNewCustomerName(e.target.value)}
  />

  <Input
    placeholder="Enter phone number"
    value={newCustomerPhone}
    onChange={(e) => setNewCustomerPhone(e.target.value)}
  />

  <Button
    size="sm"
    className="w-full"
    disabled={!newCustomerName || !newCustomerPhone || isCreatingCustomer}
    onClick={async () => {
      try {
        setIsCreatingCustomer(true);

        const res = await createCustomerApi({
          name: newCustomerName,
          phone: newCustomerPhone,
        });

        // ✅ Set customer
        setCustomerId(res.id);
        setCustomerSearch(res.name);

        // ✅ Reset
        setNewCustomerName("");
        setNewCustomerPhone("");
        setShowCustomerDropdown(false);

        toast({
          title: "Customer Created",
          description: `${res.name} added successfully`,
        });
      } catch (err) {
        toast({
          title: "Failed to create customer",
          variant: "destructive",
        });
      } finally {
        setIsCreatingCustomer(false);
      }
    }}
  >
    {isCreatingCustomer ? "Creating..." : "Create Customer"}
  </Button>
</div>
                      </div>
                    ) : (
                      customerSearchResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-4 py-2 hover:bg-muted cursor-pointer border-b last:border-0"
                          onClick={() => {
                            setCustomerId(customer.id);
                            setCustomerSearch(customer.name);
                            setShowCustomerDropdown(false);
                          }}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                            {customer.phone && <span>📞 {customer.phone}</span>}
                            {customer.gstin && <span>🔖 {customer.gstin}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Selected customer display */}
                {customerId && !showCustomerDropdown && (
                  <div className="mt-1 p-2 bg-muted/30 rounded-md border border-muted">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {
                            customerSearchResults.find(
                              (c) => c.id === customerId,
                            )?.name
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customers.find((c) => c.id === customerId)?.gstin &&
                            `GSTIN: ${customers.find((c) => c.id === customerId)?.gstin}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomerId("");
                          setCustomerSearch("");
                        }}
                        className="h-8 px-2"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Invoice # (Auto)</Label>
                <Input
                  value={`INV-SAL-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(4, "0")}`}
                  disabled
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                    <SelectItem value="NET_15">Net 15</SelectItem>
                    <SelectItem value="NET_30">Net 30</SelectItem>
                    <SelectItem value="NET_45">Net 45</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Barcode Scanner */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-info/40 bg-info/5">
              <ScanBarcode className="h-5 w-5 text-info shrink-0" />
              <div className="flex-1">
                <Input
                  placeholder="Scan barcode or type SKU and press Enter..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBarcodeScan(barcodeInput);
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBarcodeScan(barcodeInput)}
                disabled={!barcodeInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Line Items</Label>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add Line
                </Button>
              </div>
              <div className="space-y-3">
                {lineItems.map((li, idx) => {
                  const item = inventoryItems.find((i) => i.id === li.itemId);
                  const saleUnits = getSaleUnits(idx, li.itemId);
                  const { total } = calcLineTotals(li);
                  const selectedUnit = units.find(
                    (u) => u.id === li.saleUnitId,
                  );
                  const qty = parseFloat(li.quantity || "0");
                  const baseQty = li.saleUnitId
                    ? getBaseQty(qty, li.saleUnitId)
                    : qty;

                  return (
                    <div
                      key={li.id}
                      className="border rounded-lg p-3 space-y-3 bg-card"
                    >
                      {/* Row 1: Item or description */}
                      <div className="grid grid-cols-[1fr_120px_32px] gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Item / Description
                          </Label>

                          <div className="flex gap-2">
                            {/* ITEM SEARCH INPUT */}
                            <div className="space-y-1 flex-1 relative">
                              <Input
                                placeholder="Search item or SKU..."
                                value={
                                  li.itemId
                                    ? li.description
                                    : itemSearch[li.id] || ""
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setItemSearch((prev) => ({
                                    ...prev,
                                    [li.id]: value,
                                  }));
                                  setActiveSearch(value);
                                }}
                              />
                              {li.itemId && item && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Selected: <strong>{item.name}</strong> (
                                  {item.sku})
                                </div>
                              )}

                              {itemSearch[li.id] &&
                                (searchResults[li.id] || []).length > 0 && (
                                  <div className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
                                    {(searchResults[li.id] || []).map((i) => (
                                      <div
                                        key={i.id}
                                        className="px-3 py-2 cursor-pointer text-sm hover:bg-muted"
                                        onClick={() => {
                                          handleSelectItem(idx, i.id);
                                        }}
                                      >
                                        {i.name} ({i.sku}) — Stock{" "}
                                        {i.currentStock} {i.unit}
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* CATEGORY SELECT */}
                            <Select
                              value={li.category}
                              onValueChange={(v: SalesCategory) =>
                                updateLine(idx, "category", v)
                              }
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="GOODS">Goods</SelectItem>
                                <SelectItem value="SERVICES">
                                  Services
                                </SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* CUSTOM DESCRIPTION */}
                          {!li.itemId && (
                            <Input
                              placeholder="Custom description (services, etc.)"
                              value={li.description}
                              onChange={(e) =>
                                updateLine(idx, "description", e.target.value)
                              }
                              className="mt-1"
                            />
                          )}
                        </div>

                        {/* GST SELECT */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            GST %
                          </Label>

                          <Select
                            value={li.gstPercentage}
                            onValueChange={(v) =>
                              updateLine(idx, "gstPercentage", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* DELETE LINE */}
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

                      {/* Row 2: Qty, Unit, Price, Discount */}
                      <div className="grid grid-cols-5 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Qty
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={li.quantity}
                            onChange={(e) =>
                              updateLine(idx, "quantity", e.target.value)
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Sale Unit
                          </Label>
                          {saleUnits.length > 0 ? (
                            <Select
                              value={li.saleUnitId}
                              onValueChange={(v) =>
                                handleSaleUnitChange(idx, v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {saleUnits.map((u: Unit) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.shortCode} ({u.name})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={item?.unit || "PCS"}
                              disabled
                              className="bg-muted"
                            />
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Unit Price (₹)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={li.unitPrice}
                            onChange={(e) =>
                              updateLine(idx, "unitPrice", e.target.value)
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Discount (₹)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={li.discount}
                            onChange={(e) =>
                              updateLine(idx, "discount", e.target.value)
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Line Total
                          </p>
                          <p className="font-semibold text-sm">
                            ₹
                            {total.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Unit conversion preview */}
                      {li.saleUnitId && qty > 0 && selectedUnit && item && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-1.5">
                          <ArrowRightLeft className="h-3 w-3 text-info" />
                          <span>
                            {qty} {selectedUnit.shortCode} ={" "}
                            <strong className="text-foreground">
                              {baseQty.toFixed(selectedUnit.decimalPrecision)}{" "}
                              {selectedUnit.baseUnit_id?.shortCode ||
                                selectedUnit.shortCode}
                            </strong>{" "}
                            (base)
                          </span>
                          {item && baseQty > item.currentStock && (
                            <span className="ml-auto text-destructive font-medium">
                              ⚠ Exceeds stock ({item.currentStock})
                            </span>
                          )}

                          {item && baseQty <= item.currentStock && (
                            <span className="ml-auto text-success">
                              ✓ In stock
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1 max-w-sm">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Invoice notes..."
                  rows={2}
                />
              </div>
              <div className="w-72 space-y-1 text-sm border rounded-lg p-3 bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    ₹
                    {totals.subtotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>
                      -₹{totals.totalDiscount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGST</span>
                  <span>
                    ₹
                    {(totals.totalTax / 2).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SGST</span>
                  <span>
                    ₹
                    {(totals.totalTax / 2).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Grand Total</span>
                  <span>
                    ₹
                    {totals.grandTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
           <Button
  onClick={handleCreate}
  disabled={!customerId}
  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
>
  Create Invoice (Draft)
</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Record Payment ─── */}
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
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">
                      Bank Transfer (NEFT/RTGS)
                    </SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference # *</Label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Transaction/UTR/Cheque ref"
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
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
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
