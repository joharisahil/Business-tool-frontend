import { Layout as AppLayout } from '@/components/layout/Layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit2, Power, Building2, CreditCard as CardIcon, BookOpen, Phone, Mail, MapPin } from 'lucide-react';
import { useState,useEffect } from 'react';
import {
  getVendorsApi,
  createVendorApi,
  updateVendorApi,
  toggleVendorApi,
  getVendorLedgerApi,
} from '@/api/inventoryApi';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Vendor, PaymentTerms } from './types/inventory';

const paymentTermsLabel: Record<PaymentTerms, string> = {
  IMMEDIATE: 'Immediate', NET_15: 'Net 15 Days', NET_30: 'Net 30 Days', NET_45: 'Net 45 Days', NET_60: 'Net 60 Days',
};

const emptyForm = {
  name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', panNumber: '',
  gstRegistered: true, creditDays: '30', paymentTerms: 'NET_30' as PaymentTerms,
  openingBalance: '', bankName: '', accountNumber: '', ifscCode: '', accountHolder: '',
};

const VendorLedgerView = ({
  vendor,
  onClose,
}: {
  vendor: Vendor;
  onClose: () => void;
}) => {
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const data = await getVendorLedgerApi(vendor.id);
        setLedgerData(data);
      } catch (err) {
        console.error("Failed to fetch vendor ledger", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [vendor.id]);

  const invoices = ledgerData?.invoices || [];
  const totalOutstanding = ledgerData?.totalOutstanding || 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Vendor Ledger – {vendor.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Loading ledger...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Total Purchases",
                  value: `₹${vendor.totalPurchases.toLocaleString("en-IN")}`,
                  cls: "",
                },
                {
                  label: "Outstanding",
                  value: `₹${totalOutstanding.toLocaleString("en-IN")}`,
                  cls: "text-destructive",
                },
                {
                  label: "Credit Days",
                  value: `${vendor.creditDays} days`,
                  cls: "",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border p-3 bg-muted/20 text-center"
                >
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${s.cls}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Invoice Table */}
            <div>
              <p className="text-sm font-semibold mb-2">Invoice History</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Invoice #
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        Paid
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        Outstanding
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">
                        State
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2 font-mono text-xs">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          ₹{inv.grandTotal.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 text-right text-success">
                          ₹{inv.paidAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 text-right text-destructive font-medium">
                          {inv.outstandingAmount > 0
                            ? `₹${inv.outstandingAmount.toLocaleString(
                                "en-IN"
                              )}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {inv.invoiceState}
                          </Badge>
                        </td>
                      </tr>
                    ))}

                    {invoices.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-muted-foreground text-xs"
                        >
                          No invoices found for this vendor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bank Details */}
            {vendor.bankDetails && (
              <div>
                <p className="text-sm font-semibold mb-2">
                  Bank Details
                </p>
                <div className="rounded-lg border p-3 bg-muted/10 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bank</span>
                    <p className="font-medium">
                      {vendor.bankDetails.bankName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Account No.
                    </span>
                    <p className="font-mono font-medium">
                      {vendor.bankDetails.accountNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IFSC</span>
                    <p className="font-mono font-medium">
                      {vendor.bankDetails.ifscCode}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      A/c Holder
                    </span>
                    <p className="font-medium">
                      {vendor.bankDetails.accountHolder}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Vendors = () => {
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [ledgerVendor, setLedgerVendor] = useState<Vendor | null>(null);
  const [toggleVendor, setToggleVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();
  useEffect(() => {
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await getVendorsApi();
      setVendorList(data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  fetchVendors();
}, []);

  const openAdd = () => { setEditVendor(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (v: Vendor) => {
    setEditVendor(v);
    setForm({
      name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, address: v.address,
      gstin: v.gstin, panNumber: v.panNumber || '', gstRegistered: v.gstRegistered,
      creditDays: String(v.creditDays), paymentTerms: v.paymentTerms, openingBalance: String(v.openingBalance),
      bankName: v.bankDetails?.bankName || '', accountNumber: v.bankDetails?.accountNumber || '',
      ifscCode: v.bankDetails?.ifscCode || '', accountHolder: v.bankDetails?.accountHolder || '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
  if (!form.name || !form.contactPerson || !form.email) {
    toast({
      title: 'Validation Error',
      description: 'Name, contact person and email are required.',
      variant: 'destructive'
    });
    return;
  }

  try {
    const payload = {
      name: form.name,
      contactPerson: form.contactPerson,
      email: form.email,
      phone: form.phone,
      address: form.address,
      gstin: form.gstin,
      panNumber: form.panNumber,
      gstRegistered: form.gstRegistered,
      creditDays: parseInt(form.creditDays) || 0,
      paymentTerms: form.paymentTerms,
      openingBalance: parseFloat(form.openingBalance) || 0,
      bankDetails: form.bankName ? {
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        accountHolder: form.accountHolder,
      } : undefined,
    };

    if (editVendor) {
      const updated = await updateVendorApi(editVendor.id, payload);
      setVendorList(prev => prev.map(v => v.id === updated.id ? updated : v));
      toast({ title: 'Vendor Updated', description: `${updated.name} has been updated.` });
    } else {
      const created = await createVendorApi(payload);
      setVendorList(prev => [created, ...prev]);
      toast({ title: 'Vendor Added', description: `${created.name} has been added.` });
    }

    setOpen(false);

  } catch (err) {
    toast({ title: 'Error', description: 'Failed to save vendor.', variant: 'destructive' });
  }
};
  const handleToggle = async () => {
  if (!toggleVendor) return;

  try {
    const updated = await toggleVendorApi(toggleVendor.id);
    setVendorList(prev => prev.map(v => v.id === updated.id ? updated : v));

    toast({
      title: `Vendor ${updated.isActive ? 'Activated' : 'Deactivated'}`,
      description: `${updated.name} status updated.`,
    });

    setToggleVendor(null);

  } catch (err) {
    toast({ title: 'Error', description: 'Failed to update vendor status.', variant: 'destructive' });
  }
};

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vendors</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage supplier contacts, payment terms, and vendor ledger</p>
          </div>
          <Button className="gold-gradient text-accent-foreground font-medium" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />Add Vendor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorList.map(vendor => (
            <Card key={vendor.id} className={`hover:shadow-md transition-shadow animate-fade-in ${!vendor.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-semibold text-sm truncate">{vendor.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{vendor.contactPerson}</p>
                  </div>
                  <Badge variant="outline" className={vendor.isActive ? 'bg-success/10 text-success border-success/20 text-xs shrink-0' : 'bg-muted text-muted-foreground text-xs shrink-0'}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{vendor.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{vendor.phone}</p>
                  <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3 w-3 shrink-0" />{vendor.address}</p>
                  <p className="font-mono">GSTIN: {vendor.gstin}</p>
                  {vendor.panNumber && <p className="font-mono">PAN: {vendor.panNumber}</p>}
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{paymentTermsLabel[vendor.paymentTerms]}</Badge>
                  {vendor.gstRegistered && <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">GST Registered</Badge>}
                  {vendor.creditDays > 0 && <Badge variant="outline" className="text-[10px]">{vendor.creditDays}d Credit</Badge>}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Purchases</span>
                  <span className="text-sm font-semibold">₹{vendor.totalPurchases.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setLedgerVendor(vendor)}>
                    <BookOpen className="h-3 w-3 mr-1" />Ledger
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(vendor)}><Edit2 className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setToggleVendor(vendor)}>
                    <Power className={`h-3 w-3 ${vendor.isActive ? 'text-destructive' : 'text-success'}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {ledgerVendor && <VendorLedgerView vendor={ledgerVendor} onClose={() => setLedgerVendor(null)} />}

      {/* Add/Edit Vendor Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="financial">Financial & Tax</TabsTrigger>
              <TabsTrigger value="bank">Bank Details</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2"><Label>Company Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Supreme Textiles Pvt Ltd" /></div>
              <div className="space-y-2"><Label>Contact Person *</Label><Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Rajesh Sharma" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@email.com" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" /></div>
            </TabsContent>
            <TabsContent value="financial" className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div><Label className="text-sm font-medium">GST Registered</Label><p className="text-xs text-muted-foreground">Vendor has a valid GSTIN</p></div>
                <Switch checked={form.gstRegistered} onCheckedChange={v => setForm(f => ({ ...f, gstRegistered: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>GSTIN</Label><Input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="22AAAAA0000A1Z5" className="font-mono" disabled={!form.gstRegistered} /></div>
                <div className="space-y-2"><Label>PAN Number</Label><Input value={form.panNumber} onChange={e => setForm(f => ({ ...f, panNumber: e.target.value }))} placeholder="AAAAA0000A" className="font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v as PaymentTerms }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(paymentTermsLabel) as [PaymentTerms, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Credit Days</Label><Input type="number" value={form.creditDays} onChange={e => setForm(f => ({ ...f, creditDays: e.target.value }))} placeholder="30" /></div>
              </div>
              <div className="space-y-2"><Label>Opening Balance (₹)</Label><Input type="number" value={form.openingBalance} onChange={e => setForm(f => ({ ...f, openingBalance: e.target.value }))} placeholder="0" /></div>
            </TabsContent>
            <TabsContent value="bank" className="space-y-4">
              <p className="text-xs text-muted-foreground">Optional – used for payment processing and reconciliation.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Bank Name</Label><Input value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="HDFC Bank" /></div>
                <div className="space-y-2"><Label>Account Number</Label><Input value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="50100123456789" className="font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>IFSC Code</Label><Input value={form.ifscCode} onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} placeholder="HDFC0001234" className="font-mono" /></div>
                <div className="space-y-2"><Label>Account Holder</Label><Input value={form.accountHolder} onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))} placeholder="Company Name" /></div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="gold-gradient text-accent-foreground">{editVendor ? 'Update Vendor' : 'Add Vendor'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toggleVendor} onOpenChange={() => setToggleVendor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{toggleVendor?.isActive ? 'Deactivate Vendor' : 'Activate Vendor'}?</AlertDialogTitle>
            <AlertDialogDescription>{toggleVendor?.isActive ? `"${toggleVendor?.name}" will be excluded from new purchase orders.` : `"${toggleVendor?.name}" will be re-enabled for purchase orders.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} className={toggleVendor?.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>{toggleVendor?.isActive ? 'Deactivate' : 'Activate'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Vendors;
