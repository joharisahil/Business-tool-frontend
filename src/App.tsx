import { Toaster } from "@/components/ui/toaster";
//import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute";

import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import StockTransactions from "./pages/inventory/StockTransactions";
import StockAdjustments from "./pages/inventory/StockAdjustments";
import ExpiryMonitoring from "./pages/inventory/ExpiryMonitoring";
import PurchaseInvoices from "./pages/inventory/PurchaseInvoices";
import SalesInvoices from "./pages/inventory/SalesInvoices";
import Vendors from "./pages/inventory/Vendors";
import Ledger from "./pages/inventory/GeneralLedger";
import AuditTrail from "./pages/inventory/AuditTrail";
import InventoryItems from "./pages/inventory/InventoryItems";
import CreateCategory from "./pages/inventory/CreateCategory";
import NotFound from "./pages/NotFound";
import GeneralLedger from "./pages/inventory/GeneralLedger";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "@/contexts/AuthContext";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      
      <BrowserRouter>
      <AuthProvider>
<Routes>

  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Root Redirect */}
  <Route path="/" element={<Navigate to="/login" replace />} />

  {/* Protected Layout Wrapper */}
  <Route
    element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    }
  >
    <Route path="/dashboard" element={<InventoryDashboard />} />
    <Route path="/inventory" element={<InventoryItems />} />
    <Route path="/invoices" element={<PurchaseInvoices />} />
    <Route path="/sales" element={<SalesInvoices />} />
    <Route path="/vendors" element={<Vendors />} />
    <Route path="/transactions" element={<StockTransactions />} />
    <Route path="/adjustments" element={<StockAdjustments />} />
    <Route path="/expiry" element={<ExpiryMonitoring />} />
    <Route path="/ledger" element={<GeneralLedger />} />
    <Route path="/audit" element={<AuditTrail />} />
    <Route path="/categories/create" element={<CreateCategory />} />
  </Route>

  {/* Fallback */}
  <Route path="*" element={<NotFound />} />

</Routes>
</AuthProvider>
</BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
