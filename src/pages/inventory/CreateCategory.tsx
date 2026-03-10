
import { Card, CardContent,  } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Power, PowerOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  toggleCategoryApi,
} from "@/api/inventoryApi";
import type { InventoryCategory } from "./types/inventory";
import { useToast } from "@/hooks/use-toast";



const Categories = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState<InventoryCategory []>([]);
  const [loading, setLoading] = useState(true);

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory  | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // ───────────────────────────────────────────
  // Load Categories
  // ───────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesApi();
        setCategories(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ───────────────────────────────────────────
  // Create Category
  // ───────────────────────────────────────────
  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createCategoryApi({
        name: name.trim(),
        description: description.trim(),
      });

      setCategories((prev) => [created, ...prev]);

      setCreateOpen(false);
      setName("");
      setDescription("");

      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      });
    }
  };

  // ───────────────────────────────────────────
  // Update Category
  // ───────────────────────────────────────────
  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      const updated = await updateCategoryApi(editingCategory.id, {
        name: editName,
        description: editDescription,
      });

      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setEditOpen(false);
      toast({
        title: "Updated",
        description: "Category updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  // ───────────────────────────────────────────
  // Toggle Active
  // ───────────────────────────────────────────
  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleCategoryApi(id);

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );

      toast({
        title: "Success",
        description: `Category ${updated.isActive ? "activated" : "deactivated"
          }.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  return (
    < >
      <div className="space-y-6">

        {/* ───────── Header ───────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory Categories</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage item classifications for reporting and stock grouping
            </p>
          </div>

          <Button
            className="gold-gradient text-accent-foreground"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* ───────── Table ───────── */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-muted-foreground">
                Loading categories...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">
                        {cat.name}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {cat.description || "—"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            cat.isActive
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditName(cat.name);
                              setEditDescription(cat.description || "");
                              setEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggle(cat.id)}
                          >
                            {cat.isActive ? (
                              <PowerOff className="h-4 w-4 text-destructive" />
                            ) : (
                              <Power className="h-4 w-4 text-success" />
                            )}
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ───────── Create Dialog ───────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───────── Edit Dialog ───────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ >
  );
};

export default Categories;