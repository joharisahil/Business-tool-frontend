import type { UnitMaster } from '@/pages/inventory/types/inventory';

export const unitsMockData: UnitMaster[] = [
  // ── Base measurement units ──
  { id: 'unit-1', name: 'Kilogram', shortCode: 'KG', category: 'MEASUREMENT', baseUnitId: null, conversionFactor: 1, decimalPrecision: 3, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-2', name: 'Gram', shortCode: 'G', category: 'MEASUREMENT', baseUnitId: 'unit-1', baseUnitName: 'Kilogram', baseUnitCode: 'KG', conversionFactor: 0.001, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-3', name: 'Litre', shortCode: 'L', category: 'MEASUREMENT', baseUnitId: null, conversionFactor: 1, decimalPrecision: 3, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-4', name: 'Millilitre', shortCode: 'ML', category: 'MEASUREMENT', baseUnitId: 'unit-3', baseUnitName: 'Litre', baseUnitCode: 'L', conversionFactor: 0.001, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-5', name: 'Meter', shortCode: 'MTR', category: 'MEASUREMENT', baseUnitId: null, conversionFactor: 1, decimalPrecision: 2, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-6', name: 'Feet', shortCode: 'FT', category: 'MEASUREMENT', baseUnitId: 'unit-5', baseUnitName: 'Meter', baseUnitCode: 'MTR', conversionFactor: 0.3048, decimalPrecision: 2, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-7', name: 'Centimetre', shortCode: 'CM', category: 'MEASUREMENT', baseUnitId: 'unit-5', baseUnitName: 'Meter', baseUnitCode: 'MTR', conversionFactor: 0.01, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-8', name: 'Inch', shortCode: 'IN', category: 'MEASUREMENT', baseUnitId: 'unit-5', baseUnitName: 'Meter', baseUnitCode: 'MTR', conversionFactor: 0.0254, decimalPrecision: 2, isActive: true, createdAt: '2025-01-01' },

  // ── Packaging / counting ──
  { id: 'unit-9', name: 'Piece', shortCode: 'PCS', category: 'COUNTING', baseUnitId: null, conversionFactor: 1, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-10', name: 'Dozen', shortCode: 'DZN', category: 'COUNTING', baseUnitId: 'unit-9', baseUnitName: 'Piece', baseUnitCode: 'PCS', conversionFactor: 12, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-11', name: 'Box', shortCode: 'BOX', category: 'PACKAGING', baseUnitId: 'unit-9', baseUnitName: 'Piece', baseUnitCode: 'PCS', conversionFactor: 20, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-12', name: 'Pack', shortCode: 'PACK', category: 'PACKAGING', baseUnitId: 'unit-9', baseUnitName: 'Piece', baseUnitCode: 'PCS', conversionFactor: 5, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-13', name: 'Bottle', shortCode: 'BTL', category: 'COUNTING', baseUnitId: null, conversionFactor: 1, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-14', name: 'Can', shortCode: 'CAN', category: 'COUNTING', baseUnitId: null, conversionFactor: 1, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-15', name: 'Bag', shortCode: 'BAG', category: 'PACKAGING', baseUnitId: 'unit-1', baseUnitName: 'Kilogram', baseUnitCode: 'KG', conversionFactor: 25, decimalPrecision: 0, isActive: true, createdAt: '2025-01-01' },
  { id: 'unit-16', name: 'Quintal', shortCode: 'QTL', category: 'MEASUREMENT', baseUnitId: 'unit-1', baseUnitName: 'Kilogram', baseUnitCode: 'KG', conversionFactor: 100, decimalPrecision: 2, isActive: true, createdAt: '2025-01-01' },
];