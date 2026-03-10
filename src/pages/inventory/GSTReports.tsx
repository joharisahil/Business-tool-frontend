//import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getSalesInvoicesApi } from "@/api/inventoryApi";
import type { SalesInvoice } from "@/pages/inventory/types/inventory";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Receipt,
  FileText,
  IndianRupee,
  TrendingUp,
  Building2,
  User,
  Download,
  Filter,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { printDocument, generateGSTReportPrint } from "@/utils/printUtils";

type InvoiceRow = {
  invoiceNumber: string;
  date: string;
  customerName: string;
  gstin: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
  type: "B2B" | "B2C";
};

type HSNRow = {
  description: string;
  quantity: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
};

const GSTReports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
 const { data, isLoading } = useQuery({
  queryKey: ["salesInvoices"],
  queryFn: getSalesInvoicesApi,
});

const salesInvoices: SalesInvoice[] = data?.data || [];
const postedInvoices = useMemo(() => {
  return salesInvoices.filter((i) => {
    if (i.invoiceState !== "POSTED") return false;

    if (fromDate && new Date(i.createdAt) < new Date(fromDate)) return false;

    if (toDate && new Date(i.createdAt) > new Date(toDate)) return false;

    return true;
  });
}, [salesInvoices, fromDate, toDate]);

  // GSTR-1 style invoice rows
  const invoiceRows: InvoiceRow[] = useMemo(() => {
    return postedInvoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      date: inv.createdAt,
      customerName: inv.customerName,
      gstin: inv.customerGSTIN || "",
      taxableValue: inv.subtotal,
      cgst: inv.taxBreakdown.cgst,
      sgst: inv.taxBreakdown.sgst,
      igst: inv.taxBreakdown.igst,
      totalTax: inv.taxBreakdown.totalTax,
      grandTotal: inv.grandTotal,
      type: inv.customerGSTIN ? "B2B" : "B2C",
    }));
  }, [postedInvoices]);

  // HSN summary
  const hsnRows: HSNRow[] = useMemo(() => {
    const map: Record<string, HSNRow> = {};
    postedInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
       const key = item.description || item.itemName || "Unknown Item";
        if (!map[key]) {
          map[key] = {
            description: key,
            quantity: 0,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
          };
        }
        map[key].quantity += item.quantity;
        const rate = item.gstPercentage || 0;

const taxable =
  rate === 0
    ? item.totalAmount
    : item.totalAmount / (1 + rate / 100);

const tax = item.totalAmount - taxable;
        map[key].taxableValue += taxable;
        map[key].cgst += tax / 2;
        map[key].sgst += tax / 2;
        map[key].igst += 0;
        map[key].totalTax += tax;
      });
    });
    return Object.values(map).sort((a, b) => b.taxableValue - a.taxableValue);
  }, [postedInvoices]);

  
  // Totals
  const totals = useMemo(() => {
    return invoiceRows.reduce(
      (acc, r) => ({
        taxableValue: acc.taxableValue + r.taxableValue,
        cgst: acc.cgst + r.cgst,
        sgst: acc.sgst + r.sgst,
        igst: acc.igst + r.igst,
        totalTax: acc.totalTax + r.totalTax,
        grandTotal: acc.grandTotal + r.grandTotal,
      }),
      {
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
        grandTotal: 0,
      },
    );
  }, [invoiceRows]);

  const b2bRows = invoiceRows.filter((r) => r.type === "B2B");
  const b2cRows = invoiceRows.filter((r) => r.type === "B2C");

  // GST rate-wise summary
  const rateWise = useMemo(() => {
    const map: Record<
      number,
      {
        rate: number;
        taxableValue: number;
        cgst: number;
        sgst: number;
        igst: number;
        totalTax: number;
        count: number;
      }
    > = {};
    postedInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const rate = item.gstPercentage;
        if (!map[rate])
          map[rate] = {
            rate,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
            count: 0,
          };
        const taxable = item.totalAmount / (1 + item.gstPercentage / 100);
        const tax = item.totalAmount - taxable;

        map[rate].taxableValue += taxable;
        map[rate].cgst += tax / 2;
        map[rate].sgst += tax / 2;
        map[rate].igst += 0;
        map[rate].totalTax += tax;
        map[rate].count += 1;
      });
    });
    return Object.values(map).sort((a, b) => a.rate - b.rate);
  }, [postedInvoices]);

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  if (isLoading) {
  return (
    <div className="p-6 text-muted-foreground">
      Loading GST report...
    </div>
  );
}
    return (
      < >
        <div className="p-6 text-muted-foreground">Loading GST report...</div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">GST Reports</h1>
              <p className="text-muted-foreground text-sm mt-1">
                GSTR-1 output tax, HSN summary & rate-wise breakdown
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  printDocument({
                    title: "GST Report - GSTR-1 Summary",
                    content: generateGSTReportPrint({
                      fromDate,
                      toDate,
                      invoiceRows,
                      totals,
                      rateWise,
                    }),
                  });
                }}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  printDocument({
                    title: "GST Report - GSTR-1 Summary",
                    content: generateGSTReportPrint({
                      fromDate,
                      toDate,
                      invoiceRows,
                      totals,
                      rateWise,
                    }),
                  });
                }}
              >
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            {(fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                <Filter className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Taxable Value</p>
                <p className="text-xl font-bold mt-1">
                  {fmt(totals.taxableValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">CGST</p>
                <p className="text-xl font-bold mt-1 text-info">
                  {fmt(totals.cgst)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">SGST</p>
                <p className="text-xl font-bold mt-1 text-info">
                  {fmt(totals.sgst)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">IGST</p>
                <p className="text-xl font-bold mt-1 text-warning">
                  {fmt(totals.igst)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  Total Tax Collected
                </p>
                <p className="text-xl font-bold mt-1 text-success">
                  {fmt(totals.totalTax)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="gstr1" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gstr1" className="gap-1">
                <FileText className="h-3.5 w-3.5" /> GSTR-1 Summary
              </TabsTrigger>
              <TabsTrigger value="b2b" className="gap-1">
                <Building2 className="h-3.5 w-3.5" /> B2B Invoices
              </TabsTrigger>
              <TabsTrigger value="b2c" className="gap-1">
                <User className="h-3.5 w-3.5" /> B2C Invoices
              </TabsTrigger>
              <TabsTrigger value="hsn" className="gap-1">
                <Receipt className="h-3.5 w-3.5" /> HSN Summary
              </TabsTrigger>
              <TabsTrigger value="ratewise" className="gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Rate-wise
              </TabsTrigger>
            </TabsList>

            {/* GSTR-1 Summary */}
            <TabsContent value="gstr1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    GSTR-1 Output Tax Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">
                        Total Invoices
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {invoiceRows.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">
                        B2B (with GSTIN)
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {b2bRows.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">
                        B2C (without GSTIN)
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {b2cRows.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">
                        Total Output Tax
                      </p>
                      <p className="text-2xl font-bold mt-1 text-success">
                        {fmt(totals.totalTax)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Invoice #
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Date
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Customer
                          </th>
                          <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Type
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Taxable
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            CGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            SGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {invoiceRows.map((r) => (
                          <tr
                            key={r.invoiceNumber}
                            className="hover:bg-muted/30"
                          >
                            <td className="px-4 py-2 font-mono text-xs">
                              {r.invoiceNumber}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {new Date(r.date).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-2">
                              <p className="text-sm">{r.customerName}</p>
                              {r.gstin && (
                                <p className="text-[10px] font-mono text-muted-foreground">
                                  {r.gstin}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Badge
                                variant="outline"
                                className={
                                  r.type === "B2B"
                                    ? "bg-info/10 text-info border-info/20"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {r.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.taxableValue)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.cgst)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.sgst)}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {fmt(r.grandTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/50 font-bold">
                          <td colSpan={4} className="px-4 py-2 text-right">
                            Total
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.taxableValue)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.cgst)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.sgst)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.grandTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* B2B */}
            <TabsContent value="b2b">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-info" /> B2B Invoices
                    (Registered Parties)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {b2bRows.length === 0 ? (
                    <p className="px-5 py-8 text-center text-muted-foreground">
                      No B2B invoices in selected period.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {b2bRows.map((r) => (
                        <div
                          key={r.invoiceNumber}
                          className="flex items-center justify-between px-5 py-3 hover:bg-muted/30"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {r.customerName}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {r.gstin}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.invoiceNumber} ·{" "}
                              {new Date(r.date).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              {fmt(r.grandTotal)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Tax: {fmt(r.totalTax)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* B2C */}
            <TabsContent value="b2c">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-warning" /> B2C Invoices
                    (Unregistered)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {b2cRows.length === 0 ? (
                    <p className="px-5 py-8 text-center text-muted-foreground">
                      No B2C invoices in selected period.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {b2cRows.map((r) => (
                        <div
                          key={r.invoiceNumber}
                          className="flex items-center justify-between px-5 py-3 hover:bg-muted/30"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {r.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.invoiceNumber} ·{" "}
                              {new Date(r.date).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              {fmt(r.grandTotal)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Tax: {fmt(r.totalTax)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HSN Summary */}
            <TabsContent value="hsn">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-accent-foreground" /> HSN /
                    Item-wise Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Description
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Qty
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Taxable Value
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            CGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            SGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            IGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Total Tax
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {hsnRows.map((r) => (
                          <tr key={r.description} className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-medium">
                              {r.description}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {r.quantity}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.taxableValue)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.cgst)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.sgst)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.igst)}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {fmt(r.totalTax)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rate-wise */}
            <TabsContent value="ratewise">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" /> GST
                    Rate-wise Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            GST Rate
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Line Items
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Taxable Value
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            CGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            SGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            IGST
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                            Total Tax
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {rateWise.map((r) => (
                          <tr key={r.rate} className="hover:bg-muted/30">
                            <td className="px-4 py-2">
                              <Badge variant="outline" className="font-mono">
                                {r.rate}%
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-right">{r.count}</td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.taxableValue)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.cgst)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.sgst)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {fmt(r.igst)}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {fmt(r.totalTax)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/50 font-bold">
                          <td className="px-4 py-2">All Rates</td>
                          <td className="px-4 py-2 text-right">
                            {rateWise.reduce((s, r) => s + r.count, 0)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.taxableValue)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.cgst)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.sgst)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.igst)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {fmt(totals.totalTax)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ >
    );
  };

export default GSTReports;
