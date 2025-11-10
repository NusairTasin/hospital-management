'use client'
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T = any> = {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T = any> = {
  data: T[];
  columns?: Column<T>[];
  caption?: string;
  showActions?: boolean;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: (row: T) => React.ReactNode;
  keyExtractor?: (row: T, index: number) => string | number;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  showActions = false,
  onUpdate,
  onDelete,
  customActions,
  keyExtractor,
}: DataTableProps<T>) {
  // Generate columns from data if not provided
  const tableColumns: Column<T>[] = columns || (data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      }))
    : []);

  const getRowKey = (row: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(row, index);
    // Try to find a common ID field
    const idFields = ['id', 'eid', 'EID', 'nurse_id', 'doctor_id', 'patient_id', 'room_id'];
    for (const field of idFields) {
      if (row[field] !== undefined) return row[field];
    }
    return index;
  };

  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (column.accessor) {
      return column.accessor(row);
    }
    return String(row[column.key] ?? '');
  };

  if (data.length === 0) {
    return (
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {tableColumns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {showActions && (onUpdate || onDelete) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={tableColumns.length + (showActions && (onUpdate || onDelete) ? 1 : 0)} className="text-center text-muted-foreground">
              No data available
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {tableColumns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={getRowKey(row, index)}>
            {tableColumns.map((column) => (
              <TableCell key={column.key} className={column.className}>
                {getCellValue(row, column)}
              </TableCell>
            ))}
            {showActions && (onUpdate || onDelete || customActions) && (
              <TableCell>
                <div className="flex gap-2">
                  {customActions ? customActions(row) : (
                    <>
                      {onUpdate && (
                        <button
                          onClick={() => onUpdate(row)}
                          className="text-primary hover:underline text-sm"
                        >
                          Update
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-destructive hover:underline text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

