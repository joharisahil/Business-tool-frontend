import type {
  InventoryCategory, InventoryItem, InventoryBatch, StockTransaction, Vendor,
  PurchaseInvoice, LedgerAccount, JournalEntry, CreditNote, AuditLogEntry, StockAdjustment
} from './types/inventory';

export const categories: InventoryCategory[] = [
  { id: 'cat-1', name: 'Linen & Bedding', description: 'Bed sheets, towels, pillow covers', itemCount: 8 },
  { id: 'cat-2', name: 'Toiletries', description: 'Soap, shampoo, dental kits', itemCount: 12 },
  { id: 'cat-3', name: 'Minibar', description: 'Beverages, snacks, spirits', itemCount: 15 },
  { id: 'cat-4', name: 'Housekeeping', description: 'Cleaning supplies, chemicals', itemCount: 10 },
  { id: 'cat-5', name: 'Kitchen Stock', description: 'Food items, ingredients, condiments', itemCount: 20 },
  { id: 'cat-6', name: 'Maintenance', description: 'Tools, bulbs, plumbing supplies', itemCount: 7 },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'item-1', sku: 'LIN-001', name: 'King Size Bed Sheet (White)', categoryId: 'cat-1', categoryName: 'Linen & Bedding', unit: 'Piece', costPrice: 850, sellingPrice: undefined, currentStock: 45, minimumStock: 20, isActive: true, isPerishable: false, createdBy: 'Admin', createdAt: '2025-01-15', updatedAt: '2025-02-10' },
  { id: 'item-2', sku: 'LIN-002', name: 'Bath Towel (Premium)', categoryId: 'cat-1', categoryName: 'Linen & Bedding', unit: 'Piece', costPrice: 320, currentStock: 8, minimumStock: 30, isActive: true, isPerishable: false, createdBy: 'Admin', createdAt: '2025-01-15', updatedAt: '2025-02-12' },
  { id: 'item-3', sku: 'TOI-001', name: 'Shampoo Sachet (30ml)', categoryId: 'cat-2', categoryName: 'Toiletries', unit: 'Pack of 100', costPrice: 450, currentStock: 12, minimumStock: 10, isActive: true, isPerishable: true, shelfLifeDays: 730, createdBy: 'Admin', createdAt: '2025-01-20', updatedAt: '2025-02-08' },
  { id: 'item-4', sku: 'TOI-002', name: 'Dental Kit', categoryId: 'cat-2', categoryName: 'Toiletries', unit: 'Pack of 50', costPrice: 375, currentStock: 5, minimumStock: 15, isActive: true, isPerishable: false, createdBy: 'Admin', createdAt: '2025-01-20', updatedAt: '2025-02-14' },
  { id: 'item-5', sku: 'MIN-001', name: 'Coca Cola 330ml', categoryId: 'cat-3', categoryName: 'Minibar', unit: 'Can', costPrice: 25, sellingPrice: 80, currentStock: 200, minimumStock: 50, isActive: true, isPerishable: true, shelfLifeDays: 365, createdBy: 'Admin', createdAt: '2025-01-10', updatedAt: '2025-02-01' },
  { id: 'item-6', sku: 'MIN-002', name: 'Premium Water 500ml', categoryId: 'cat-3', categoryName: 'Minibar', unit: 'Bottle', costPrice: 12, sellingPrice: 40, currentStock: 350, minimumStock: 100, isActive: true, isPerishable: true, shelfLifeDays: 545, createdBy: 'Admin', createdAt: '2025-01-10', updatedAt: '2025-02-05' },
  { id: 'item-7', sku: 'HSK-001', name: 'Floor Cleaner (5L)', categoryId: 'cat-4', categoryName: 'Housekeeping', unit: 'Can', costPrice: 280, currentStock: 3, minimumStock: 10, isActive: true, isPerishable: false, createdBy: 'Admin', createdAt: '2025-01-18', updatedAt: '2025-02-13' },
  { id: 'item-8', sku: 'KIT-001', name: 'Basmati Rice (25kg)', categoryId: 'cat-5', categoryName: 'Kitchen Stock', unit: 'Bag', costPrice: 1800, currentStock: 15, minimumStock: 5, isActive: true, isPerishable: true, shelfLifeDays: 365, createdBy: 'Admin', createdAt: '2025-01-12', updatedAt: '2025-02-09' },
  { id: 'item-9', sku: 'MNT-001', name: 'LED Bulb 9W', categoryId: 'cat-6', categoryName: 'Maintenance', unit: 'Piece', costPrice: 95, currentStock: 2, minimumStock: 20, isActive: true, isPerishable: false, createdBy: 'Admin', createdAt: '2025-01-25', updatedAt: '2025-02-11' },
  { id: 'item-10', sku: 'LIN-003', name: 'Pillow Cover (Standard)', categoryId: 'cat-1', categoryName: 'Linen & Bedding', unit: 'Piece', costPrice: 180, currentStock: 60, minimumStock: 25, isActive: true, isPerishable: false, createdBy: 'Admin', createdAt: '2025-01-15', updatedAt: '2025-02-10' },
];

export const inventoryBatches: InventoryBatch[] = [
  { id: 'batch-1', itemId: 'item-5', itemName: 'Coca Cola 330ml', batchNumber: 'CC-2025-001', expiryDate: '2026-02-13', receivedDate: '2025-02-13', receivedQuantity: 100, remainingQuantity: 100, unitCost: 25, invoiceId: 'inv-1', invoiceNumber: 'HOTEL-PUR-2025-0012', isExpired: false },
  { id: 'batch-2', itemId: 'item-6', itemName: 'Premium Water 500ml', batchNumber: 'PW-2025-001', expiryDate: '2026-08-13', receivedDate: '2025-02-13', receivedQuantity: 200, remainingQuantity: 200, unitCost: 12, invoiceId: 'inv-1', invoiceNumber: 'HOTEL-PUR-2025-0012', isExpired: false },
  { id: 'batch-3', itemId: 'item-8', itemName: 'Basmati Rice (25kg)', batchNumber: 'BR-2025-001', expiryDate: '2026-02-12', receivedDate: '2025-02-12', receivedQuantity: 10, remainingQuantity: 10, unitCost: 1800, invoiceId: 'inv-2', invoiceNumber: 'HOTEL-PUR-2025-0011', isExpired: false },
  { id: 'batch-4', itemId: 'item-3', itemName: 'Shampoo Sachet (30ml)', batchNumber: 'SH-2025-001', expiryDate: '2025-03-01', receivedDate: '2025-01-20', receivedQuantity: 50, remainingQuantity: 12, unitCost: 450, invoiceId: 'inv-5', invoiceNumber: 'HOTEL-PUR-2025-0014', isExpired: false },
  { id: 'batch-5', itemId: 'item-5', itemName: 'Coca Cola 330ml', batchNumber: 'CC-2024-OLD', expiryDate: '2025-01-31', receivedDate: '2024-07-01', receivedQuantity: 100, remainingQuantity: 5, unitCost: 23, invoiceId: 'inv-old', invoiceNumber: 'HOTEL-PUR-2024-0045', isExpired: true },
];

export const vendors: Vendor[] = [
  { id: 'ven-1', name: 'Supreme Textiles Pvt Ltd', contactPerson: 'Rajesh Sharma', email: 'rajesh@supremetextiles.in', phone: '+91 98765 43210', address: '45, Textile Market, Surat, Gujarat', gstin: '24AABCS1234F1Z5', panNumber: 'AABCS1234F', gstRegistered: true, isActive: true, totalPurchases: 245000, creditDays: 30, paymentTerms: 'NET_30', openingBalance: 0, bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100123456789', ifscCode: 'HDFC0001234', accountHolder: 'Supreme Textiles Pvt Ltd' }, createdAt: '2024-06-15' },
  { id: 'ven-2', name: 'CleanPro Supplies', contactPerson: 'Anita Desai', email: 'anita@cleanpro.in', phone: '+91 87654 32109', address: '12, Industrial Area, Pune, Maharashtra', gstin: '27AABCC5678G1Z3', panNumber: 'AABCC5678G', gstRegistered: true, isActive: true, totalPurchases: 89000, creditDays: 15, paymentTerms: 'NET_15', openingBalance: 0, createdAt: '2024-08-20' },
  { id: 'ven-3', name: 'FreshBev Distributors', contactPerson: 'Vikram Singh', email: 'vikram@freshbev.in', phone: '+91 76543 21098', address: '78, Beverage Lane, Delhi', gstin: '07AABCF9012H1Z1', panNumber: 'AABCF9012H', gstRegistered: true, isActive: true, totalPurchases: 156000, creditDays: 7, paymentTerms: 'NET_15', openingBalance: 5000, bankDetails: { bankName: 'ICICI Bank', accountNumber: '123456789012', ifscCode: 'ICIC0001234', accountHolder: 'FreshBev Distributors' }, createdAt: '2024-07-10' },
  { id: 'ven-4', name: 'Hotel Amenities India', contactPerson: 'Priya Patel', email: 'priya@hotelamenities.in', phone: '+91 65432 10987', address: '23, MG Road, Mumbai, Maharashtra', gstin: '27AABCH3456I1Z9', panNumber: 'AABCH3456I', gstRegistered: true, isActive: true, totalPurchases: 178000, creditDays: 45, paymentTerms: 'NET_45', openingBalance: 0, createdAt: '2024-05-25' },
  { id: 'ven-5', name: 'KitchenKraft Foods', contactPerson: 'Suresh Kumar', email: 'suresh@kitchenkraft.in', phone: '+91 54321 09876', address: '56, Food Park, Hyderabad, Telangana', gstin: '36AABCK7890J1Z7', panNumber: 'AABCK7890J', gstRegistered: false, isActive: false, totalPurchases: 67000, creditDays: 0, paymentTerms: 'IMMEDIATE', openingBalance: 0, createdAt: '2024-09-05' },
];

export const stockTransactions: StockTransaction[] = [
  { id: 'txn-1', itemId: 'item-2', itemName: 'Bath Towel (Premium)', itemSku: 'LIN-002', type: 'OUT', referenceType: 'ROOM_USAGE', quantity: 12, balanceAfter: 8, notes: 'Room 301, 302, 305 - Guest checkout', createdBy: 'Front Desk', createdAt: '2025-02-14T10:30:00' },
  { id: 'txn-2', itemId: 'item-7', itemName: 'Floor Cleaner (5L)', itemSku: 'HSK-001', type: 'OUT', referenceType: 'ROOM_USAGE', quantity: 2, balanceAfter: 3, notes: 'Daily housekeeping', createdBy: 'Housekeeping', createdAt: '2025-02-14T09:15:00' },
  { id: 'txn-3', itemId: 'item-5', itemName: 'Coca Cola 330ml', itemSku: 'MIN-001', type: 'IN', referenceType: 'PURCHASE', quantity: 100, balanceAfter: 200, notes: 'PO# HOTEL-PUR-2025-0012', batchNumber: 'CC-2025-001', createdBy: 'Admin', createdAt: '2025-02-13T14:00:00' },
  { id: 'txn-4', itemId: 'item-9', itemName: 'LED Bulb 9W', itemSku: 'MNT-001', type: 'OUT', referenceType: 'MANUAL', quantity: 3, balanceAfter: 2, notes: 'Lobby and corridor replacement', createdBy: 'Maintenance', createdAt: '2025-02-13T11:45:00' },
  { id: 'txn-5', itemId: 'item-4', itemName: 'Dental Kit', itemSku: 'TOI-002', type: 'OUT', referenceType: 'ROOM_USAGE', quantity: 10, balanceAfter: 5, notes: 'Room restocking', createdBy: 'Housekeeping', createdAt: '2025-02-12T16:20:00' },
  { id: 'txn-6', itemId: 'item-8', itemName: 'Basmati Rice (25kg)', itemSku: 'KIT-001', type: 'IN', referenceType: 'PURCHASE', quantity: 10, balanceAfter: 15, notes: 'PO# HOTEL-PUR-2025-0011', batchNumber: 'BR-2025-001', createdBy: 'Admin', createdAt: '2025-02-12T10:00:00' },
  { id: 'txn-7', itemId: 'item-1', itemName: 'King Size Bed Sheet (White)', itemSku: 'LIN-001', type: 'ADJUSTMENT', referenceType: 'WASTAGE', quantity: -5, balanceAfter: 45, notes: 'Damaged in laundry', reason: 'DAMAGED', createdBy: 'Admin', createdAt: '2025-02-11T15:30:00' },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: 'adj-1', itemId: 'item-1', itemName: 'King Size Bed Sheet (White)', itemSku: 'LIN-001', type: 'OUT', quantity: 5, reason: 'DAMAGED', notes: 'Damaged in laundry – hot water shrinkage', balanceBefore: 50, balanceAfter: 45, adjustedBy: 'Admin', adjustedAt: '2025-02-11T15:30:00' },
];

export const purchaseInvoices: PurchaseInvoice[] = [
  {
    id: 'inv-1', invoiceNumber: 'HOTEL-PUR-2025-0012', vendorId: 'ven-3', vendorName: 'FreshBev Distributors',
    items: [
      { id: 'ii-1', itemId: 'item-5', itemName: 'Coca Cola 330ml', quantity: 100, unitPrice: 25, gstPercentage: 18, gstAmount: 450, totalAmount: 2950, batchNumber: 'CC-2025-001', expiryDate: '2026-02-13', isPerishable: true },
      { id: 'ii-2', itemId: 'item-6', itemName: 'Premium Water 500ml', quantity: 200, unitPrice: 12, gstPercentage: 18, gstAmount: 432, totalAmount: 2832, batchNumber: 'PW-2025-001', expiryDate: '2026-08-13', isPerishable: true },
    ],
    subtotal: 4900, gstAmount: 882, taxBreakdown: { cgst: 441, sgst: 441, igst: 0, totalTax: 882 },
    grandTotal: 5782, paymentStatus: 'PAID', invoiceState: 'POSTED', paidAmount: 5782, outstandingAmount: 0,
    payments: [
      { id: 'pay-1', invoiceId: 'inv-1', amount: 5782, method: 'BANK_TRANSFER', reference: 'NEFT-20250213-001', paidAt: '2025-02-13T16:00:00', recordedBy: 'Admin', journalEntryId: 'je-2' }
    ],
    notes: 'Monthly beverage restock', createdBy: 'Admin', createdAt: '2025-02-13', updatedAt: '2025-02-13',
    approvedBy: 'Admin', approvedAt: '2025-02-13T10:00:00', postedBy: 'Admin', postedAt: '2025-02-13T12:00:00',
  },
  {
    id: 'inv-2', invoiceNumber: 'HOTEL-PUR-2025-0011', vendorId: 'ven-5', vendorName: 'KitchenKraft Foods',
    items: [
      { id: 'ii-3', itemId: 'item-8', itemName: 'Basmati Rice (25kg)', quantity: 10, unitPrice: 1800, gstPercentage: 5, gstAmount: 900, totalAmount: 18900, batchNumber: 'BR-2025-001', expiryDate: '2026-02-12', isPerishable: true },
    ],
    subtotal: 18000, gstAmount: 900, taxBreakdown: { cgst: 450, sgst: 450, igst: 0, totalTax: 900 },
    grandTotal: 18900, paymentStatus: 'UNPAID', invoiceState: 'POSTED', paidAmount: 0, outstandingAmount: 18900,
    payments: [],
    notes: 'Kitchen restock', createdBy: 'Admin', createdAt: '2025-02-12', updatedAt: '2025-02-12',
    approvedBy: 'Admin', approvedAt: '2025-02-12T09:00:00', postedBy: 'Admin', postedAt: '2025-02-12T09:30:00',
  },
  {
    id: 'inv-3', invoiceNumber: 'HOTEL-PUR-2025-0010', vendorId: 'ven-1', vendorName: 'Supreme Textiles Pvt Ltd',
    items: [
      { id: 'ii-4', itemId: 'item-1', itemName: 'King Size Bed Sheet (White)', quantity: 50, unitPrice: 850, gstPercentage: 12, gstAmount: 5100, totalAmount: 47600, isPerishable: false },
      { id: 'ii-5', itemId: 'item-2', itemName: 'Bath Towel (Premium)', quantity: 40, unitPrice: 320, gstPercentage: 12, gstAmount: 1536, totalAmount: 14336, isPerishable: false },
      { id: 'ii-6', itemId: 'item-10', itemName: 'Pillow Cover (Standard)', quantity: 30, unitPrice: 180, gstPercentage: 12, gstAmount: 648, totalAmount: 6048, isPerishable: false },
    ],
    subtotal: 60900, gstAmount: 7284, taxBreakdown: { cgst: 3642, sgst: 3642, igst: 0, totalTax: 7284 },
    grandTotal: 68184, paymentStatus: 'PARTIAL', invoiceState: 'POSTED', paidAmount: 40000, outstandingAmount: 28184,
    payments: [
      { id: 'pay-2', invoiceId: 'inv-3', amount: 40000, method: 'CHEQUE', reference: 'CHQ-445567', paidAt: '2025-02-10T14:00:00', recordedBy: 'Admin', journalEntryId: 'je-5' }
    ],
    notes: 'Quarterly linen order', createdBy: 'Admin', createdAt: '2025-02-05', updatedAt: '2025-02-10',
    approvedBy: 'Admin', approvedAt: '2025-02-05T11:00:00', postedBy: 'Admin', postedAt: '2025-02-05T14:00:00',
  },
  {
    id: 'inv-4', invoiceNumber: 'HOTEL-PUR-2025-0013', vendorId: 'ven-2', vendorName: 'CleanPro Supplies',
    items: [
      { id: 'ii-7', itemId: 'item-7', itemName: 'Floor Cleaner (5L)', quantity: 20, unitPrice: 280, gstPercentage: 18, gstAmount: 1008, totalAmount: 6608, isPerishable: false },
    ],
    subtotal: 5600, gstAmount: 1008, taxBreakdown: { cgst: 504, sgst: 504, igst: 0, totalTax: 1008 },
    grandTotal: 6608, paymentStatus: 'UNPAID', invoiceState: 'DRAFT', paidAmount: 0, outstandingAmount: 6608,
    payments: [],
    notes: 'Pending approval', createdBy: 'Accountant', createdAt: '2025-02-15', updatedAt: '2025-02-15',
  },
  {
    id: 'inv-5', invoiceNumber: 'HOTEL-PUR-2025-0014', vendorId: 'ven-4', vendorName: 'Hotel Amenities India',
    items: [
      { id: 'ii-8', itemId: 'item-3', itemName: 'Shampoo Sachet (30ml)', quantity: 50, unitPrice: 450, gstPercentage: 18, gstAmount: 4050, totalAmount: 26550, batchNumber: 'SH-2025-001', expiryDate: '2025-03-01', isPerishable: true },
      { id: 'ii-9', itemId: 'item-4', itemName: 'Dental Kit', quantity: 30, unitPrice: 375, gstPercentage: 18, gstAmount: 2025, totalAmount: 13275, isPerishable: false },
    ],
    subtotal: 33750, gstAmount: 6075, taxBreakdown: { cgst: 3037.5, sgst: 3037.5, igst: 0, totalTax: 6075 },
    grandTotal: 39825, paymentStatus: 'UNPAID', invoiceState: 'APPROVED', paidAmount: 0, outstandingAmount: 39825,
    payments: [],
    notes: 'Approved, awaiting posting', createdBy: 'Accountant', createdAt: '2025-02-14', updatedAt: '2025-02-15',
    approvedBy: 'Admin', approvedAt: '2025-02-15T09:00:00',
  },
];

export const ledgerAccounts: LedgerAccount[] = [
  { id: 'acc-1', code: '1100', name: 'Inventory – Linen & Bedding', type: 'ASSET', balance: 57850, isActive: true, description: 'Stock value of linen items' },
  { id: 'acc-2', code: '1101', name: 'Inventory – Toiletries', type: 'ASSET', balance: 7275, isActive: true, description: 'Stock value of guest toiletries' },
  { id: 'acc-3', code: '1102', name: 'Inventory – Minibar', type: 'ASSET', balance: 9200, isActive: true, description: 'Stock value of minibar items' },
  { id: 'acc-4', code: '1103', name: 'Inventory – Housekeeping', type: 'ASSET', balance: 840, isActive: true, description: 'Stock value of cleaning supplies' },
  { id: 'acc-5', code: '1104', name: 'Inventory – Kitchen Stock', type: 'ASSET', balance: 27000, isActive: true, description: 'Stock value of kitchen items' },
  { id: 'acc-6', code: '1105', name: 'Inventory – Maintenance', type: 'ASSET', balance: 190, isActive: true, description: 'Stock value of maintenance supplies' },
  { id: 'acc-7', code: '1200', name: 'Input CGST Receivable', type: 'ASSET', balance: 8074.5, isActive: true, description: 'Central GST input credit' },
  { id: 'acc-8', code: '1201', name: 'Input SGST Receivable', type: 'ASSET', balance: 8074.5, isActive: true, description: 'State GST input credit' },
  { id: 'acc-9', code: '1202', name: 'Input IGST Receivable', type: 'ASSET', balance: 0, isActive: true, description: 'Integrated GST input credit' },
  { id: 'acc-10', code: '2100', name: 'Accounts Payable – Vendors', type: 'LIABILITY', balance: 87709, isActive: true, description: 'Outstanding vendor payables' },
  { id: 'acc-11', code: '2101', name: 'AP – Supreme Textiles', type: 'LIABILITY', parentId: 'acc-10', balance: 28184, isActive: true, description: 'Payable to Supreme Textiles' },
  { id: 'acc-12', code: '2102', name: 'AP – KitchenKraft Foods', type: 'LIABILITY', parentId: 'acc-10', balance: 18900, isActive: true, description: 'Payable to KitchenKraft' },
  { id: 'acc-13', code: '2103', name: 'AP – CleanPro Supplies', type: 'LIABILITY', parentId: 'acc-10', balance: 6608, isActive: true, description: 'Payable to CleanPro' },
  { id: 'acc-14', code: '2104', name: 'AP – Hotel Amenities India', type: 'LIABILITY', parentId: 'acc-10', balance: 39825, isActive: true, description: 'Payable to Hotel Amenities' },
  { id: 'acc-15', code: '3100', name: 'Cash / Bank Account', type: 'ASSET', balance: 500000, isActive: true, description: 'Primary operating account' },
  { id: 'acc-16', code: '5100', name: 'Purchase Expense', type: 'EXPENSE', balance: 0, isActive: true, description: 'Cost of goods purchased' },
];

export const journalEntries: JournalEntry[] = [
  {
    id: 'je-1', entryNumber: 'JE-2025-0001', referenceType: 'PURCHASE_INVOICE', referenceId: 'inv-1', referenceNumber: 'HOTEL-PUR-2025-0012',
    lines: [
      { id: 'jel-1', accountId: 'acc-3', accountCode: '1102', accountName: 'Inventory – Minibar', entryType: 'DEBIT', amount: 4900, description: 'Minibar stock purchase' },
      { id: 'jel-2', accountId: 'acc-7', accountCode: '1200', accountName: 'Input CGST Receivable', entryType: 'DEBIT', amount: 441, description: 'CGST @ 9%' },
      { id: 'jel-3', accountId: 'acc-8', accountCode: '1201', accountName: 'Input SGST Receivable', entryType: 'DEBIT', amount: 441, description: 'SGST @ 9%' },
      { id: 'jel-4', accountId: 'acc-10', accountCode: '2100', accountName: 'Accounts Payable – Vendors', entryType: 'CREDIT', amount: 5782, description: 'Payable to FreshBev Distributors' },
    ],
    totalDebit: 5782, totalCredit: 5782, narration: 'Purchase of minibar items – HOTEL-PUR-2025-0012',
    createdBy: 'Admin', createdAt: '2025-02-13T12:00:00', isReversed: false,
  },
  {
    id: 'je-2', entryNumber: 'JE-2025-0002', referenceType: 'PAYMENT', referenceId: 'pay-1', referenceNumber: 'NEFT-20250213-001',
    lines: [
      { id: 'jel-5', accountId: 'acc-10', accountCode: '2100', accountName: 'Accounts Payable – Vendors', entryType: 'DEBIT', amount: 5782, description: 'Payment to FreshBev Distributors' },
      { id: 'jel-6', accountId: 'acc-15', accountCode: '3100', accountName: 'Cash / Bank Account', entryType: 'CREDIT', amount: 5782, description: 'Bank transfer – NEFT' },
    ],
    totalDebit: 5782, totalCredit: 5782, narration: 'Payment against HOTEL-PUR-2025-0012',
    createdBy: 'Admin', createdAt: '2025-02-13T16:00:00', isReversed: false,
  },
  {
    id: 'je-3', entryNumber: 'JE-2025-0003', referenceType: 'PURCHASE_INVOICE', referenceId: 'inv-2', referenceNumber: 'HOTEL-PUR-2025-0011',
    lines: [
      { id: 'jel-7', accountId: 'acc-5', accountCode: '1104', accountName: 'Inventory – Kitchen Stock', entryType: 'DEBIT', amount: 18000, description: 'Kitchen stock purchase' },
      { id: 'jel-8', accountId: 'acc-7', accountCode: '1200', accountName: 'Input CGST Receivable', entryType: 'DEBIT', amount: 450, description: 'CGST @ 2.5%' },
      { id: 'jel-9', accountId: 'acc-8', accountCode: '1201', accountName: 'Input SGST Receivable', entryType: 'DEBIT', amount: 450, description: 'SGST @ 2.5%' },
      { id: 'jel-10', accountId: 'acc-12', accountCode: '2102', accountName: 'AP – KitchenKraft Foods', entryType: 'CREDIT', amount: 18900, description: 'Payable to KitchenKraft' },
    ],
    totalDebit: 18900, totalCredit: 18900, narration: 'Purchase of kitchen supplies – HOTEL-PUR-2025-0011',
    createdBy: 'Admin', createdAt: '2025-02-12T09:30:00', isReversed: false,
  },
  {
    id: 'je-4', entryNumber: 'JE-2025-0004', referenceType: 'PURCHASE_INVOICE', referenceId: 'inv-3', referenceNumber: 'HOTEL-PUR-2025-0010',
    lines: [
      { id: 'jel-11', accountId: 'acc-1', accountCode: '1100', accountName: 'Inventory – Linen & Bedding', entryType: 'DEBIT', amount: 60900, description: 'Linen purchase' },
      { id: 'jel-12', accountId: 'acc-7', accountCode: '1200', accountName: 'Input CGST Receivable', entryType: 'DEBIT', amount: 3642, description: 'CGST @ 6%' },
      { id: 'jel-13', accountId: 'acc-8', accountCode: '1201', accountName: 'Input SGST Receivable', entryType: 'DEBIT', amount: 3642, description: 'SGST @ 6%' },
      { id: 'jel-14', accountId: 'acc-11', accountCode: '2101', accountName: 'AP – Supreme Textiles', entryType: 'CREDIT', amount: 68184, description: 'Payable to Supreme Textiles' },
    ],
    totalDebit: 68184, totalCredit: 68184, narration: 'Quarterly linen order – HOTEL-PUR-2025-0010',
    createdBy: 'Admin', createdAt: '2025-02-05T14:00:00', isReversed: false,
  },
  {
    id: 'je-5', entryNumber: 'JE-2025-0005', referenceType: 'PAYMENT', referenceId: 'pay-2', referenceNumber: 'CHQ-445567',
    lines: [
      { id: 'jel-15', accountId: 'acc-11', accountCode: '2101', accountName: 'AP – Supreme Textiles', entryType: 'DEBIT', amount: 40000, description: 'Part payment to Supreme Textiles' },
      { id: 'jel-16', accountId: 'acc-15', accountCode: '3100', accountName: 'Cash / Bank Account', entryType: 'CREDIT', amount: 40000, description: 'Cheque payment' },
    ],
    totalDebit: 40000, totalCredit: 40000, narration: 'Part payment against HOTEL-PUR-2025-0010 – Cheque CHQ-445567',
    createdBy: 'Admin', createdAt: '2025-02-10T14:00:00', isReversed: false,
  },
];

export const creditNotes: CreditNote[] = [];

export const auditLog: AuditLogEntry[] = [
  { id: 'aud-1', entityType: 'PURCHASE_INVOICE', entityId: 'inv-1', action: 'CREATED', description: 'Purchase invoice HOTEL-PUR-2025-0012 created', performedBy: 'Admin', performedAt: '2025-02-13T08:00:00', role: 'Admin' },
  { id: 'aud-2', entityType: 'PURCHASE_INVOICE', entityId: 'inv-1', action: 'APPROVED', description: 'Invoice HOTEL-PUR-2025-0012 approved', beforeValue: 'DRAFT', afterValue: 'APPROVED', performedBy: 'Admin', performedAt: '2025-02-13T10:00:00', role: 'Admin' },
  { id: 'aud-3', entityType: 'PURCHASE_INVOICE', entityId: 'inv-1', action: 'POSTED', description: 'Invoice HOTEL-PUR-2025-0012 posted – stock updated, ledger entries created', beforeValue: 'APPROVED', afterValue: 'POSTED', performedBy: 'Admin', performedAt: '2025-02-13T12:00:00', role: 'Admin' },
  { id: 'aud-4', entityType: 'JOURNAL_ENTRY', entityId: 'je-1', action: 'CREATED', description: 'Journal entry JE-2025-0001 created for invoice HOTEL-PUR-2025-0012', performedBy: 'Admin', performedAt: '2025-02-13T12:00:00', role: 'Admin' },
  { id: 'aud-5', entityType: 'STOCK_TRANSACTION', entityId: 'txn-3', action: 'STOCK_IN', description: 'Stock IN: 100x Coca Cola 330ml (Batch: CC-2025-001) from HOTEL-PUR-2025-0012', performedBy: 'Admin', performedAt: '2025-02-13T12:00:00', role: 'Admin' },
  { id: 'aud-6', entityType: 'PAYMENT', entityId: 'pay-1', action: 'PAYMENT_RECORDED', description: 'Payment of ₹5,782 recorded against HOTEL-PUR-2025-0012 via BANK_TRANSFER', performedBy: 'Admin', performedAt: '2025-02-13T16:00:00', role: 'Admin' },
  { id: 'aud-7', entityType: 'JOURNAL_ENTRY', entityId: 'je-2', action: 'CREATED', description: 'Journal entry JE-2025-0002 created for payment NEFT-20250213-001', performedBy: 'Admin', performedAt: '2025-02-13T16:00:00', role: 'Admin' },
  { id: 'aud-8', entityType: 'PURCHASE_INVOICE', entityId: 'inv-3', action: 'CREATED', description: 'Purchase invoice HOTEL-PUR-2025-0010 created', performedBy: 'Admin', performedAt: '2025-02-05T09:00:00', role: 'Admin' },
  { id: 'aud-9', entityType: 'PURCHASE_INVOICE', entityId: 'inv-3', action: 'POSTED', description: 'Invoice HOTEL-PUR-2025-0010 posted', beforeValue: 'APPROVED', afterValue: 'POSTED', performedBy: 'Admin', performedAt: '2025-02-05T14:00:00', role: 'Admin' },
  { id: 'aud-10', entityType: 'PAYMENT', entityId: 'pay-2', action: 'PAYMENT_RECORDED', description: 'Part payment of ₹40,000 recorded against HOTEL-PUR-2025-0010 via CHEQUE', performedBy: 'Admin', performedAt: '2025-02-10T14:00:00', role: 'Admin' },
  { id: 'aud-11', entityType: 'PURCHASE_INVOICE', entityId: 'inv-4', action: 'CREATED', description: 'Purchase invoice HOTEL-PUR-2025-0013 created (Draft)', performedBy: 'Accountant', performedAt: '2025-02-15T08:00:00', role: 'Accountant' },
  { id: 'aud-12', entityType: 'PURCHASE_INVOICE', entityId: 'inv-5', action: 'CREATED', description: 'Purchase invoice HOTEL-PUR-2025-0014 created', performedBy: 'Accountant', performedAt: '2025-02-14T10:00:00', role: 'Accountant' },
  { id: 'aud-13', entityType: 'PURCHASE_INVOICE', entityId: 'inv-5', action: 'APPROVED', description: 'Invoice HOTEL-PUR-2025-0014 approved', beforeValue: 'DRAFT', afterValue: 'APPROVED', performedBy: 'Admin', performedAt: '2025-02-15T09:00:00', role: 'Admin' },
  { id: 'aud-14', entityType: 'STOCK_ADJUSTMENT', entityId: 'adj-1', action: 'ADJUSTED', description: 'Stock OUT adjustment: -5x King Size Bed Sheet (White) – Reason: DAMAGED', beforeValue: '50', afterValue: '45', performedBy: 'Admin', performedAt: '2025-02-11T15:30:00', role: 'Admin' },
];

// Derived helpers
export const getLowStockItems = () => inventoryItems.filter(item => item.currentStock <= item.minimumStock);
export const getTotalStockValue = () => inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);
export const getPendingInvoiceCount = () => purchaseInvoices.filter(inv => inv.paymentStatus !== 'PAID').length;
export const getExpiringBatches = (daysAhead = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  return inventoryBatches.filter(b => !b.isExpired && new Date(b.expiryDate) <= cutoff && b.remainingQuantity > 0);
};
export const getExpiredBatches = () => inventoryBatches.filter(b => b.isExpired && b.remainingQuantity > 0);
export const getTotalOutstanding = () => purchaseInvoices.filter(inv => inv.invoiceState === 'POSTED').reduce((sum, inv) => sum + inv.outstandingAmount, 0);
