import type { StockRepositories } from "../src/data/repositories/stock.repositories"
import { StockServices } from "../src/data/services/stock.services"
import { stockKeys } from "../src/features/stock/queries/stockKeys"

describe("stock integration", () => {
  it("maps paginated warehouse inventory and forwards server filters", async () => {
    const getWarehouseInventory = jest.fn().mockResolvedValue({
      success: true,
      message: "warehouse inventory",
      data: {
        page: 1,
        total_pages: 2,
        total_records: 21,
        record_per_page: 20,
        prev: 1,
        next: 2,
        data: [
          {
            barang_gudang_id: 2408,
            gudang_id: 3,
            barang_id: 2232,
            stok_gudang: 17,
            kode_gudang: "B66-BSCSW",
            stok_minimum: 5,
            nama_barang: "Bantalan Sofa C/S White (An)",
            stok_barang: 18,
            nama_satuan: "pcs",
            gudang_name: "Gudang Bali 66",
            stock_used: 1,
            valuation: "125000",
            status: "critical",
            kode_barang: "BSCSW",
            gudang: {
              gudang_id: 3,
              gudang_name: "Gudang Bali 66",
            },
          },
        ],
      },
    })
    const repository = createRepository({ getWarehouseInventory })
    const service = new StockServices(repository)
    const signal = new AbortController().signal

    const result = await service.getWarehouseInventory(
      {
        page: 1,
        limit: 20,
        search: "sofa",
        warehouseId: 3,
        status: "CRITICAL",
      },
      signal
    )

    expect(getWarehouseInventory).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 20,
        search: "sofa",
        gudang_id: 3,
        status: "CRITICAL",
        sort: "ASC",
        sort_by: "nama_barang",
      },
      signal
    )
    expect(result).toEqual({
      page: 1,
      totalPages: 2,
      totalRecords: 21,
      items: [
        {
          id: 2408,
          itemId: 2232,
          name: "Bantalan Sofa C/S White (An)",
          code: "BSCSW",
          warehouseId: 3,
          warehouseName: "Gudang Bali 66",
          warehouseStock: 17,
          itemStock: 18,
          minimumStock: 5,
          usedStock: 1,
          unit: "pcs",
          valuation: 125000,
          status: "CRITICAL",
        },
      ],
    })
  })

  it("maps stock summaries and warehouse filter options", async () => {
    const repository = createRepository({
      getWarehouseInventorySummary: jest.fn().mockResolvedValue({
        success: true,
        message: "summary",
        data: { total_items: 1940, safe: 1896, warning: 12, critical: 32 },
      }),
      getInventorySummary: jest.fn().mockResolvedValue({
        success: true,
        message: "asset summary",
        data: {
          total_items: 1940,
          available: 1896,
          low_stock: 12,
          out_of_stock: 32,
          total_asset_value: 295000000,
        },
      }),
      getWarehouses: jest.fn().mockResolvedValue({
        success: true,
        message: "warehouses",
        data: {
          page: 1,
          total_pages: 1,
          total_records: 2,
          record_per_page: 1000,
          data: [
            { id: 2, nama: "Gudang Bali 70", total_items: 1889 },
            { id: 3, nama: "Gudang Bali 66", total_items: 34 },
          ],
        },
      }),
    })
    const service = new StockServices(repository)

    const [summary, assetValue, warehouses] = await Promise.all([
      service.getWarehouseInventorySummary(),
      service.getTotalAssetValue(),
      service.getWarehouses(),
    ])

    expect(summary).toEqual({ totalItems: 1940, safe: 1896, warning: 12, critical: 32 })
    expect(assetValue).toBe(295000000)
    expect(warehouses).toEqual([
      { id: 2, name: "Gudang Bali 70", totalItems: 1889 },
      { id: 3, name: "Gudang Bali 66", totalItems: 34 },
    ])
    expect(repository.getWarehouses).toHaveBeenCalledWith({ page: 1, limit: 1000 }, undefined)
  })

  it("keeps filtered infinite-query caches isolated", () => {
    const warningKey = stockKeys.list({
      limit: 20,
      search: " chair ",
      status: "WARNING",
    })
    const criticalKey = stockKeys.list({
      limit: 20,
      search: "chair",
      status: "CRITICAL",
    })

    expect(warningKey).not.toEqual(criticalKey)
    expect(warningKey).toEqual([
      "stock",
      "list",
      {
        limit: 20,
        search: "chair",
        warehouseId: undefined,
        status: "WARNING",
        sort: "ASC",
        sortBy: "nama_barang",
      },
    ])
  })
})

function createRepository(overrides: Partial<Record<keyof StockRepositories, jest.Mock>> = {}): StockRepositories {
  return {
    getWarehouseInventory: jest.fn(),
    getWarehouseInventorySummary: jest.fn(),
    getInventorySummary: jest.fn(),
    getWarehouses: jest.fn(),
    ...overrides,
  } as unknown as StockRepositories
}
