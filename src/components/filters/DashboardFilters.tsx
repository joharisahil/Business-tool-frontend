import { useState } from "react";
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/pages/inventory/types/dashboard";

interface DashboardFiltersProps {
  startDate?: Date;
  endDate?: Date;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
  customerSearch: string;
  onCustomerSearchChange: (val: string) => void;
  paymentStatus: PaymentStatus | "";
  onPaymentStatusChange: (val: PaymentStatus | "") => void;
}

export function DashboardFilters({
  startDate,
  endDate,
  onDateChange,
  customerSearch,
  onCustomerSearchChange,
  paymentStatus,
  onPaymentStatusChange,
}: DashboardFiltersProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const quickFilter = (getter: () => { start: Date; end: Date }) => {
    const { start, end } = getter();
    onDateChange(start, end);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Quick filters */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            quickFilter(() => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }))
          }
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            quickFilter(() => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfDay(new Date()) }))
          }
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            quickFilter(() => ({ start: startOfMonth(new Date()), end: endOfDay(new Date()) }))
          }
        >
          This Month
        </Button>
        {(startDate || endDate) && (
          <Button variant="ghost" size="sm" onClick={() => onDateChange(undefined, undefined)}>
            Clear
          </Button>
        )}
      </div>

      {/* Date pickers */}
      <div className="flex gap-2">
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("w-[140px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {startDate ? format(startDate, "MMM dd, yy") : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(d) => { onDateChange(d, endDate); setStartOpen(false); }}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("w-[140px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {endDate ? format(endDate, "MMM dd, yy") : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(d) => { onDateChange(startDate, d); setEndOpen(false); }}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Customer search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) => onCustomerSearchChange(e.target.value)}
          className="h-9 w-[200px] pl-8 text-sm"
        />
      </div>

      {/* Payment status */}
      <Select value={paymentStatus} onValueChange={(v) => onPaymentStatusChange(v as PaymentStatus | "")}>
        <SelectTrigger className="h-9 w-[150px] text-sm">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
