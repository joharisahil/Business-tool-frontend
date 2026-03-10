import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CalendarDays, Clock, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

import {
  getExpiryDashboardApi,
  getItemsApi,
} from "@/api/inventoryApi";

const ExpiryMonitoring = () => {
  const { toast } = useToast();

  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [batches, setBatches] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [daysFilter]);

  const loadData = async () => {
    try {
      const [expiryRes, itemsRes] = await Promise.all([
        getExpiryDashboardApi(daysFilter),
        getItemsApi(),
      ]);

       setBatches(expiryRes.batches || []);
      setInventoryItems(itemsRes || []);
    } catch (err) {
      toast({
        title: "Failed to load expiry data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const expired = batches.filter((b) => b.isExpired);
  const expiring = batches.filter((b) => !b.isExpired);

  const getDaysToExpiry = (expiryDate: string) => {
    const diff =
      new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (days: number) => {
    if (days <= 0)
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20 text-xs"
        >
          EXPIRED
        </Badge>
      );

    if (days <= 7)
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20 text-xs"
        >
          {days}d left
        </Badge>
      );

    if (days <= 30)
      return (
        <Badge
          variant="outline"
          className="bg-warning/10 text-warning border-warning/20 text-xs"
        >
          {days}d left
        </Badge>
      );

    return (
      <Badge
        variant="outline"
        className="bg-success/10 text-success border-success/20 text-xs"
      >
        {days}d left
      </Badge>
    );
  };

  if (loading) {
    return (
      < >
        <div className="p-6 text-sm text-muted-foreground">
          Loading expiry dashboard...
        </div>
      </ >
    );
  }

  return (
    < >
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Expiry Monitoring</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track perishable batch expiry and prevent wastage
            </p>
          </div>

          <Select
            value={String(daysFilter)}
            onValueChange={(v) => setDaysFilter(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="7">Expiring in 7 days</SelectItem>
              <SelectItem value="15">Expiring in 15 days</SelectItem>
              <SelectItem value="30">Expiring in 30 days</SelectItem>
              <SelectItem value="60">Expiring in 60 days</SelectItem>
              <SelectItem value="90">Expiring in 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Expired Batches
                </p>
                <p className="text-2xl font-bold">
                  {expired.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requires immediate write-off
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Expiring Soon
                </p>
                <p className="text-2xl font-bold">
                  {expiring.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Within next {daysFilter} days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Leaf className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Perishable Items
                </p>
                <p className="text-2xl font-bold">
                  {inventoryItems.filter((i) => i.isPerishable).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Items with FIFO tracking
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* TABLE */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-warning" />
              Expiring within {daysFilter} days
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs">Item</th>
                    <th className="px-5 py-3 text-left text-xs">Batch</th>
                    <th className="px-5 py-3 text-right text-xs">Qty</th>
                    <th className="px-5 py-3 text-left text-xs">Expiry</th>
                    <th className="px-5 py-3 text-center text-xs">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {batches.map((batch) => {
                    const days = getDaysToExpiry(batch.expiryDate);

                    return (
                      <tr key={batch.id}>

                        <td className="px-5 py-3 font-medium">
                          {batch.itemName}
                        </td>

                        <td className="px-5 py-3 font-mono text-xs">
                          {batch.batchNumber}
                        </td>

                        <td className="px-5 py-3 text-right">
                          {batch.remainingQuantity}
                        </td>

                        <td className="px-5 py-3">
                          {new Date(batch.expiryDate).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-5 py-3 text-center">
                          {getExpiryBadge(days)}
                        </td>

                      </tr>
                    );
                  })}

                  {batches.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No batches expiring within {daysFilter} days.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </CardContent>
        </Card>

      </div>
    </ >
  );
};

export default ExpiryMonitoring;