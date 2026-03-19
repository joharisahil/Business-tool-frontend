import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerBills } from "@/hooks/use-customer-bills";
import { generateCustomerBillsPDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfYear } from "date-fns";

interface CustomerBillsPDFButtonProps {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export function CustomerBillsPDFButton({
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
}: CustomerBillsPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ STATE DRIVEN RANGE (IMPORTANT)
  const [range, setRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const { toast } = useToast();

  // ✅ Hook now reacts to range
  const { data, isFetching } = useCustomerBills({
    customerId,
    startDate: range.startDate,
    endDate: range.endDate,
  });

  // ✅ Generate PDF AFTER data is fetched
  useEffect(() => {
    if (!isGenerating) return;
    if (isFetching) return;

    if (!data?.invoices || data.invoices.length === 0) {
      toast({
        title: "No Bills Found",
        description: "There are no bills for the selected period.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    const customer = {
      id: customerId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
    };

    generateCustomerBillsPDF(customer, data.invoices, {
      start: range.startDate || "",
      end: range.endDate || "",
    });

    toast({
      title: "PDF Generated",
      description: `Successfully generated PDF with ${data.invoices.length} bills.`,
    });

    setIsGenerating(false);
  }, [data, isFetching]);

  // ✅ Just update state (NO refetch)
  const handleGeneratePDF = (newRange?: { start: string; end: string }) => {
    setIsGenerating(true);

    setRange({
      startDate: newRange?.start,
      endDate: newRange?.end,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {isGenerating ? "Generating..." : "Export Bills"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleGeneratePDF()}>
          All Bills
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            const end = new Date();
            const start = subDays(end, 30);

            handleGeneratePDF({
              start: format(start, "yyyy-MM-dd"),
              end: format(end, "yyyy-MM-dd"),
            });
          }}
        >
          Last 30 Days
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            const end = new Date();
            const start = startOfYear(end);

            handleGeneratePDF({
              start: format(start, "yyyy-MM-dd"),
              end: format(end, "yyyy-MM-dd"),
            });
          }}
        >
          This Year
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}