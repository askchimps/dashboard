"use client";

import {
  format,
  startOfToday,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onApply: (startDate: string, endDate: string) => void;
  startDate?: string;
  endDate?: string;
  isLoading?: boolean;
  className?: string;
}

const presets = [
  {
    label: "Today",
    getValue: (): DateRange => {
      const today = startOfToday();
      return { from: today, to: today };
    },
  },
  {
    label: "Yesterday",
    getValue: (): DateRange => {
      const yesterday = subDays(startOfToday(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: "Last 7 days",
    getValue: (): DateRange => ({
      from: subDays(startOfToday(), 6),
      to: startOfToday(),
    }),
  },
  {
    label: "Last 30 days",
    getValue: (): DateRange => ({
      from: subDays(startOfToday(), 29),
      to: startOfToday(),
    }),
  },
  {
    label: "This week",
    getValue: (): DateRange => ({
      from: startOfWeek(startOfToday(), { weekStartsOn: 1 }),
      to: endOfWeek(startOfToday(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "This month",
    getValue: (): DateRange => ({
      from: startOfMonth(startOfToday()),
      to: endOfMonth(startOfToday()),
    }),
  },
  {
    label: "Last 90 days",
    getValue: (): DateRange => ({
      from: subDays(startOfToday(), 89),
      to: startOfToday(),
    }),
  },
];

export function DateRangeFilter({
  onApply,
  startDate,
  endDate,
  isLoading = false,
  className,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get initial applied date range from props or default to current month
  const getInitialAppliedRange = (): DateRange => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }
    // Default to current month (from start of month to today)
    const today = startOfToday();
    return {
      from: startOfMonth(today),
      to: today,
    };
  };

  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>(
    getInitialAppliedRange
  );
  const [tempDateRange, setTempDateRange] =
    useState<DateRange>(appliedDateRange);

  // Update applied range when props change
  useEffect(() => {
    if (startDate && endDate) {
      const newAppliedRange = {
        from: new Date(startDate),
        to: new Date(endDate),
      };
      setAppliedDateRange(newAppliedRange);
      // Only update temp range if popover is closed to avoid overriding user selections
      if (!isOpen) {
        setTempDateRange(newAppliedRange);
      }
    }
  }, [startDate, endDate, isOpen]);

  const formatDateRange = (range: DateRange) => {
    if (!range.from || !range.to) return "Select dates";

    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM dd, yyyy");
    }

    return `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  // Get current display range - prioritize props if provided
  const getDisplayRange = (): DateRange => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }
    return appliedDateRange;
  };

  const handlePresetSelect = (preset: (typeof presets)[0]) => {
    const range = preset.getValue();
    setTempDateRange(range);
  };

  const handleApply = () => {
    if (tempDateRange.from && tempDateRange.to) {
      const newAppliedRange = { ...tempDateRange };
      setAppliedDateRange(newAppliedRange);
      onApply(
        format(tempDateRange.from, "yyyy-MM-dd"),
        format(tempDateRange.to, "yyyy-MM-dd")
      );
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempDateRange({ ...appliedDateRange });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset temp range to applied range when opening
      setTempDateRange({ ...appliedDateRange });
    }
  };

  const isValidRange =
    tempDateRange.from &&
    tempDateRange.to &&
    tempDateRange.from <= tempDateRange.to;
  const hasChanges =
    JSON.stringify(tempDateRange) !== JSON.stringify(appliedDateRange);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[300px] justify-between border-2 font-normal transition-colors hover:border-blue-300",
            !appliedDateRange.from && "text-muted-foreground",
            appliedDateRange.from && appliedDateRange.to && "border-blue-200",
            className
          )}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon
              className={cn(
                "h-4 w-4",
                isLoading && "animate-pulse text-blue-500",
                getDisplayRange().from &&
                  getDisplayRange().to &&
                  "text-blue-600"
              )}
            />
            <span className="truncate">
              {formatDateRange(getDisplayRange())}
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex">
          {/* Presets Sidebar */}
          <div className="bg-muted/30 w-[140px] border-r p-3">
            <div className="text-muted-foreground mb-2 text-xs font-medium">
              Quick Select
            </div>
            <div className="space-y-1">
              {presets.map(preset => {
                const presetRange = preset.getValue();
                const isSelected =
                  appliedDateRange.from &&
                  appliedDateRange.to &&
                  format(appliedDateRange.from, "yyyy-MM-dd") ===
                    format(presetRange.from!, "yyyy-MM-dd") &&
                  format(appliedDateRange.to, "yyyy-MM-dd") ===
                    format(presetRange.to!, "yyyy-MM-dd");

                return (
                  <Button
                    key={preset.label}
                    variant={isSelected ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 w-full justify-start px-2 text-xs transition-colors",
                      isSelected &&
                        "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    )}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="flex-1 p-3">
            <div className="text-muted-foreground mb-3 text-xs font-medium">
              Custom Range
            </div>
            <Calendar
              mode="range"
              selected={tempDateRange}
              onSelect={range => {
                if (range) {
                  setTempDateRange(range);
                }
              }}
              numberOfMonths={1}
              className="rounded-md"
            />

            <Separator className="my-3" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-xs">
                {isValidRange ? (
                  <span className="text-green-600">✓ Valid range selected</span>
                ) : (
                  <span>Select start and end dates</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!isValidRange || isLoading}
                  className={cn(
                    "min-w-[60px] text-xs transition-all duration-200",
                    hasChanges &&
                      isValidRange &&
                      "scale-105 bg-blue-600 hover:bg-blue-700",
                    !hasChanges && "bg-gray-500"
                  )}
                >
                  {isLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : hasChanges ? (
                    "Apply"
                  ) : (
                    "Applied"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
