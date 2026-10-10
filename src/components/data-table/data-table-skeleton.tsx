import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  columnCount: number;
  rowCount?: number;
}

// Renders a table-shaped skeleton so there's no layout jump when real data arrives. Matches the header + row structure of <DataTable />.
export function DataTableSkeleton({ columnCount, rowCount = 5 }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <div className="h-4 w-full max-w-32 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}