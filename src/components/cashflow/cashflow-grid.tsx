"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import type { LineItem } from "@/types/database";

type CashflowGridProps = {
  lineItems: LineItem[];
  onLineItemsChange?: (lineItems: LineItem[]) => void;
};

export function CashflowGrid({ lineItems, onLineItemsChange }: CashflowGridProps) {
  const columnDefs = useMemo<ColDef[]>(() => {
    const months = lineItems[0]?.monthly_values.length ?? 0;
    const monthCols = Array.from({ length: months }, (_, index) => ({
      headerName: `M${index + 1}`,
      field: `month-${index}`,
      valueGetter: (params: { data: LineItem }) => params.data.monthly_values[index],
      valueFormatter: (params: { value: number | null | undefined }) => {
        if (params.value === null || params.value === undefined) {
          return "-";
        }
        return `$${Number(params.value).toFixed(1)}k`;
      },
      valueSetter: (params: { data: LineItem; newValue: unknown }) => {
        const nextValue = Number(params.newValue);
        if (Number.isNaN(nextValue)) {
          return false;
        }
        const cloned = [...params.data.monthly_values];
        cloned[index] = nextValue;
        params.data.monthly_values = cloned;
        // Notify parent of change
        if (onLineItemsChange) {
          onLineItemsChange([...lineItems]);
        }
        return true;
      },
      editable: true,
      flex: 1,
    }));

    return [
      {
        headerName: "Type",
        field: "type",
        cellClass: "font-semibold text-neutral-500",
        width: 110,
      },
      {
        headerName: "Label",
        field: "label",
        flex: 1,
        editable: true,
      },
      ...monthCols,
    ];
  }, [lineItems]);

  return (
    <div className="ag-theme-quartz h-[420px] w-full rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <AgGridReact 
        rowData={lineItems} 
        columnDefs={columnDefs} 
        animateRows 
        rowHeight={42}
        theme="legacy"
      />
    </div>
  );
}

