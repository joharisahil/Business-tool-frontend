/**
 * Print utility — opens a styled print window with invoice/report HTML.
 */

interface PrintOptions {
  title: string;
  content: string;
  companyName?: string;
}

export function printDocument({ title, content, companyName = 'VYAPAR ERP' }: PrintOptions) {
  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 24px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 20px; }
    .company { font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .company-sub { font-size: 11px; color: #666; margin-top: 2px; }
    .doc-title { font-size: 16px; font-weight: 700; text-align: right; }
    .doc-number { font-family: monospace; font-size: 13px; color: #666; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .meta-block label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; display: block; }
    .meta-block p { font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f0f0f5; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; border-bottom: 2px solid #ddd; }
    td { padding: 8px 10px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { margin-left: auto; width: 280px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .totals .row.bold { font-weight: 700; border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; }
    .badge-posted { background: #d1fae5; color: #065f46; }
    .badge-draft { background: #f3f4f6; color: #6b7280; }
    .badge-approved { background: #dbeafe; color: #1e40af; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .badge-unpaid { background: #fee2e2; color: #991b1b; }
    .badge-partial { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #888; text-align: center; }
    .notes { margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 6px; font-size: 12px; }
    .gst-box { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin: 12px 0; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">${companyName}</div>
      <div class="company-sub">Inventory · Billing · Finance</div>
    </div>
    <div class="doc-title">${title}</div>
  </div>
  ${content}
  <div class="footer">
    Generated on ${new Date().toLocaleString('en-IN')} · ${companyName} · Computer Generated Document
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
  win.document.close();
}

/** Generate sales invoice receipt HTML */
export function generateSalesInvoiceReceipt(inv: {
  invoiceNumber: string;
  customerName: string;
  customerGSTIN?: string;
  createdAt: string;
  invoiceState: string;
  paymentStatus: string;
  paymentTerms: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    gstPercentage: number;
    discount?: number;
    totalAmount: number;
    saleUnitCode?: string;
    baseQty?: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  taxBreakdown: { cgst: number; sgst: number; igst: number; totalTax: number };
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  notes?: string;
}): string {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const stateClass = inv.invoiceState === 'POSTED' ? 'badge-posted' : inv.invoiceState === 'APPROVED' ? 'badge-approved' : 'badge-draft';
  const payClass = inv.paymentStatus === 'PAID' ? 'badge-paid' : inv.paymentStatus === 'PARTIAL' ? 'badge-partial' : 'badge-unpaid';

  return `
    <div class="meta-grid">
      <div class="meta-block"><label>Invoice Number</label><p class="doc-number">${inv.invoiceNumber}</p></div>
      <div class="meta-block"><label>Date</label><p>${new Date(inv.createdAt).toLocaleDateString('en-IN')}</p></div>
      <div class="meta-block"><label>Customer</label><p>${inv.customerName}</p>${inv.customerGSTIN ? `<span style="font-size:11px;color:#666;font-family:monospace">GSTIN: ${inv.customerGSTIN}</span>` : ''}</div>
      <div class="meta-block"><label>Status</label><p><span class="badge ${stateClass}">${inv.invoiceState}</span> <span class="badge ${payClass}">${inv.paymentStatus}</span></p></div>
      <div class="meta-block"><label>Payment Terms</label><p>${inv.paymentTerms}</p></div>
    </div>

    <table>
      <thead><tr>
        <th>#</th><th>Description</th><th>Unit</th><th class="text-right">Qty</th>
        <th class="text-right">Price</th><th class="text-right">GST%</th>
        <th class="text-right">Discount</th><th class="text-right">Total</th>
      </tr></thead>
      <tbody>
        ${inv.items.map((item, i) => `<tr>
          <td>${i + 1}</td>
          <td>${item.description}${item.baseQty && item.saleUnitCode ? ` <span style="font-size:10px;color:#888">(${item.baseQty} base)</span>` : ''}</td>
          <td>${item.saleUnitCode || '—'}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${fmt(item.unitPrice)}</td>
          <td class="text-right">${item.gstPercentage}%</td>
          <td class="text-right">${fmt(item.discount || 0)}</td>
          <td class="text-right" style="font-weight:600">${fmt(item.totalAmount)}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
      ${inv.totalDiscount > 0 ? `<div class="row"><span>Discount</span><span>-${fmt(inv.totalDiscount)}</span></div>` : ''}
      <div class="row"><span>CGST</span><span>${fmt(inv.taxBreakdown.cgst)}</span></div>
      <div class="row"><span>SGST</span><span>${fmt(inv.taxBreakdown.sgst)}</span></div>
      ${inv.taxBreakdown.igst > 0 ? `<div class="row"><span>IGST</span><span>${fmt(inv.taxBreakdown.igst)}</span></div>` : ''}
      <div class="row bold"><span>Grand Total</span><span>${fmt(inv.grandTotal)}</span></div>
      <div class="row"><span>Paid</span><span style="color:#059669">${fmt(inv.paidAmount)}</span></div>
      <div class="row"><span>Outstanding</span><span style="color:#dc2626;font-weight:700">${fmt(inv.outstandingAmount)}</span></div>
    </div>

    ${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
  `;
}

/** Generate purchase invoice receipt HTML */
export function generatePurchaseInvoiceReceipt(inv: {
  invoiceNumber: string;
  vendorName: string;
  vendorGSTIN?: string;
  createdAt: string;
  invoiceState: string;
  paymentStatus: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    gstPercentage: number;
    totalAmount: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  subtotal: number;
  gstAmount: number;
  taxBreakdown: { cgst: number; sgst: number; igst: number };
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  notes?: string;
}): string {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const stateClass = inv.invoiceState === 'POSTED' ? 'badge-posted' : inv.invoiceState === 'APPROVED' ? 'badge-approved' : 'badge-draft';
  const payClass = inv.paymentStatus === 'PAID' ? 'badge-paid' : inv.paymentStatus === 'PARTIAL' ? 'badge-partial' : 'badge-unpaid';

  return `
    <div class="meta-grid">
      <div class="meta-block"><label>Invoice Number</label><p class="doc-number">${inv.invoiceNumber}</p></div>
      <div class="meta-block"><label>Date</label><p>${new Date(inv.createdAt).toLocaleDateString('en-IN')}</p></div>
      <div class="meta-block"><label>Vendor</label><p>${inv.vendorName}</p>${inv.vendorGSTIN ? `<span style="font-size:11px;color:#666;font-family:monospace">GSTIN: ${inv.vendorGSTIN}</span>` : ''}</div>
      <div class="meta-block"><label>Status</label><p><span class="badge ${stateClass}">${inv.invoiceState}</span> <span class="badge ${payClass}">${inv.paymentStatus}</span></p></div>
    </div>

    <table>
      <thead><tr>
        <th>#</th><th>Item</th><th class="text-right">Qty</th>
        <th class="text-right">Price</th><th class="text-right">GST%</th>
        <th class="text-right">Total</th><th>Batch</th><th>Expiry</th>
      </tr></thead>
      <tbody>
        ${inv.items.map((item, i) => `<tr>
          <td>${i + 1}</td>
          <td>${item.itemName}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${fmt(item.unitPrice)}</td>
          <td class="text-right">${item.gstPercentage}%</td>
          <td class="text-right" style="font-weight:600">${fmt(item.totalAmount)}</td>
          <td>${item.batchNumber || '—'}</td>
          <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
      <div class="row"><span>CGST</span><span>${fmt(inv.taxBreakdown.cgst)}</span></div>
      <div class="row"><span>SGST</span><span>${fmt(inv.taxBreakdown.sgst)}</span></div>
      ${inv.taxBreakdown.igst > 0 ? `<div class="row"><span>IGST</span><span>${fmt(inv.taxBreakdown.igst)}</span></div>` : ''}
      <div class="row bold"><span>Grand Total</span><span>${fmt(inv.grandTotal)}</span></div>
      <div class="row"><span>Paid</span><span style="color:#059669">${fmt(inv.paidAmount)}</span></div>
      <div class="row"><span>Outstanding</span><span style="color:#dc2626;font-weight:700">${fmt(inv.outstandingAmount)}</span></div>
    </div>

    ${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
  `;
}

/** Generate GST report HTML for print/export */
export function generateGSTReportPrint(data: {
  fromDate?: string;
  toDate?: string;
  invoiceRows: Array<{
    invoiceNumber: string;
    date: string;
    customerName: string;
    gstin: string;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    grandTotal: number;
    type: string;
  }>;
  totals: { taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number; grandTotal: number };
  rateWise: Array<{ rate: number; count: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number }>;
}): string {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const period = data.fromDate || data.toDate
    ? `${data.fromDate || 'Start'} to ${data.toDate || 'Present'}`
    : 'All Time';

  return `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:11px;color:#666">Period: ${period}</div>
    </div>

    <div class="gst-box" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center">
      <div><div style="font-size:10px;color:#888">TAXABLE</div><div style="font-size:16px;font-weight:700">${fmt(data.totals.taxableValue)}</div></div>
      <div><div style="font-size:10px;color:#888">CGST</div><div style="font-size:16px;font-weight:700;color:#2563eb">${fmt(data.totals.cgst)}</div></div>
      <div><div style="font-size:10px;color:#888">SGST</div><div style="font-size:16px;font-weight:700;color:#2563eb">${fmt(data.totals.sgst)}</div></div>
      <div><div style="font-size:10px;color:#888">IGST</div><div style="font-size:16px;font-weight:700;color:#d97706">${fmt(data.totals.igst)}</div></div>
      <div><div style="font-size:10px;color:#888">TOTAL TAX</div><div style="font-size:16px;font-weight:700;color:#059669">${fmt(data.totals.totalTax)}</div></div>
    </div>

    <h3 style="font-size:14px;margin:20px 0 8px">Invoice-wise Tax Breakdown</h3>
    <table>
      <thead><tr>
        <th>Invoice #</th><th>Date</th><th>Customer</th><th class="text-center">Type</th>
        <th class="text-right">Taxable</th><th class="text-right">CGST</th>
        <th class="text-right">SGST</th><th class="text-right">Total</th>
      </tr></thead>
      <tbody>
        ${data.invoiceRows.map(r => `<tr>
          <td style="font-family:monospace;font-size:11px">${r.invoiceNumber}</td>
          <td>${new Date(r.date).toLocaleDateString('en-IN')}</td>
          <td>${r.customerName}${r.gstin ? `<br><span style="font-size:10px;color:#666;font-family:monospace">${r.gstin}</span>` : ''}</td>
          <td class="text-center"><span class="badge ${r.type === 'B2B' ? 'badge-approved' : 'badge-draft'}">${r.type}</span></td>
          <td class="text-right">${fmt(r.taxableValue)}</td>
          <td class="text-right">${fmt(r.cgst)}</td>
          <td class="text-right">${fmt(r.sgst)}</td>
          <td class="text-right" style="font-weight:600">${fmt(r.grandTotal)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr style="font-weight:700;border-top:2px solid #1a1a2e">
        <td colspan="4" class="text-right">Total</td>
        <td class="text-right">${fmt(data.totals.taxableValue)}</td>
        <td class="text-right">${fmt(data.totals.cgst)}</td>
        <td class="text-right">${fmt(data.totals.sgst)}</td>
        <td class="text-right">${fmt(data.totals.grandTotal)}</td>
      </tr></tfoot>
    </table>

    ${data.rateWise.length > 0 ? `
    <h3 style="font-size:14px;margin:20px 0 8px">Rate-wise Summary</h3>
    <table>
      <thead><tr>
        <th>GST Rate</th><th class="text-right">Items</th><th class="text-right">Taxable</th>
        <th class="text-right">CGST</th><th class="text-right">SGST</th><th class="text-right">Total Tax</th>
      </tr></thead>
      <tbody>
        ${data.rateWise.map(r => `<tr>
          <td>${r.rate}%</td>
          <td class="text-right">${r.count}</td>
          <td class="text-right">${fmt(r.taxableValue)}</td>
          <td class="text-right">${fmt(r.cgst)}</td>
          <td class="text-right">${fmt(r.sgst)}</td>
          <td class="text-right" style="font-weight:600">${fmt(r.totalTax)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}
  `;
}