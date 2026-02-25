
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  AlertTriangle,
  DollarSign,
  FileText,
  Users,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Leaf,
  IndianRupee,
} from "lucide-react";

import {
  getInventoryDashboardApi,
  getStockTransactionsApi,
  getInvoicesApi,
} from "@/api/inventoryApi";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  sub,
  variant = "default",
}: {
  title: string;
  value: string;
  icon: any;
  trend?: string;
  trendLabel?: string;
  sub?: string;
  variant?: "default" | "warning" | "success" | "danger" | "info";
}) => {
  const iconClass =
    variant === "warning"
      ? "bg-warning/10 text-warning"
      : variant === "success"
      ? "bg-success/10 text-success"
      : variant === "danger"
      ? "bg-destructive/10 text-destructive"
      : variant === "info"
      ? "bg-info/10 text-info"
      : "bg-accent/10 text-accent";

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
            {trend && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {trend.startsWith("+") ? (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                {trend} {trendLabel}
              </p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/* =========================================================
   BADGE
========================================================= */

const TransactionTypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    IN: "bg-success/10 text-success border-success/20",
    OUT: "bg-destructive/10 text-destructive border-destructive/20",
    ADJUSTMENT: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <Badge variant="outline" className={styles[type] || ""}>
      {type}
    </Badge>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [dashData, txnData, invoiceData] = await Promise.all([
          getInventoryDashboardApi(),
          getStockTransactionsApi(),
          getInvoicesApi(),
        ]);

        setDashboard(dashData);
        setTransactions(txnData || []);
        setInvoices(invoiceData || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
   
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise overview – stock, finance, and compliance
          </p>
        </div>

        {/* ===================== STATS ===================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Items"
            value={(dashboard?.totalItems ?? 0).toString()}
            icon={Package}
          />

          <StatCard
            title="Low Stock"
            value={(dashboard?.lowStockCount ?? 0).toString()}
            icon={AlertTriangle}
            variant="warning"
            sub="Items below minimum"
          />

          <StatCard
            title="Stock Value"
            value={`₹${(
              (dashboard?.totalStockValue ?? 0) / 1000
            ).toFixed(1)}K`}
            icon={DollarSign}
            variant="success"
            sub={`₹${(dashboard?.totalStockValue ?? 0).toLocaleString(
              "en-IN"
            )}`}
          />

          <StatCard
            title="Expiring Soon"
            value={(dashboard?.expiringSoon ?? 0).toString()}
            icon={Clock}
            variant={
              (dashboard?.expiringSoon ?? 0) > 0 ? "warning" : "default"
            }
            sub="Within 30 days"
          />

          <StatCard
            title="Pending Invoices"
            value={(dashboard?.pendingInvoices ?? 0).toString()}
            icon={FileText}
          />

          <StatCard
            title="Total Payable"
            value={`₹${(
              (dashboard?.totalOutstanding ?? 0) / 1000
            ).toFixed(1)}K`}
            icon={IndianRupee}
            variant="danger"
            sub="Outstanding to vendors"
          />
        </div>

        {/* ===================== LOW STOCK & EXPIRY ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboard?.lowStockItems?.length > 0 ? (
                dashboard.lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex justify-between border-b"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku} · {item.categoryName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">
                        {item.currentStock} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.minimumStock}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground">
                  All items sufficiently stocked.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Expiring Batches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Batches Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboard?.expiringBatches?.length > 0 ? (
                dashboard.expiringBatches.map((batch: any) => {
                  const daysLeft = Math.ceil(
                    (new Date(batch.expiryDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={batch.id}
                      className="px-5 py-3 flex justify-between border-b"
                    >
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          {batch.itemName}
                          <Leaf className="h-3 w-3 text-emerald-400" />
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {batch.batchNumber}
                        </p>
                      </div>
                      <Badge variant="outline">{daysLeft}d left</Badge>
                    </div>
                  );
                })
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground">
                  No batches expiring soon.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===================== TRANSACTIONS & PAYABLES ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Stock Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="px-5 py-3 flex justify-between border-b"
                >
                  <div className="flex gap-3 items-center">
                    <TransactionTypeBadge type={txn.type} />
                    <div>
                      <p className="text-sm font-medium">{txn.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.referenceType}
                      </p>
                    </div>
                  </div>
                  <p
                    className={
                      txn.type === "IN"
                        ? "text-success font-semibold"
                        : "text-destructive font-semibold"
                    }
                  >
                    {txn.type === "IN" ? "+" : "-"}
                    {Math.abs(txn.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vendor Payables */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Payables</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices
                .filter(
                  (inv) =>
                    inv.invoiceState === "POSTED" &&
                    inv.outstandingAmount > 0
                )
                .map((inv) => (
                  <div
                    key={inv.id}
                    className="px-5 py-3 flex justify-between border-b"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.vendorName}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {inv.invoiceNumber}
                      </p>
                    </div>
                    <p className="text-destructive font-bold">
                      ₹{inv.outstandingAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}

              {invoices.filter(
                (inv) =>
                  inv.invoiceState === "POSTED" &&
                  inv.outstandingAmount > 0
              ).length === 0 && (
                <p className="px-5 py-4 text-sm text-muted-foreground">
                  No outstanding payables.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

  );
};

export default Dashboard;