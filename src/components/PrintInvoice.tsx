import { forwardRef } from "react";
import type { SalesInvoice } from "@/pages/inventory/types/inventory";


interface PrintInvoiceProps {
  invoice: SalesInvoice;
}

const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(
  ({ invoice }, ref) => {
    return (
      <div ref={ref} className="print-area hidden print:block">
        <div style={{ fontFamily: "Arial, sans-serif", color: "#000" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "2px solid #333", paddingBottom: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Your Business Name</h1>
            <p style={{ fontSize: 11, margin: "4px 0 0", color: "#555" }}>
              123 Business Street, City, State – 000000 | GSTIN: 00XXXXX0000X0XX
            </p>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 12, letterSpacing: 2, textTransform: "uppercase" }}>
              Tax Invoice
            </h2>
          </div>

          {/* Invoice meta */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 13 }}>
            <div>
              <p style={{ margin: "2px 0" }}><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
              <p style={{ margin: "2px 0" }}><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "2px 0" }}><strong>Customer:</strong> {invoice.customerName}</p>
              {invoice.customerGSTIN && (
                <p style={{ margin: "2px 0" }}><strong>GSTIN:</strong> {invoice.customerGSTIN}</p>
              )}
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #333", padding: "6px 10px", background: "#f0f0f0", textAlign: "left" }}>#</th>
                <th style={{ border: "1px solid #333", padding: "6px 10px", background: "#f0f0f0", textAlign: "left" }}>Item</th>
                <th style={{ border: "1px solid #333", padding: "6px 10px", background: "#f0f0f0", textAlign: "right" }}>Qty</th>
                <th style={{ border: "1px solid #333", padding: "6px 10px", background: "#f0f0f0", textAlign: "right" }}>Rate (₹)</th>
                <th style={{ border: "1px solid #333", padding: "6px 10px", background: "#f0f0f0", textAlign: "right" }}>GST %</th>
                <th style={{ border: "1px solid #333", padding: "6px 10px", background: "#f0f0f0", textAlign: "right" }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #333", padding: "6px 10px" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #333", padding: "6px 10px" }}>{item.itemName}</td>
                  <td style={{ border: "1px solid #333", padding: "6px 10px", textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #333", padding: "6px 10px", textAlign: "right" }}>{item.unitPrice.toLocaleString("en-IN")}</td>
                  <td style={{ border: "1px solid #333", padding: "6px 10px", textAlign: "right" }}>{item.gstPercentage}%</td>
                  <td style={{ border: "1px solid #333", padding: "6px 10px", textAlign: "right" }}>{item.totalAmount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <div style={{ width: 280, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span>CGST</span>
                <span>₹{invoice.taxBreakdown.cgst.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span>SGST</span>
                <span>₹{invoice.taxBreakdown.sgst.toLocaleString("en-IN")}</span>
              </div>
              {invoice.taxBreakdown.igst > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span>IGST</span>
                  <span>₹{invoice.taxBreakdown.igst.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "2px solid #333", fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                <span>Grand Total</span>
                <span>₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span>Paid</span>
                <span>₹{invoice.paidAmount.toLocaleString("en-IN")}</span>
              </div>
              {invoice.outstandingAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: 600 }}>
                  <span>Outstanding</span>
                  <span>₹{invoice.outstandingAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #ccc", paddingTop: 12, marginTop: 24, textAlign: "center", fontSize: 12, color: "#666" }}>
            <p style={{ margin: 0 }}>Thank you for your business</p>
            <p style={{ margin: "4px 0 0", fontSize: 10 }}>This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintInvoice.displayName = "PrintInvoice";

export default PrintInvoice;
