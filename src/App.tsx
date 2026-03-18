import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";

// Inventory Pages
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import InventoryItems from "./pages/inventory/InventoryItems";
import PurchaseInvoices from "./pages/inventory/PurchaseInvoices";
import Vendors from "./pages/inventory/Vendors";
import StockTransactions from "./pages/inventory/StockTransactions";
import StockAdjustments from "./pages/inventory/StockAdjustments";
import ExpiryMonitoring from "./pages/inventory/ExpiryMonitoring";
import GeneralLedger from "./pages/inventory/GeneralLedger";
import AuditTrail from "./pages/inventory/AuditTrail";
import CreateCategory from "./pages/inventory/CreateCategory";
import Dashboard from "./pages/inventory/Dashboard";

// Sales Pages
import Customers from "./pages/inventory/Customers";
import SalesInvoices from "./pages/inventory/SalesInvoices";
import SalesPayments from "./pages/inventory/SalesPayments";
import SalesReports from "./pages/inventory/SalesReports";
import GSTReports from "./pages/inventory/GSTReports";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";

// Other
import NotFound from "./pages/NotFound";

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

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >

              {/* Dashboard */}
              <Route path="/dashboard" element={<InventoryDashboard />} />

              {/* SALES */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales" element={<SalesInvoices />} />
              <Route path="/sales/payments" element={<SalesPayments />} />
              <Route path="/sales/reports" element={<SalesReports />} />
              <Route path="/sales/gst" element={<GSTReports />} />
              <Route path="/sales/dashboard" element={<Dashboard />} />
              

              {/* INVENTORY */}
              <Route path="/inventory" element={<InventoryItems />} />
              <Route path="/transactions" element={<StockTransactions />} />
              <Route path="/adjustments" element={<StockAdjustments />} />
              <Route path="/expiry" element={<ExpiryMonitoring />} />
              <Route path="/categories/create" element={<CreateCategory />} />

              {/* PROCUREMENT */}
              <Route path="/invoices" element={<PurchaseInvoices />} />
              <Route path="/vendors" element={<Vendors />} />

              {/* FINANCE */}
              <Route path="/ledger" element={<GeneralLedger />} />
              <Route path="/audit" element={<AuditTrail />} />

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