import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerDialog } from "@/components/customers/CustomerDialog";

import {
  UserPlus,
  Search,
  Building2,
  User,
  ShoppingBag,
  Globe,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Truck,
} from "lucide-react";

import { useState } from "react";
import type { Customer } from "@/pages/inventory/types/inventory";
import { toast } from "sonner";

import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  toggleCustomerApi,
} from "@/api/inventoryApi";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const typeIcon: Record<string, any> = {
  RETAIL: ShoppingBag,
  WHOLESALE: Building2,
  DISTRIBUTOR: Truck,
  CORPORATE: Building2,
  ONLINE: Globe,
};

const typeColor: Record<string, string> = {
  RETAIL: "bg-muted text-muted-foreground",
  WHOLESALE: "bg-accent/10 text-accent-foreground border-accent/20",
  DISTRIBUTOR: "bg-info/10 text-info border-info/20",
  CORPORATE: "bg-success/10 text-success border-success/20",
  ONLINE: "bg-warning/10 text-warning border-warning/20",
};

const Customers = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const queryClient = useQueryClient();

const { data: customerList = [], isLoading } = useQuery<Customer[]>({
  queryKey: ["customers"],
  queryFn: getCustomersApi,
});
  

  // FILTER
  const filtered = customerList.filter((c) => {
  const matchSearch =
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.companyName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search);

  const matchType = typeFilter === "ALL" || c.customerType === typeFilter;

  return matchSearch && matchType;
});
  // CREATE
  const createMutation = useMutation({
    mutationFn: createCustomerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created");
    },
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => updateCustomerApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated");
    },
  });

const handleSave = (data: Customer) => {
  if (editCustomer) {
    updateMutation.mutate({
      id: editCustomer.id,
      payload: data,
    });
  } else {
    createMutation.mutate(data);
  }
};

  // TOGGLE ACTIVE
  const toggleMutation = useMutation({
    mutationFn: toggleCustomerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

 const openEdit = (c: Customer) => {
  console.log("EDIT CUSTOMER", c);
  setEditCustomer(c);
  setDialogOpen(true);
};

  const openCreate = () => {
    setEditCustomer(null);
    setDialogOpen(true);
  };

  // STATS
  const stats = {
    total: customerList.length,
    active: customerList.filter((c) => c.isActive).length,
    wholesale: customerList.filter(
      (c) => c.customerType === "WHOLESALE" || c.customerType === "CORPORATE"
    ).length,
    withCredit: customerList.filter((c) => c.creditLimit > 0).length,
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage retail, wholesale, and corporate customers
            </p>
          </div>

          <Button className="gap-2" onClick={openCreate}>
            <UserPlus className="h-4 w-4" /> Add Customer
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Wholesale / Corporate", value: stats.wholesale },
            { label: "With Credit Limit", value: stats.withCredit },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="RETAIL">Retail</SelectItem>
              <SelectItem value="WHOLESALE">Wholesale</SelectItem>
              <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
              <SelectItem value="CORPORATE">Corporate</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">Credit Limit</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filtered.map((c) => {
                    const Icon = typeIcon[c.customerType] || User;

                    return (
                      <TableRow key={c._id}>
                        <TableCell>
                          <p className="font-medium text-sm">{c.name}</p>
                          {c.companyName && (
                            <p className="text-xs text-muted-foreground">
                              {c.companyName}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] gap-1 ${
                              typeColor[c.customerType] || ""
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {c.customerType}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <p className="text-sm">{c.phone}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {c.gstin || "—"}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {c.creditLimit > 0
                            ? `₹${c.creditLimit.toLocaleString("en-IN")}`
                            : "—"}
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {c.paymentTerms}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              c.isActive
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(c)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggle((c.id || c._id)!)}
                            >
                              {c.isActive ? (
                                <ToggleRight className="h-4 w-4 text-success" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editCustomer}
        onSave={handleSave}
      />
    </>
  );
};

export default Customers;