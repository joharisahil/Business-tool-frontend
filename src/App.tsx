import { Toaster } from "@/components/ui/toaster";
//import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout"

import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import StockTransactions from "./pages/inventory/StockTransactions";
import StockAdjustments from "./pages/inventory/StockAdjustments";
import ExpiryMonitoring from "./pages/inventory/ExpiryMonitoring";
import PurchaseInvoices from "./pages/inventory/PurchaseInvoices";
import Vendors from "./pages/inventory/Vendors";
import Ledger from "./pages/inventory/GeneralLedger";
import AuditTrail from "./pages/inventory/AuditTrail";
import InventoryItems from "./pages/inventory/InventoryItems";
import CreateCategory from "./pages/inventory/CreateCategory";
import NotFound from "./pages/NotFound";
import GeneralLedger from "./pages/inventory/GeneralLedger";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      
      <BrowserRouter>
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<InventoryDashboard />} />
      <Route path="/inventory" element={<InventoryItems />} />
      <Route path="/invoices" element={<PurchaseInvoices />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/transactions" element={<StockTransactions />} />
      <Route path="/adjustments" element={<StockAdjustments />} />
      <Route path="/expiry" element={<ExpiryMonitoring />} />
      <Route path="/ledger" element={<GeneralLedger />} />
      <Route path="/audit" element={<AuditTrail />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
