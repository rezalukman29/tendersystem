import type { IWarehouseInventoryQuery } from "../../../entities/interfaces/stock/IWarehouseInventoryQuery"

function normalizeQuery(query: Omit<IWarehouseInventoryQuery, "page">) {
  return {
    limit: query.limit,
    search: query.search?.trim() || undefined,
    warehouseId: query.warehouseId,
    status: query.status,
    sort: query.sort ?? "ASC",
    sortBy: query.sortBy ?? "nama_barang",
  }
}

export const stockKeys = {
  all: ["stock"] as const,
  lists: () => [...stockKeys.all, "list"] as const,
  list: (query: Omit<IWarehouseInventoryQuery, "page">) => [...stockKeys.lists(), normalizeQuery(query)] as const,
  warehouseSummary: () => [...stockKeys.all, "warehouse-summary"] as const,
  assetSummary: () => [...stockKeys.all, "asset-summary"] as const,
  warehouses: () => [...stockKeys.all, "warehouses"] as const,
  opnameHistories: () => [...stockKeys.all, "opname-history"] as const,
  opnameHistory: (limit: number) => [...stockKeys.opnameHistories(), { limit }] as const,
}
