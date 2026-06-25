"use client";

import React from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}

function getNestedValue(obj: any, key: string): any {
  return key.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading,
  onRowClick,
  emptyState,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100 last:border-0">
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-4 bg-neutral-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length && emptyState) {
    return (
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                className={`border-b border-neutral-100 last:border-0 transition-colors ${onRowClick ? "cursor-pointer hover:bg-neutral-50/80" : "hover:bg-neutral-50/40"}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, j) => {
                  const rawValue = getNestedValue(row, col.key as string);
                  return (
                    <td key={j} className="px-4 py-3.5 text-sm text-neutral-700">
                      {col.render ? col.render(rawValue, row) : rawValue ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
