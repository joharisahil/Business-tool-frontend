import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Plus, Pencil, Power, PowerOff, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  toggleCategoryApi,
} from "@/api/inventoryApi";
import type { InventoryCategory } from "./types/inventory";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

// API Response type
interface CategoriesApiResponse {
  success: boolean;
  data: InventoryCategory[];
  total: number;
  page: number;
  pages: number;
}

const Categories = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search and filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const debouncedSearch = useDebounce(search, 300);

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // ───────────────────────────────────────────
  // Load Categories with Pagination
  // ───────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit,
        };
        
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== "ALL") params.isActive = statusFilter === "ACTIVE";
        
        const response = await getCategoriesApi(params);
        
        // Handle different response formats
        if (response && Array.isArray(response)) {
          // If response is an array (old format)
          setCategories(response);
          setTotalItems(response.length);
          setTotalPages(Math.ceil(response.length / limit));
        } else if (response && response.data && Array.isArray(response.data)) {
          // If response has data property (new format with pagination)
          setCategories(response.data);
          setTotalItems(response.total || response.data.length);
          setTotalPages(response.pages || Math.ceil((response.total || response.data.length) / limit));
        } else {
          setCategories([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (error) {
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
  }, [page, limit, debouncedSearch, statusFilter]);

  // ───────────────────────────────────────────
  // Filter categories (if client-side filtering needed)
  // ───────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    let filtered = categories;
    
    // Client-side search filter (if API doesn't support search)
    if (search && !debouncedSearch) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          (cat.description && cat.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Client-side status filter (if API doesn't support status filter)
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((cat) =>
        statusFilter === "ACTIVE" ? cat.isActive : !cat.isActive
      );
    }
    
    return filtered;
  }, [categories, search, statusFilter, debouncedSearch]);

  // Update pagination for client-side filtered data
  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredCategories.slice(start, end);
  }, [filteredCategories, page, limit]);

  const clientSideTotalPages = Math.ceil(filteredCategories.length / limit);
  const clientSideTotalItems = filteredCategories.length;

  // Determine if we're using server-side or client-side pagination
  const usingServerSide = !!(categories.length > 0 && totalPages > 1);
  const displayCategories = usingServerSide ? categories : paginatedCategories;
  const displayTotalPages = usingServerSide ? totalPages : clientSideTotalPages;
  const displayTotalItems = usingServerSide ? totalItems : clientSideTotalItems;

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

      // Refresh categories or update state based on pagination mode
      if (usingServerSide) {
        // Refresh from API to get updated pagination
        const response = await getCategoriesApi({ page, limit, search: debouncedSearch });
        if (response && response.data) {
          setCategories(response.data);
          setTotalItems(response.total);
          setTotalPages(response.pages);
        }
      } else {
        setCategories((prev) => [created, ...prev]);
      }

      setCreateOpen(false);
      setName("");
      setDescription("");

      toast({
        title: "Success",
        description: "Category created successfully.",
      });
      
      // Reset to first page
      setPage(1);
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

      if (usingServerSide) {
        // Refresh from API to get updated data
        const response = await getCategoriesApi({ page, limit, search: debouncedSearch });
        if (response && response.data) {
          setCategories(response.data);
        }
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      }

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

      if (usingServerSide) {
        // Refresh from API to get updated data
        const response = await getCategoriesApi({ page, limit, search: debouncedSearch });
        if (response && response.data) {
          setCategories(response.data);
        }
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        );
      }

      toast({
        title: "Success",
        description: `Category ${updated.isActive ? "activated" : "deactivated"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <>
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
            className="gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </div>

        {/* ───────── Search & Filter ───────── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ───────── Table ───────── */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading categories...</p>
                </div>
              </div>
            ) : displayCategories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {search || statusFilter !== "ALL" 
                  ? "No categories match your filters" 
                  : "No categories found. Click 'New Category' to create one."}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayCategories.map((cat) => (
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

                {/* ───────── Pagination ───────── */}
                {displayTotalPages > 0 && (
                  <DataTablePagination
                    currentPage={page}
                    totalPages={displayTotalPages}
                    pageSize={limit}
                    totalItems={displayTotalItems}
                    onPageChange={(newPage: number) => setPage(newPage)}
                    onPageSizeChange={(newSize: number) => {
                      setLimit(newSize);
                      setPage(1);
                    }}
                  />
                )}
              </>
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
    </>
  );
};

export default Categories;
// import { Card, CardContent,  } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Plus, Pencil, Power, PowerOff } from "lucide-react";
// import { useEffect, useState } from "react";
// import {
//   getCategoriesApi,
//   createCategoryApi,
//   updateCategoryApi,
//   toggleCategoryApi,
// } from "@/api/inventoryApi";
// import type { InventoryCategory } from "./types/inventory";
// import { useToast } from "@/hooks/use-toast";



// const Categories = () => {
//   const { toast } = useToast();

//   const [categories, setCategories] = useState<InventoryCategory []>([]);
//   const [loading, setLoading] = useState(true);

//   // Create state
//   const [createOpen, setCreateOpen] = useState(false);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");

//   // Edit state
//   const [editOpen, setEditOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<InventoryCategory  | null>(null);
//   const [editName, setEditName] = useState("");
//   const [editDescription, setEditDescription] = useState("");

//   // ───────────────────────────────────────────
//   // Load Categories
//   // ───────────────────────────────────────────
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const data = await getCategoriesApi();
//         setCategories(data);
//       } catch {
//         toast({
//           title: "Error",
//           description: "Failed to load categories.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // ───────────────────────────────────────────
//   // Create Category
//   // ───────────────────────────────────────────
//   const handleCreate = async () => {
//     if (!name.trim()) {
//       toast({
//         title: "Validation Error",
//         description: "Category name is required.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const created = await createCategoryApi({
//         name: name.trim(),
//         description: description.trim(),
//       });

//       setCategories((prev) => [created, ...prev]);

//       setCreateOpen(false);
//       setName("");
//       setDescription("");

//       toast({
//         title: "Success",
//         description: "Category created successfully.",
//       });
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to create category.",
//         variant: "destructive",
//       });
//     }
//   };

//   // ───────────────────────────────────────────
//   // Update Category
//   // ───────────────────────────────────────────
//   const handleUpdate = async () => {
//     if (!editingCategory) return;

//     try {
//       const updated = await updateCategoryApi(editingCategory.id, {
//         name: editName,
//         description: editDescription,
//       });

//       setCategories((prev) =>
//         prev.map((c) => (c.id === updated.id ? updated : c))
//       );

//       setEditOpen(false);
//       toast({
//         title: "Updated",
//         description: "Category updated successfully.",
//       });
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to update category.",
//         variant: "destructive",
//       });
//     }
//   };

//   // ───────────────────────────────────────────
//   // Toggle Active
//   // ───────────────────────────────────────────
//   const handleToggle = async (id: string) => {
//     try {
//       const updated = await toggleCategoryApi(id);

//       setCategories((prev) =>
//         prev.map((c) => (c.id === id ? updated : c))
//       );

//       toast({
//         title: "Success",
//         description: `Category ${updated.isActive ? "activated" : "deactivated"
//           }.`,
//       });
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to update category.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     < >
//       <div className="space-y-6">

//         {/* ───────── Header ───────── */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold">Inventory Categories</h1>
//             <p className="text-muted-foreground text-sm mt-1">
//               Manage item classifications for reporting and stock grouping
//             </p>
//           </div>

//           <Button
//             className="gold-gradient text-accent-foreground"
//             onClick={() => setCreateOpen(true)}
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             New Category
//           </Button>
//         </div>

//         {/* ───────── Table ───────── */}
//         <Card>
//           <CardContent className="p-0">
//             {loading ? (
//               <div className="p-6 text-muted-foreground">
//                 Loading categories...
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Description</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">
//                       Actions
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {categories.map((cat) => (
//                     <TableRow key={cat.id}>
//                       <TableCell className="font-medium">
//                         {cat.name}
//                       </TableCell>

//                       <TableCell className="text-muted-foreground">
//                         {cat.description || "—"}
//                       </TableCell>

//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={
//                             cat.isActive
//                               ? "bg-success/10 text-success border-success/20"
//                               : "bg-muted text-muted-foreground"
//                           }
//                         >
//                           {cat.isActive ? "Active" : "Inactive"}
//                         </Badge>
//                       </TableCell>

//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">

//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => {
//                               setEditingCategory(cat);
//                               setEditName(cat.name);
//                               setEditDescription(cat.description || "");
//                               setEditOpen(true);
//                             }}
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </Button>

//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => handleToggle(cat.id)}
//                           >
//                             {cat.isActive ? (
//                               <PowerOff className="h-4 w-4 text-destructive" />
//                             ) : (
//                               <Power className="h-4 w-4 text-success" />
//                             )}
//                           </Button>

//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* ───────── Create Dialog ───────── */}
//       <Dialog open={createOpen} onOpenChange={setCreateOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Create Category</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <Input
//               placeholder="Category name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <Textarea
//               placeholder="Optional description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreateOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleCreate}>
//               Create Category
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* ───────── Edit Dialog ───────── */}
//       <Dialog open={editOpen} onOpenChange={setEditOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Category</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <Input
//               value={editName}
//               onChange={(e) => setEditName(e.target.value)}
//             />
//             <Textarea
//               value={editDescription}
//               onChange={(e) => setEditDescription(e.target.value)}
//             />
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleUpdate}>
//               Save Changes
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </ >
//   );
// };

// export default Categories;