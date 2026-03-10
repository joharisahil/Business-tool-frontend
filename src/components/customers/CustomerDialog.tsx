import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import type { Customer, CustomerType , PaymentTerms } from "@/pages/inventory/types/inventory";
import { toast } from 'sonner';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSave: (data: Customer) => void;
}

const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'ONLINE', label: 'Online' },
];

const PAYMENT_TERMS_OPTIONS: { value: PaymentTerms; label: string }[] = [
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: 'NET_15', label: 'Net 15' },
  { value: 'NET_30', label: 'Net 30' },
  { value: 'NET_45', label: 'Net 45' },
  { value: 'NET_60', label: 'Net 60' },
];

const emptyForm = (): Omit<Customer, 'id' | 'createdAt'> => ({
  name: '',
  customerType: 'RETAIL',
  email: '',
  phone: '',
  address: '',
  gstin: '',
  companyName: '',
  creditLimit: 0,
  paymentTerms: 'IMMEDIATE',
  isActive: true,
  notes: '',
});

export function CustomerDialog({ open, onOpenChange, customer, onSave }: CustomerDialogProps) {
  const [form, setForm] = useState(emptyForm());
  const isEdit = !!customer;

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        customerType: customer.customerType,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        gstin: customer.gstin,
        companyName: customer.companyName,
        creditLimit: customer.creditLimit,
        paymentTerms: customer.paymentTerms,
        isActive: customer.isActive,
        notes: customer.notes,
      });
    } else {
      setForm(emptyForm());
    }
  }, [customer, open]);

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Customer name is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone number is required'); return; }
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      toast.error('Invalid GSTIN format'); return;
    }

    const saved: Customer = {
      id: customer?.id || `cust-${Date.now()}`,
      ...form,
      createdAt: customer?.createdAt || new Date().toISOString(),
    };
    onSave(saved);
    onOpenChange(false);
    toast.success(isEdit ? 'Customer updated' : 'Customer created');
  };

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const showCompanyFields = form.customerType === 'CORPORATE' || form.customerType === 'WHOLESALE' || form.customerType === 'DISTRIBUTOR';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Customer' : 'New Customer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name or business" />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.customerType} onValueChange={v => set('customerType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCompanyFields && (
            <div className="space-y-2">
              <Label>Company / Business Name</Label>
              <Input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Business name" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GSTIN</Label>
              <Input value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>PAN (auto from GSTIN)</Label>
              <Input value={form.gstin ? form.gstin.substring(2, 12) : ''} disabled className="font-mono bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Credit Limit (₹)</Label>
              <Input type="number" min={0} value={form.creditLimit} onChange={e => set('creditLimit', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select value={form.paymentTerms} onValueChange={v => set('paymentTerms', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." rows={2} maxLength={1000} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}