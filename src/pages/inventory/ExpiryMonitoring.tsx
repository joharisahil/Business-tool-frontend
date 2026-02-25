import { Layout as AppLayout } from '@/components/layout/Layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CalendarDays, Clock, Package2, Leaf } from 'lucide-react';
import { useState ,useEffect} from 'react';

import {
  getExpiryDashboardApi
} from '@/api/inventoryApi';
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";

const ExpiryMonitoring = () => {
  const { toast } = useToast();
  const [daysFilter, setDaysFilter] = useState(30);
const [expired, setExpired] = useState<any[]>([]);
const [expiring, setExpiring] = useState<any[]>([]);
const [allBatches, setAllBatches] = useState<any[]>([]);
const [perishableCount, setPerishableCount] = useState(0);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchExpiry = async () => {
    try {
      setLoading(true);

      const data = await getExpiryDashboardApi();

      setExpired(data.expired || []);
      setExpiring(data.expiring || []);
      setAllBatches(data.allBatches || []);
      setPerishableCount(data.summary?.perishableItems || 0);

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load expiry monitoring.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchExpiry();
}, [daysFilter]);

  const getDaysToExpiry = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (days: number) => {
    if (days <= 0) return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">EXPIRED</Badge>;
    if (days <= 7) return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">{days}d left</Badge>;
    if (days <= 30) return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">{days}d left</Badge>;
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">{days}d left</Badge>;
  };

  return (
    <>
  {loading ? (
    <div className="p-12 text-center text-muted-foreground">
      Loading expiry monitoring...
    </div>
  ) : (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Expiry Monitoring</h1>
            <p className="text-muted-foreground text-sm mt-1">Track perishable batch expiry and prevent wastage</p>
          </div>
          <Select value={String(daysFilter)} onValueChange={v => setDaysFilter(Number(v))}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Expiring in 7 days</SelectItem>
              <SelectItem value="15">Expiring in 15 days</SelectItem>
              <SelectItem value="30">Expiring in 30 days</SelectItem>
              <SelectItem value="60">Expiring in 60 days</SelectItem>
              <SelectItem value="90">Expiring in 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Expired Batches</p>
                <p className="text-2xl font-bold">{expired.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Requires immediate write-off</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0"><Clock className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiring.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Within next {daysFilter} days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0"><Leaf className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Perishable Items</p>
                <p className="text-2xl font-bold">{perishableCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Items with FIFO tracking</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expired Batches */}
        {expired.length > 0 && (
          <Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-base flex items-center gap-2 text-destructive">
      <AlertTriangle className="h-4 w-4" />
      Expired Stock (Action Required)
    </CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    {expired.length === 0 ? (
      <div className="py-10 text-center text-muted-foreground text-sm">
        No expired batches 🎉
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-destructive/5">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Item</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Batch No.</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Expiry Date</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expired.map(batch => (
                      <tr key={batch.id} className="bg-destructive/5">
                        <td className="px-5 py-3 font-medium">{batch.itemName}</td>
                        <td className="px-5 py-3 font-mono text-xs">{batch.batchNumber}</td>
                        <td className="px-5 py-3 text-right font-semibold text-destructive">{batch.remainingQuantity}</td>
                        <td className="px-5 py-3">{new Date(batch.expiryDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3 font-mono text-xs">{batch.invoiceNumber}</td>
                        <td className="px-5 py-3 text-center">{getExpiryBadge(getDaysToExpiry(batch.expiryDate))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
    )}
            </CardContent>
          </Card>
        )}

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-warning" />Expiring within {daysFilter} Days
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Item</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Batch No.</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Remaining Qty</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Unit Cost</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Received</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Expiry Date</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Days Left</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expiring.map(batch => {
                    const days = getDaysToExpiry(batch.expiryDate);
                    return (
                      <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium">{batch.itemName}</td>
                        <td className="px-5 py-3 font-mono text-xs">{batch.batchNumber}</td>
                        <td className="px-5 py-3 text-right font-semibold">{batch.remainingQuantity}</td>
                        <td className="px-5 py-3 text-right">₹{batch.unitCost.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-muted-foreground">{new Date(batch.receivedDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3">{new Date(batch.expiryDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3 text-center">{getExpiryBadge(days)}</td>
                        <td className="px-5 py-3 font-mono text-xs">{batch.invoiceNumber}</td>
                      </tr>
                    );
                  })}
                  {expiring.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">No batches expiring within {daysFilter} days.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* All Perishable Batches */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package2 className="h-4 w-4 text-info" />All Active Perishable Batches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Item</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Batch No.</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Received</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Remaining</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Expiry</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allBatches.map(batch => {
                    const days = getDaysToExpiry(batch.expiryDate);
                    return (
                      <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium">{batch.itemName}</td>
                        <td className="px-5 py-3 font-mono text-xs">{batch.batchNumber}</td>
                        <td className="px-5 py-3 text-right">{batch.receivedQuantity}</td>
                        <td className="px-5 py-3 text-right font-semibold">{batch.remainingQuantity}</td>
                        <td className="px-5 py-3">{new Date(batch.expiryDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3 text-center">{getExpiryBadge(days)}</td>
                      </tr>
                    );
                  })}
                  {allBatches.length === 0 && (
  <tr>
    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
      No perishable batches available.
    </td>
  </tr>
)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  )}
    </>
  );
};

export default ExpiryMonitoring;
