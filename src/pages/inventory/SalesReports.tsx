
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  FileText,
  PieChart,
  Clock,
  BarChart3,
  Receipt,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  getSalesSummaryApi,
  getReceivableAgingApi,
} from "@/api/inventoryApi";

const SalesReports = () => {
  const [summary, setSummary] = useState<any>(null);
  const [aging, setAging] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

const loadReports = async () => {
  try {
    const [summaryRes, agingRes] = await Promise.all([
      getSalesSummaryApi(),
      getReceivableAgingApi(),
    ]);

    const mappedSummary = {
      totalRevenue: summaryRes.summary.totalRevenue,
      totalTax: summaryRes.summary.totalTax,
      totalCollected: summaryRes.summary.totalCollected,
      totalReceivable: summaryRes.summary.totalOutstanding,
      postedInvoices: summaryRes.summary.totalInvoices,

      categoryRevenue: summaryRes.byCategory.map((c: any) => ({
        category: c._id || "UNCATEGORIZED",
        amount: c.revenue,
      })),
    };

    const mappedAging = {
      current: agingRes.buckets.current,
      days31to60: agingRes.buckets.days31_60,
      days61to90: agingRes.buckets.days61_90,
      above90: agingRes.buckets.days90plus,

      outstandingInvoices: agingRes.details.map((inv: any) => ({
        id: inv.invoiceNumber,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName || "Unknown",
        outstandingAmount: inv.outstanding,
        paymentStatus: inv.outstanding > 0 ? "UNPAID" : "PAID",
      })),
    };

    setSummary(mappedSummary);
    setAging(mappedAging);

  } catch (err) {
    console.error("Failed to load sales reports", err);
  } finally {
    setLoading(false);
  }
};

  const totalRevenue = summary?.totalRevenue || 0;
  const totalTax = summary?.totalTax || 0;
  const totalCollected = summary?.totalCollected || 0;
  const totalReceivable = summary?.totalReceivable || 0;
  const postedInvoices = summary?.postedInvoices || 0;

  const outstandingInvoices = aging?.outstandingInvoices || [];

  if (loading) {
    return (
      < >
        <div className="p-6 text-sm text-muted-foreground">
          Loading sales reports...
        </div>
      </ >
    );
  }

  return (
    < >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Revenue analytics, GST reports, receivable aging & collections
          </p>
        </div>

        {/* KPI Cards */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(totalRevenue / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {postedInvoices} posted invoices
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">GST Collected</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(totalTax / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Output tax liability
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Collected
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{(totalCollected / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receivable</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    ₹{(totalReceivable / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {outstandingInvoices.length} invoices pending
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Receivable Aging */}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-warning" />
                Receivable Aging
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Current (0-30 days)",
                    amount: aging?.current || 0,
                    color: "bg-success",
                  },
                  {
                    label: "31-60 days",
                    amount: aging?.days31to60 || 0,
                    color: "bg-warning",
                  },
                  {
                    label: "61-90 days",
                    amount: aging?.days61to90 || 0,
                    color: "bg-accent",
                  },
                  {
                    label: "90+ days",
                    amount: aging?.above90 || 0,
                    color: "bg-destructive",
                  },
                ].map((bucket) => (
                  <div
                    key={bucket.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${bucket.color}`}
                      />
                      <span className="text-sm">{bucket.label}</span>
                    </div>

                    <span className="text-sm font-semibold">
                      ₹{Number(bucket.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-destructive" />
                Outstanding Invoices
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {outstandingInvoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.customerName}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {inv.invoiceNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">
                        ₹{inv.outstandingAmount.toLocaleString("en-IN")}
                      </p>

                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          inv.paymentStatus === "UNPAID"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}
                      >
                        {inv.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}

                {outstandingInvoices.length === 0 && (
                  <p className="px-5 py-4 text-sm text-muted-foreground">
                    No outstanding receivables.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-accent" />
                Revenue by Category
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summary?.categoryRevenue?.map((c: any) => (
                  <div key={c.category} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      {c.category}
                    </p>

                    <p className="text-lg font-bold mt-1">
                      ₹{(c.amount / 1000).toFixed(1)}K
                    </p>
                  </div>
                ))}

                {!summary?.categoryRevenue?.length && (
                  <p className="text-sm text-muted-foreground">
                    No revenue data available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </ >
  );
};

export default SalesReports;