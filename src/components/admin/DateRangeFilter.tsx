import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export type DateRangeType = "today" | "yesterday" | "week" | "month" | "custom";

interface DateRangeFilterProps {
  onRangeChange: (type: DateRangeType, startDate: Date, endDate: Date) => void;
}

const DateRangeFilter = ({ onRangeChange }: DateRangeFilterProps) => {
  const [rangeType, setRangeType] = useState<DateRangeType>("month");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showCustom, setShowCustom] = useState(false);

  const getDateRange = (type: DateRangeType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = today;
    let end = new Date(today);

    switch (type) {
      case "today":
        start = today;
        end = new Date(today);
        break;
      case "yesterday":
        start = new Date(today.setDate(today.getDate() - 1));
        end = new Date(start);
        break;
      case "week":
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        end = new Date();
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case "custom":
        return { start: startDate, end: endDate };
    }

    return { start, end };
  };

  const handleRangeChange = (type: DateRangeType) => {
    setRangeType(type);
    if (type !== "custom") {
      setShowCustom(false);
      const { start, end } = getDateRange(type);
      setStartDate(start);
      setEndDate(end);
      onRangeChange(type, start, end);
    } else {
      setShowCustom(true);
    }
  };

  const handleCustomDateChange = () => {
    onRangeChange("custom", startDate, endDate);
  };

  const getRangeLabel = () => {
    const labels: Record<DateRangeType, string> = {
      today: "Hoje",
      yesterday: "Ontem",
      week: "Esta Semana",
      month: "Este Mês",
      custom: "Personalizado",
    };
    return labels[rangeType];
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={rangeType === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("today")}
          className="text-xs"
        >
          Hoje
        </Button>
        <Button
          variant={rangeType === "yesterday" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("yesterday")}
          className="text-xs"
        >
          Ontem
        </Button>
        <Button
          variant={rangeType === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("week")}
          className="text-xs"
        >
          Esta Semana
        </Button>
        <Button
          variant={rangeType === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => handleRangeChange("month")}
          className="text-xs"
        >
          Este Mês
        </Button>

        <Popover open={showCustom} onOpenChange={setShowCustom}>
          <PopoverTrigger asChild>
            <Button
              variant={rangeType === "custom" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Personalizado
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Data Inicial</label>
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) setStartDate(date);
                  }}
                  locale={pt}
                  disabled={(date) => date > endDate}
                  className="rounded-md border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Data Final</label>
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) setEndDate(date);
                  }}
                  locale={pt}
                  disabled={(date) => date < startDate}
                  className="rounded-md border"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  handleCustomDateChange();
                  setShowCustom(false);
                }}
                className="w-full text-xs"
              >
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="ml-auto text-xs text-muted-foreground">
        {format(startDate, "dd/MM/yyyy", { locale: pt })} - {format(endDate, "dd/MM/yyyy", { locale: pt })}
      </div>
    </div>
  );
};

export default DateRangeFilter;
