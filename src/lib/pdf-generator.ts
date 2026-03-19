import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface TaxBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

interface BillItem {
  item_id: string;
  description: string;
  category: string;
  hsnSacCode?: string;
  quantity: number;
  unitPrice: number;
  saleUnitCode?: string;
  discount: number;
  taxableAmount: number;
  gstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

interface Bill {
  _id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerGSTIN?: string;
  items: BillItem[];
  taxBreakdown: TaxBreakdown;
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  invoiceState: string;
  paymentStatus: string;
  paidAmount: number;
  outstandingAmount: number;
  advanceAmount: number;
  paymentTerms: string;
  dueDate?: string | null;
  notes?: string;
}

interface CustomerInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
}

const COMPANY = {
  name: "YOUR BUSINESS NAME",
  address: "123 Business Park, Main Street, City - 400001",
  phone: "+91 98765 43210",
  email: "accounts@yourbusiness.com",
  gstin: "27AAAAA0000A1Z5",
  pan: "AAAAA0000A",
};

const C = {
  primary: [30, 41, 59] as [number, number, number],
  secondary: [51, 65, 85] as [number, number, number],
  accent: [14, 116, 144] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
  medium: [241, 245, 249] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export const generateCustomerBillsPDF = (
  customer: CustomerInfo,
  bills: Bill[],
  dateRange?: { start: string; end: string }
) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 14;
  const cw = pw - 2 * m;
  let y = 0;
  let page = 1;

  const footer = () => {
    const today = format(new Date(), "dd/MM/yyyy HH:mm");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(m, ph - 16, pw - m, ph - 16);
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${today}  |  Computer-generated document`, m, ph - 10);
    doc.text(`Page ${page}`, pw - m, ph - 10, { align: "right" });
  };

  const newPage = (title?: string) => {
    footer();
    doc.addPage();
    page++;
    y = 0;
    if (title) header(title);
  };

  const needsPage = (h: number, title?: string) => {
    if (y + h > ph - 22) { newPage(title || "CUSTOMER BILLS REPORT"); return true; }
    return false;
  };

  const header = (title: string) => {
    // Accent bar
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pw, 3.5, "F");

    // Company
    doc.setFontSize(16);
    doc.setTextColor(...C.primary);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY.name, m, 14);

    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY.address, m, 20);
    doc.text(`Tel: ${COMPANY.phone}  |  ${COMPANY.email}  |  GSTIN: ${COMPANY.gstin}  |  PAN: ${COMPANY.pan}`, m, 25);

    // Title
    doc.setFontSize(10);
    doc.setTextColor(...C.accent);
    doc.setFont("helvetica", "bold");
    doc.text(title, pw - m, 14, { align: "right" });

    if (dateRange?.start && dateRange?.end) {
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${format(new Date(dateRange.start), "dd MMM yyyy")} — ${format(new Date(dateRange.end), "dd MMM yyyy")}`,
        pw - m, 20, { align: "right" }
      );
    }

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.line(m, 29, pw - m, 29);
    y = 34;
  };

  // ─── Page 1 ───
  header("CUSTOMER BILLS REPORT");

  // ─── Customer Box ───
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", m, y);
  y += 2;

  // Dynamic height based on content
  const custLines: string[] = [];
  custLines.push(customer.name);
  if (customer.address) custLines.push(customer.address);
  const contact: string[] = [];
  if (customer.phone) contact.push(customer.phone);
  if (customer.email) contact.push(customer.email);
  if (contact.length) custLines.push(contact.join("  |  "));
  if (customer.gstin) custLines.push(`GSTIN: ${customer.gstin}`);

  const boxH = 8 + custLines.length * 5;
  doc.setDrawColor(...C.border);
  doc.setFillColor(...C.light);
  doc.roundedRect(m, y, cw, boxH, 1.5, 1.5, "FD");

  let cy = y + 7;
  custLines.forEach((line, i) => {
    if (i === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.primary);
    } else {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.secondary);
    }
    doc.text(line, m + 6, cy);
    cy += i === 0 ? 6 : 5;
  });
  y += boxH + 5;

  // ─── Summary Cards ───
  const totalAmount = bills.reduce((s, b) => s + b.grandTotal, 0);
  const totalPaid = bills.reduce((s, b) => s + b.paidAmount, 0);
  const totalPending = bills.reduce((s, b) => s + b.outstandingAmount, 0);
  const totalTax = bills.reduce((s, b) => s + (b.taxBreakdown?.totalTax || 0), 0);

  const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const cards = [
    { label: "INVOICES", value: bills.length.toString(), color: C.primary },
    { label: "TOTAL", value: fmt(totalAmount), color: C.accent },
    { label: "RECEIVED", value: fmt(totalPaid), color: C.success },
    { label: "PENDING", value: fmt(totalPending), color: totalPending > 0 ? C.danger : C.success },
  ];

  const gap = 3;
  const cardW = (cw - gap * 3) / 4;
  const cardH = 20;

  cards.forEach((card, i) => {
    const cx = m + i * (cardW + gap);

    doc.setDrawColor(...C.border);
    doc.setFillColor(...C.white);
    doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, "FD");

    // Top accent
    doc.setFillColor(...card.color);
    doc.rect(cx + 0.5, y, cardW - 1, 2, "F");

    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "bold");
    doc.text(card.label, cx + cardW / 2, y + 8, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(...card.color);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, cx + cardW / 2, y + 15, { align: "center" });
  });

  y += cardH + 6;

  // ─── Bills ───
  if (bills.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text("No bills found for this customer.", m, y);
  } else {
    bills.forEach((bill, idx) => {
      needsPage(75);

      // Invoice header bar
      doc.setFillColor(...C.primary);
      doc.roundedRect(m, y, cw, 9, 1, 1, "F");

      doc.setFontSize(8.5);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice #${bill.invoiceNumber}`, m + 4, y + 6);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(format(new Date(bill.createdAt), "dd MMM yyyy"), m + 75, y + 6);

      // Status badge
      const statusMap: Record<string, { bg: [number, number, number] }> = {
        PAID: { bg: C.success },
        PARTIAL: { bg: C.warning },
        UNPAID: { bg: C.danger },
        DRAFT: { bg: C.muted },
        POSTED: { bg: C.accent },
        CANCELLED: { bg: [139, 92, 246] },
      };
      const st = statusMap[bill.paymentStatus] || { bg: C.muted };
      const stLabel = bill.paymentStatus;
      const stW = doc.getTextWidth(stLabel) + 8;

      doc.setFillColor(...st.bg);
      doc.roundedRect(pw - m - stW - 3, y + 1.5, stW, 6, 1, 1, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.text(stLabel, pw - m - stW / 2 - 3, y + 5.7, { align: "center" });

      y += 12;

      // Items table
      const items = bill.items.map((it) => [
        it.description,
        `${it.quantity}${it.saleUnitCode ? " " + it.saleUnitCode : ""}`,
        `₹${it.unitPrice.toFixed(2)}`,
        it.hsnSacCode || "—",
        `${it.gstPercentage}%`,
        `₹${it.taxableAmount.toFixed(2)}`,
        `₹${(it.taxableAmount * it.gstPercentage / 100).toFixed(2)}`,
        `₹${it.totalAmount.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Description", "Qty", "Rate", "HSN/SAC", "GST", "Taxable", "Tax", "Amount"]],
        body: items,
        theme: "plain",
        styles: { lineWidth: 0.15, lineColor: C.border },
        headStyles: {
          fillColor: C.medium,
          textColor: C.secondary,
          fontSize: 7,
          fontStyle: "bold",
          cellPadding: 2,
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: C.text,
          cellPadding: 2,
        },
        alternateRowStyles: { fillColor: C.light },
        columnStyles: {
          0: { cellWidth: 42 },
          1: { halign: "center", cellWidth: 18 },
          2: { halign: "right", cellWidth: 22 },
          3: { halign: "center", cellWidth: 20 },
          4: { halign: "center", cellWidth: 14 },
          5: { halign: "right", cellWidth: 22 },
          6: { halign: "right", cellWidth: 18 },
          7: { halign: "right", cellWidth: 24, fontStyle: "bold" },
        },
        margin: { left: m, right: m },
      });

      y = (doc as any).lastAutoTable.finalY + 3;

      // Tax + Totals side by side using autoTable for clean alignment
      const halfW = (cw - 4) / 2;

      // Draw both boxes
      doc.setDrawColor(...C.border);
      doc.setFillColor(...C.light);
      doc.roundedRect(m, y, halfW, 28, 1, 1, "FD");
      doc.roundedRect(m + halfW + 4, y, halfW, 28, 1, 1, "FD");

      // Tax breakdown (left)
      doc.setFontSize(6.5);
      doc.setTextColor(...C.muted);
      doc.setFont("helvetica", "bold");
      doc.text("TAX BREAKDOWN", m + 4, y + 5);

      doc.setFontSize(7.5);
      doc.setTextColor(...C.secondary);
      const taxData = [
        ["CGST", bill.taxBreakdown?.cgst || 0],
        ["SGST", bill.taxBreakdown?.sgst || 0],
        ["IGST", bill.taxBreakdown?.igst || 0],
      ];
      let ty = y + 10;
      taxData.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.text(label as string, m + 4, ty);
        doc.text(`₹${(val as number).toFixed(2)}`, m + halfW - 4, ty, { align: "right" });
        ty += 4.5;
      });
      doc.setDrawColor(...C.border);
      doc.line(m + 4, ty - 1.5, m + halfW - 4, ty - 1.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.primary);
      doc.text("Total Tax", m + 4, ty + 2);
      doc.text(`₹${(bill.taxBreakdown?.totalTax || 0).toFixed(2)}`, m + halfW - 4, ty + 2, { align: "right" });

      // Invoice totals (right)
      const rx = m + halfW + 4;
      doc.setFontSize(6.5);
      doc.setTextColor(...C.muted);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE TOTALS", rx + 4, y + 5);

      doc.setFontSize(7.5);
      doc.setTextColor(...C.secondary);
      let ry = y + 10;

      doc.setFont("helvetica", "normal");
      doc.text("Subtotal", rx + 4, ry);
      doc.text(`₹${bill.subtotal.toFixed(2)}`, rx + halfW - 4, ry, { align: "right" });
      ry += 4.5;

      if (bill.totalDiscount > 0) {
        doc.text("Discount", rx + 4, ry);
        doc.setTextColor(...C.success);
        doc.text(`-₹${bill.totalDiscount.toFixed(2)}`, rx + halfW - 4, ry, { align: "right" });
        doc.setTextColor(...C.secondary);
        ry += 4.5;
      }

      doc.text("Tax", rx + 4, ry);
      doc.text(`₹${(bill.taxBreakdown?.totalTax || 0).toFixed(2)}`, rx + halfW - 4, ry, { align: "right" });
      ry += 4.5;

      doc.setDrawColor(...C.border);
      doc.line(rx + 4, ry - 1.5, rx + halfW - 4, ry - 1.5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.primary);
      doc.text("Grand Total", rx + 4, ry + 2.5);
      doc.text(`₹${bill.grandTotal.toFixed(2)}`, rx + halfW - 4, ry + 2.5, { align: "right" });

      y += 31;

      // Payment line
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      const pColor = bill.outstandingAmount > 0 ? C.danger : C.success;
      doc.setTextColor(...pColor);
      doc.text(
        `Paid: ₹${bill.paidAmount.toFixed(2)}${bill.outstandingAmount > 0 ? `  |  Outstanding: ₹${bill.outstandingAmount.toFixed(2)}` : "  —  Fully Settled"}`,
        m, y
      );
      y += 4;

      if (bill.notes) {
        doc.setFontSize(6.5);
        doc.setTextColor(...C.muted);
        doc.setFont("helvetica", "italic");
        doc.text(`Note: ${bill.notes}`, m, y + 1);
        y += 5;
      }

      if (idx < bills.length - 1) {
        y += 2;
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.2);
        doc.line(m, y, pw - m, y);
        y += 6;
      }
    });
  }

  // ─── Payment Summary ───
  if (bills.length > 0) {
    const paidBills = bills.filter(b => b.paidAmount > 0);
    if (paidBills.length > 0) {
      needsPage(45, "PAYMENT SUMMARY");

      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.setFont("helvetica", "bold");
      y += 4;
      doc.text("PAYMENT SUMMARY", m, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [["Invoice", "Date", "Amount", "Paid", "Status", "Balance"]],
        body: paidBills.map(b => [
          b.invoiceNumber,
          format(new Date(b.createdAt), "dd/MM/yyyy"),
          `₹${b.grandTotal.toFixed(2)}`,
          `₹${b.paidAmount.toFixed(2)}`,
          b.paymentStatus,
          `₹${b.outstandingAmount.toFixed(2)}`,
        ]),
        theme: "plain",
        styles: { lineWidth: 0.15, lineColor: C.border },
        headStyles: {
          fillColor: C.primary,
          textColor: C.white,
          fontSize: 7.5,
          fontStyle: "bold",
          cellPadding: 2,
        },
        bodyStyles: { fontSize: 7.5, textColor: C.text, cellPadding: 2 },
        alternateRowStyles: { fillColor: C.light },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: "bold" },
          1: { cellWidth: 25, halign: "center" },
          2: { halign: "right", cellWidth: 28 },
          3: { halign: "right", cellWidth: 28 },
          4: { cellWidth: 22, halign: "center" },
          5: { halign: "right", cellWidth: 28 },
        },
        margin: { left: m, right: m },
      });
    }
  }

  footer();

  const filename = `${customer.name.replace(/\s+/g, "-").toLowerCase()}_bills_${format(new Date(), "ddMMyyyy")}.pdf`;
  doc.save(filename);
};
