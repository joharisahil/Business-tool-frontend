import { Layout as AppLayout } from '@/components/layout/Layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowDownCircle, ArrowUpCircle, Plus, ClipboardList } from 'lucide-react';
import { useState ,useEffect } from 'react';
import {
  getItemsApi,
  getStockAdjustmentsApi,
  createStockAdjustmentApi,
} from '@/api/inventoryApi';
import { useToast } from '@/hooks/use-toast';
import type { StockAdjustment } from './types/inventory';

const reasonLabels: Record<StockAdjustment['reason'], string> = {
  DAMAGED: 'Damaged', EXPIRED: 'Expired / Wastage', THEFT: 'Theft / Shrinkage',
  CORRECTION: 'Stock Correction', OPENING_STOCK: 'Opening Stock', OTHER: 'Other',
};

const StockAdjustments = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
const [items, setItems] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    itemId: '', type: 'OUT' as 'IN' | 'OUT', quantity: '', reason: 'CORRECTION' as StockAdjustment['reason'], notes: '',
  });
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [itemsData, adjustmentData] = await Promise.all([
        getItemsApi(),
        getStockAdjustmentsApi(),
      ]);

      setItems(itemsData);
      setAdjustments(adjustmentData);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load stock data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  const selectedItem = items.find(i => i.id === form.itemId);

  const handleSubmit = () => {
    if (!form.itemId || !form.quantity || parseInt(form.quantity) <= 0) {
      toast({ title: 'Validation Error', description: 'Please select an item and enter a valid quantity.', variant: 'destructive' });
      return;
    }
    if (!form.notes.trim()) {
      toast({ title: 'Notes Required', description: 'Please provide notes for audit trail purposes.', variant: 'destructive' });
      return;
    }
    const item = items.find(i => i.id === form.itemId)!;
    const qty = parseInt(form.quantity);
    if (form.type === 'OUT' && qty > item.currentStock) {
      toast({ title: 'Insufficient Stock', description: `Only ${item.currentStock} units available. Cannot deduct ${qty}.`, variant: 'destructive' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
  try {
    const payload = {
      itemId: form.itemId,
      type: form.type,
      quantity: Number(form.quantity),
      reason: form.reason,
      notes: form.notes,
    };

    const created = await createStockAdjustmentApi(payload);

    // refresh items + adjustments after creation
    const [itemsData, adjustmentData] = await Promise.all([
      getItemsApi(),
      getStockAdjustmentsApi(),
    ]);

    setItems(itemsData);
    setAdjustments(adjustmentData);

    setForm({
      itemId: '',
      type: 'OUT',
      quantity: '',
      reason: 'CORRECTION',
      notes: '',
    });

    setConfirmOpen(false);

    toast({
      title: 'Adjustment Recorded',
      description: 'Stock adjustment successfully recorded.',
    });
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to record stock adjustment.',
      variant: 'destructive',
    });
  }
};

  return (
     <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manual Stock Adjustments</h1>
          <p className="text-muted-foreground text-sm mt-1">Record stock corrections, damages, wastage, and manual stock movements</p>
        </div>

        {/* Adjustment Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />New Stock Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <Label>Item *</Label>
                <Select value={form.itemId} onValueChange={v => setForm(f => ({ ...f, itemId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select inventory item" /></SelectTrigger>
                  <SelectContent>
                    {items.filter(i => i.isActive).map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.name} <span className="text-muted-foreground ml-1">({i.sku} · Stock: {i.currentStock})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedItem && (
                  <p className="text-xs text-muted-foreground">Current stock: <span className={`font-semibold ${selectedItem.currentStock <= selectedItem.minimumStock ? 'text-destructive' : 'text-success'}`}>{selectedItem.currentStock} {selectedItem.unit}</span></p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'IN' | 'OUT' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Stock IN (+)</SelectItem>
                    <SelectItem value="OUT">Stock OUT (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Enter qty" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reason *</Label>
                <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v as StockAdjustment['reason'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(reasonLabels) as [StockAdjustment['reason'], string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes / Justification *</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Describe reason for adjustment (required for audit trail)..." rows={2} />
              </div>
            </div>
            {selectedItem && form.quantity && parseInt(form.quantity) > 0 && (
              <div className="rounded-lg border p-3 bg-muted/20 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Preview:</span>
                <span className="font-medium">{selectedItem.name}</span>
                <span className="text-muted-foreground">{selectedItem.currentStock}</span>
                <span className="text-muted-foreground">→</span>
                <span className={`font-bold ${form.type === 'IN' ? 'text-success' : 'text-destructive'}`}>
                  {form.type === 'IN' ? selectedItem.currentStock + parseInt(form.quantity) : selectedItem.currentStock - parseInt(form.quantity)}
                </span>
                <span className="text-muted-foreground">{selectedItem.unit}</span>
              </div>
            )}
            <div className="flex justify-end">
             <Button
  onClick={handleSubmit}
  disabled={loading}
  className="gold-gradient text-accent-foreground"
>
                {form.type === 'IN' ? <ArrowUpCircle className="h-4 w-4 mr-2" /> : <ArrowDownCircle className="h-4 w-4 mr-2" />}
                Record Adjustment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground" />Adjustment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
          {loading ? (
  <div className="p-6 text-sm text-muted-foreground">
    Loading stock adjustments...
  </div>
) : (
  <div className="overflow-x-auto">
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Date & Time</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Item</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Before</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">After</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Reason</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Notes</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adjustments.map(adj => (
                    <tr key={adj.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(adj.adjustedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{adj.itemName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{adj.itemSku}</p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant="outline" className={adj.type === 'IN' ? 'bg-success/10 text-success border-success/20 text-xs' : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                          {adj.type === 'IN' ? '+' : '-'} {adj.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-bold">{adj.quantity}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{adj.balanceBefore}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${adj.type === 'IN' ? 'text-success' : 'text-destructive'}`}>{adj.balanceAfter}</td>
                      <td className="px-5 py-3"><Badge variant="outline" className="text-[10px]">{reasonLabels[adj.reason]}</Badge></td>
                      <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate">{adj.notes}</td>
                      <td className="px-5 py-3 font-medium">{adj.adjustedBy}</td>
                    </tr>
                  ))}
                  {adjustments.length === 0 && (
                    <tr><td colSpan={9} className="px-5 py-8 text-center text-muted-foreground">No adjustments recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
)}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stock Adjustment</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently record a stock <strong>{form.type}</strong> of <strong>{form.quantity}</strong> unit(s) for <strong>{selectedItem?.name}</strong>.
              Reason: <strong>{reasonLabels[form.reason]}</strong>. This action cannot be undone and will be logged in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className={form.type === 'OUT' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
              Confirm & Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
     </>
  );
};

export default StockAdjustments;
