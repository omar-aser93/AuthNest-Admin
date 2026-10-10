import { createTableHook, tableFeatures, rowSortingFeature, rowPaginationFeature, columnVisibilityFeature } from "@tanstack/react-table";

// Declares which 'tanstack-table' features the table component uses. While Sorting and pagination are driven server-side, 
// but the feature registration is still required to get the column.toggleSorting() and table.nextPage() APIs on the table instance.
export const tableFeaturesConfig = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
});

// Pre-bound to the app's feature set — no need to thread `typeof features`.
export const { useAppTable, createAppColumnHelper } = createTableHook({
  features: tableFeaturesConfig,
  enableSortingRemoval: false,
});