import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit2, Power, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  getPaginatedItemsApi,
  createItemApi,
  updateItemApi,
  toggleItemApi,
  getCategoriesApi,
  getUnitsApi,
} from "@/api/inventoryApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem } from "@/pages/inventory/types/inventory";
import { useDebounce } from "@/hooks/useDebounce";

// Define the response types
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Category {
  id: string;
  _id?: string;
  name: string;
  description?: string;
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

const InventoryItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ===============================
     FILTER STATE
  =============================== */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 500);

  /* ===============================
     QUERIES (Using paginated API with filters)
  =============================== */
  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<InventoryItem>>({
    queryKey: ["inventory-items", page, debouncedSearch, categoryFilter],
    queryFn: () => 
      getPaginatedItemsApi({ 
        page, 
        limit,
        search: debouncedSearch || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
    
      }),
    // Replace keepPreviousData with this approach for older React Query versions
    placeholderData: (previousData) => previousData,
  });

  const items = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  const { data: unitsRaw = [] } = useQuery<any[]>({
    queryKey: ["units"],
    queryFn: getUnitsApi,
  });

  const units = unitsRaw.map((u: any) => ({
    ...u,
    id: u._id || u.id,
    baseUnitId: u.baseUnit_id?.id || null,
  }));

  /* ===============================
     STATE
  =============================== */
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [toggleItem, setToggleItem] = useState<InventoryItem | null>(null);

  const emptyForm = {
    name: "",
    sku: "",
    categoryId: "",
    purchaseUnitId: "",
    saleUnitIds: [] as string[],
    costPrice: "",
    sellingPrice: "",
    minimumStock: "",
    isPerishable: false,
    shelfLifeDays: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* ===============================
     MUTATIONS
  =============================== */
  const createMutation = useMutation({
    mutationFn: createItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast({
        title: "Item Created",
        description: "The item has been added to your inventory.",
      });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateItemApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast({
        title: "Item Updated",
        description: "Changes have been saved successfully.",
      });
      setOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleItemApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast({ title: "Status Changed" });
    },
  });

  /* ===============================
     UNIT HELPERS
  =============================== */
  const getBaseUnit = (unitId: string) => {
    let unit = units.find((u: Unit) => u.id === unitId);
    while (unit?.baseUnitId) {
      unit = units.find((u: Unit) => u.id === unit.baseUnitId);
    }
    return unit;
  };
  
  const getUnitFamily = (purchaseUnitId: string) => {
    if (!purchaseUnitId) return [];
    const pu = units.find((u: Unit) => u.id === purchaseUnitId);
    if (!pu) return [];
    
    // find root base unit
    let base = pu;
    while (base.baseUnitId) {
      const parent = units.find((u: Unit) => u.id === base.baseUnitId);
      if (!parent) break;
      base = parent;
    }
    const baseId = base.id;
    
    // return all units belonging to that base
    return units.filter(
      (u: Unit) => u.isActive && (u.id === baseId || u.baseUnitId === baseId),
    );
  };

  const unitFamily = getUnitFamily(form.purchaseUnitId);
  const baseUnit = getBaseUnit(form.purchaseUnitId);

  /* ===============================
     HANDLERS
  =============================== */
  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      sku: item.sku,
      categoryId: item.categoryId,
      purchaseUnitId: item.purchaseUnitId || "",
      saleUnitIds: item.saleUnits || [],
      costPrice: String(item.costPrice),
      sellingPrice: item.sellingPrice ? String(item.sellingPrice) : "",
      minimumStock: String(item.minimumStock),
      isPerishable: item.isPerishable,
      shelfLifeDays: item.shelfLifeDays ? String(item.shelfLifeDays) : "",
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      sku: form.sku,
      category_id: form.categoryId,
      saleUnits: form.saleUnitIds,
      unit: baseUnit?.shortCode,
      purchaseUnit_id: form.purchaseUnitId,
      costPrice: Number(form.costPrice),
      sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
      minimumStock: Number(form.minimumStock),
      isPerishable: form.isPerishable,
      shelfLifeDays: form.shelfLifeDays
        ? Number(form.shelfLifeDays)
        : undefined,
    };

    if (editItem) {
      updateMutation.mutate({ id: editItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter]);

  if (isLoading && items.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory Items</h1>
            <p className="text-muted-foreground text-sm">
              Manage products with real-time stock and unit mapping
            </p>
          </div>
          <Button onClick={openAdd} className="bg-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Add New Item
          </Button>
        </div>

        {/* FILTERS */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c: Category) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* DATA TABLE */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold">SKU</th>
                  <th className="p-4 text-left font-semibold">Item Details</th>
                  <th className="p-4 text-right font-semibold">Base Cost</th>
                  <th className="p-4 text-right font-semibold">Stock</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item: InventoryItem) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 font-mono text-xs text-blue-600">
                        {item.sku}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.categoryName}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        ₹{item.costPrice.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`px-2 py-1 rounded ${
                            item.currentStock <= item.minimumStock 
                              ? "bg-red-100 text-red-700 font-bold" 
                              : ""
                          }`}
                        >
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4 text-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToggleItem(item)}
                          className={
                            item.isActive ? "text-red-500" : "text-green-500"
                          }
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {isFetching ? "Searching..." : "No items found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {pagination.totalPages > 0 && (
              <DataTablePagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(newPage: number) => setPage(newPage)}
                onPageSizeChange={(newSize: number) => {
                  // Optional: handle page size change
                  console.log("Page size changed to:", newSize);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* FORM DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editItem ? "Edit Inventory Item" : "Create New Inventory Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4">
              <div className="space-y-2">
                <Label>Item Name*</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Basmati Rice"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU / Barcode*</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="Unique SKU ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: Category) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Purchase Unit</Label>
                <Select
                  value={form.purchaseUnitId}
                  onValueChange={(v) =>
                    setForm({ ...form, purchaseUnitId: v, saleUnitIds: [] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Base unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units
                      .filter((u: Unit) => u.isActive)
                      .map((u: Unit) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.shortCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SALE UNITS MAPPING */}
              <div className="col-span-2 space-y-3 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Info className="h-4 w-4" /> Available Sales Units
                  (Conversions)
                </div>
                {form.purchaseUnitId ? (
                  <div className="flex flex-wrap gap-4">
                    {unitFamily.map((u: Unit) => (
                      <div
                        key={u.id}
                        className="flex items-center space-x-2 bg-background p-2 rounded border shadow-sm"
                      >
                        <Checkbox
                          id={`unit-${u.id}`}
                          checked={form.saleUnitIds.includes(u.id)}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            const ids = isChecked
                              ? [...form.saleUnitIds, u.id]
                              : form.saleUnitIds.filter((id) => id !== u.id);
                            setForm({ ...form, saleUnitIds: ids });
                          }}
                        />
                        <Label htmlFor={`unit-${u.id}`}>
                          {u.shortCode}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({u.name})
                          </span>
                          {u.baseUnitId && (
                            <span className="text-xs text-blue-500 ml-2">
                              ×{u.conversionFactor}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    Select a Purchase Unit first to see related sale units.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cost Price (Per Base Unit)</Label>
                <Input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({ ...form, costPrice: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (Per Base Unit)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellingPrice: e.target.value })
                  }
                  placeholder="0.00 (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use cost price as selling price
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reorder Level (Min Stock)</Label>
                <Input
                  type="number"
                  value={form.minimumStock}
                  onChange={(e) =>
                    setForm({ ...form, minimumStock: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 border rounded-lg p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Perishable Item
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable expiry tracking for this item
                    </p>
                  </div>
                  <Checkbox
                    checked={form.isPerishable}
                    onCheckedChange={(checked: boolean) =>
                      setForm({
                        ...form,
                        isPerishable: checked,
                        shelfLifeDays: checked ? form.shelfLifeDays : "",
                      })
                    }
                  />
                </div>
                {form.isPerishable && (
                  <div className="space-y-2">
                    <Label>Shelf Life (Days)</Label>
                    <Input
                      type="number"
                      placeholder="Example: 365"
                      value={form.shelfLifeDays}
                      onChange={(e) =>
                        setForm({ ...form, shelfLifeDays: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Discard
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editItem ? "Save Changes" : "Create Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* STATUS ALERT DIALOG */}
        <AlertDialog
          open={!!toggleItem}
          onOpenChange={() => setToggleItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will {toggleItem?.isActive ? "deactivate" : "activate"}{" "}
                <b>{toggleItem?.name}</b>.
                {toggleItem?.isActive &&
                  " Deactivated items cannot be used in new Invoices."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (toggleItem) toggleMutation.mutate(toggleItem.id);
                  setToggleItem(null);
                }}
                className={toggleItem?.isActive ? "bg-red-600" : "bg-green-600"}
              >
                Proceed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default InventoryItems;