import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard, Package, FileText, Users, ArrowLeftRight,
  Hotel, ChevronLeft, ChevronRight, BookOpen, Shield, SlidersHorizontal, CalendarX2,UserCheck,Receipt,CreditCard,BarChart3,IndianRupee
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-dropdown-menu';

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },

  {
    label: "Sales & Billing",
    items: [
      { to: "/customers", icon: UserCheck, label: "Customers" },
      { to: "/sales", icon: Receipt, label: "Sales Invoices" },
      { to: "/sales/payments", icon: CreditCard, label: "Sales Payments" },
      { to: "/sales/reports", icon: BarChart3, label: "Sales Reports" },
      { to: "/sales/gst", icon: IndianRupee, label: "GST Reports" },
    ],
  },

  {
    label: "Inventory",
    items: [
      { to: "/inventory", icon: Package, label: "Inventory Items" },
      { to: "/transactions", icon: ArrowLeftRight, label: "Stock Transactions" },
      { to: "/adjustments", icon: SlidersHorizontal, label: "Stock Adjustments" },
      { to: "/expiry", icon: CalendarX2, label: "Expiry Monitoring" },
      { to: "/categories/create", icon: CalendarX2, label: "Create Category" },
    ],
  },

  {
    label: "Procurement",
    items: [
      { to: "/invoices", icon: FileText, label: "Purchase Invoices" },
      { to: "/vendors", icon: Users, label: "Vendors" },
    ],
  },

  {
    label: "Finance",
    items: [
      { to: "/ledger", icon: BookOpen, label: "General Ledger" },
      { to: "/audit", icon: Shield, label: "Audit Trail" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
  <aside
    className={cn(
      "bg-zinc-900 text-zinc-100 flex flex-col border-r border-zinc-800 transition-all duration-300 relative",
      collapsed ? "w-[68px]" : "w-[260px]"
    )}
  >
    {/* Header */}
    <div className="flex items-center gap-3 px-5 py-6 border-b border-zinc-800">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-black">
        <Hotel className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div>
          <h1 className="text-sm font-bold tracking-wide">
            JamBills
          </h1>
          <p className="text-[11px] text-zinc-400">
            Inventory & Finance
          </p>
        </div>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
      {navGroups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-1">
              {group.label}
            </p>
          )}

          <div className="space-y-1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                activeClassName="bg-zinc-800 text-white font-medium"
              >
                <item.icon className="h-[18px] w-[18px]" />
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>

    {/* Collapse Toggle */}
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-sm hover:bg-zinc-700 transition-colors"
    >
      {collapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronLeft className="h-3 w-3" />
      )}
    </button>

    {/* Footer */}
    <div className="px-5 py-4 border-t border-zinc-800">
      {!collapsed && (
        <p className="text-[10px] text-zinc-500">
          v2.0 · Enterprise ERP
        </p>
      )}
    </div>
  </aside>
);
}

