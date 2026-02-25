//import { Layout as AppLayout } from '@/components/layout/Layout';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Filter, Edit2, Power, Leaf, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  getItemsApi,
  createItemApi,
  updateItemApi,
  toggleItemApi,
  getCategoriesApi,
} from '@/api/inventoryApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from './types/inventory';

const statusFilter = ['all', 'active', 'inactive', 'low_stock', 'perishable'] as const;

const InventoryItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
const [categories, setCategories] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [status, setStatus] = useState<typeof statusFilter[number]>('all');
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [toggleItem, setToggleItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const emptyForm = { name: '', sku: '', categoryId: '', unit: '', costPrice: '', sellingPrice: '', minimumStock: '', isPerishable: false, shelfLifeDays: '' };
  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        getItemsApi(),
        getCategoriesApi(),
      ]);

      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({ name: item.name, sku: item.sku, categoryId: item.categoryId, unit: item.unit, costPrice: String(item.costPrice), sellingPrice: item.sellingPrice ? String(item.sellingPrice) : '', minimumStock: String(item.minimumStock), isPerishable: item.isPerishable, shelfLifeDays: item.shelfLifeDays ? String(item.shelfLifeDays) : '' });
    setOpen(true);
  };

  const filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchesStatus = status === 'all' || (status === 'active' && item.isActive) || (status === 'inactive' && !item.isActive) || (status === 'low_stock' && item.currentStock <= item.minimumStock) || (status === 'perishable' && item.isPerishable);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmit = async () => {
  if (!form.name || !form.sku || !form.categoryId || !form.unit || !form.costPrice) {
    toast({ title: 'Validation Error', description: 'Please fill all required fields.', variant: 'destructive' });
    return;
  }

  try {
    const payload = {
      name: form.name,
      sku: form.sku,
      category_id: form.categoryId,
      unit: form.unit,
      costPrice: parseFloat(form.costPrice),
      sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : undefined,
      minimumStock: parseInt(form.minimumStock) || 10,
      isPerishable: form.isPerishable,
      shelfLifeDays: form.isPerishable && form.shelfLifeDays ? parseInt(form.shelfLifeDays) : undefined,
    };

    if (editItem) {
      const updated = await updateItemApi(editItem.id, payload);
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      toast({ title: 'Item Updated', description: `${updated.name} has been updated.` });
    } else {
      const created = await createItemApi(payload);
      setItems(prev => [created, ...prev]);
      toast({ title: 'Item Added', description: `${created.name} has been added.` });
    }

    setForm(emptyForm);
    setOpen(false);

  } catch (err) {
    toast({ title: 'Error', description: 'Failed to save item.', variant: 'destructive' });
  }
};

  const handleToggle = async () => {
  if (!toggleItem) return;

  try {
    const updated = await toggleItemApi(toggleItem.id);
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));

    toast({
      title: `Item ${updated.isActive ? 'Activated' : 'Deactivated'}`,
      description: `${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}.`,
    });

    setToggleItem(null);
  } catch (err) {
    toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
  }
};

  return (
     <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory Items</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage stock items across all categories</p>
          </div>
          <Button className="gold-gradient text-accent-foreground font-medium" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Item
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={v => setStatus(v as typeof statusFilter[number])}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="perishable">Perishable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Item Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Min</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading && (
  <tr>
    <td colSpan={10} className="px-5 py-10 text-center text-muted-foreground">
      Loading items...
    </td>
  </tr>
)}
                  {filtered.map(item => {
                    const isLow = item.currentStock <= item.minimumStock;
                    return (
                      <tr key={item.id} className={`hover:bg-muted/30 transition-colors ${!item.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-5 py-3 font-mono text-xs">{item.sku}</td>
                        <td className="px-5 py-3 font-medium">{item.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{item.categoryName}</td>
                        <td className="px-5 py-3 text-muted-foreground">{item.unit}</td>
                        <td className="px-5 py-3 text-right">₹{item.costPrice.toLocaleString('en-IN')}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${isLow ? 'text-destructive' : ''}`}>{item.currentStock}</td>
                        <td className="px-5 py-3 text-right text-muted-foreground">{item.minimumStock}</td>
                        <td className="px-5 py-3 text-center">
                          {item.isPerishable ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs gap-1">
                              <Leaf className="h-3 w-3" />Perishable {item.shelfLifeDays && `· ${item.shelfLifeDays}d`}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs gap-1">
                              <Package className="h-3 w-3" />Non-Perishable
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {!item.isActive ? (
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">Inactive</Badge>
                          ) : isLow ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">In Stock</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Edit">
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setToggleItem(item)} title={item.isActive ? 'Deactivate' : 'Activate'}>
                              <Power className={`h-3.5 w-3.5 ${item.isActive ? 'text-destructive' : 'text-success'}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="px-5 py-10 text-center text-muted-foreground">No items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bath Towel (Premium)" />
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="LIN-004" className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Piece / Pack / Kg" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Cost Price *</Label>
                <Input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} placeholder="850" />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" value={form.minimumStock} onChange={e => setForm(f => ({ ...f, minimumStock: e.target.value }))} placeholder="10" />
              </div>
            </div>
            <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5 text-emerald-500" />Is Perishable</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable FIFO batch tracking & expiry monitoring</p>
                </div>
                <Switch checked={form.isPerishable} onCheckedChange={v => setForm(f => ({ ...f, isPerishable: v, shelfLifeDays: v ? f.shelfLifeDays : '' }))} />
              </div>
              {form.isPerishable && (
                <div className="space-y-2">
                  <Label>Shelf Life (Days)</Label>
                  <Input type="number" value={form.shelfLifeDays} onChange={e => setForm(f => ({ ...f, shelfLifeDays: e.target.value }))} placeholder="e.g. 365 for 1 year" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="gold-gradient text-accent-foreground">{editItem ? 'Update Item' : 'Add Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Active Confirmation */}
      <AlertDialog open={!!toggleItem} onOpenChange={() => setToggleItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{toggleItem?.isActive ? 'Deactivate Item' : 'Activate Item'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {toggleItem?.isActive
                ? `"${toggleItem?.name}" will be hidden from purchase workflows. Existing stock remains unchanged.`
                : `"${toggleItem?.name}" will be reactivated and visible in purchase workflows.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} className={toggleItem?.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
              {toggleItem?.isActive ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InventoryItems;
