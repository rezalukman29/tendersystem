import type { IStockOpnameListResponse } from "../../entities/api/response/IStockOpnameListResponse"
import { StockRepositories } from "../repositories/stock.repositories"
import { StockServices } from "./stock.services"

describe("StockServices opname integration", () => {
  const repository = new StockRepositories()
  const service = new StockServices(repository)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("maps draft and done history records and preserves API pagination", async () => {
    const data: IStockOpnameListResponse = {
      page: 1,
      total_pages: 1,
      total_records: 2,
      record_per_page: 2,
      data: [
        {
          id: 25,
          period: "Nov 2026",
          remark: "Monthly check",
          flag: "draft",
          created_at: "2026-11-17 11:16:41",
          userId: 8,
          valuation: 250000,
          data: [
            {
              id: 68,
              stock_new: 19,
              stock_old: 20,
              comparison: "95%",
              condition: "POOR",
              notes: "",
              barang: {
                nama: "Table candle holder",
                gudang_id: 2,
                gudang_name: "Gudang Bali 70",
                photo: "",
              },
            },
          ],
        },
        {
          id: 19,
          period: "September 2026",
          remark: "Empty count",
          flag: "done",
          created_at: "2026-09-01 09:17:58",
          userId: 8,
          data: [],
        },
      ],
    }
    const getStockOpnameHistory = jest.spyOn(repository, "getStockOpnameHistory").mockResolvedValue({
      success: true,
      message: "get stock opname",
      data,
    })

    await expect(service.getStockOpnameHistory(1, 20)).resolves.toEqual({
      page: 1,
      totalPages: 1,
      totalRecords: 2,
      items: [
        {
          id: 25,
          period: "Nov 2026",
          appliedAt: "2026-11-17 11:16:41",
          appliedBy: "8",
          warehouse: "Gudang Bali 70",
          countedCount: 1,
          amount: 250000,
          status: "Pending",
          items: [
            {
              rowId: 68,
              name: "Table candle holder",
              before: 20,
              after: 19,
              diff: -1,
              condition: "Poor",
              note: "",
            },
          ],
        },
        {
          id: 19,
          period: "September 2026",
          appliedAt: "2026-09-01 09:17:58",
          appliedBy: "8",
          warehouse: undefined,
          countedCount: 0,
          amount: 0,
          status: "Approved",
          items: [],
        },
      ],
    })
    expect(getStockOpnameHistory).toHaveBeenCalledWith({ page: 1, limit: 20 }, undefined)
  })

  it("rejects stock opname history with an unsupported flag", async () => {
    const getStockOpnameHistory = jest.spyOn(repository, "getStockOpnameHistory").mockResolvedValue({
      success: true,
      message: "get stock opname",
      data: {
        page: 1,
        total_pages: 1,
        total_records: 1,
        record_per_page: 1,
        data: [
          {
            id: 25,
            period: "Nov 2026",
            remark: "Monthly check",
            flag: "archived",
            created_at: "2026-11-17 11:16:41",
            userId: 8,
            data: [],
          },
        ],
      },
    })

    await expect(service.getStockOpnameHistory(1, 20)).rejects.toMatchObject({
      name: "ApiError",
      message: "Request failed",
    })
    expect(getStockOpnameHistory).toHaveBeenCalledTimes(1)
  })

  it("maps and creates stock opname submissions", async () => {
    const createStockOpname = jest.spyOn(repository, "createStockOpname").mockResolvedValue({
      success: true,
      message: "created stock opname",
      data: { id: 76 },
    })

    await expect(
      service.createStockOpname({
        period: "  Nov 2026 ",
        remark: "  Monthly count ",
        items: [
          { warehouseItemId: 68, actualStock: 19, condition: "Poor", note: "  chipped " },
          { warehouseItemId: 69, actualStock: 3, condition: "Good", note: "" },
        ],
      })
    ).resolves.toBe(76)

    expect(createStockOpname).toHaveBeenCalledWith({
      period: "Nov 2026",
      remark: "Monthly count",
      data: [
        { condition: "POOR", id: 68, notes: "chipped", stok: 19 },
        { condition: "GOOD", id: 69, notes: "", stok: 3 },
      ],
    })
  })

  it("surfaces API failures when creating stock opname", async () => {
    jest.spyOn(repository, "createStockOpname").mockResolvedValue({
      success: false,
      message: "Unable to create stock opname",
      data: { id: 0 },
    })

    await expect(
      service.createStockOpname({ period: "Nov 2026", remark: "Count", items: [] })
    ).rejects.toMatchObject({ name: "ApiError", message: "Unable to create stock opname" })
  })

  it("maps warehouse location when the API provides it", async () => {
    jest.spyOn(repository, "getWarehouses").mockResolvedValue({
      success: true,
      message: "get all gudang",
      data: {
        page: 1,
        total_pages: 1,
        total_records: 1,
        record_per_page: 1,
        data: [{ id: 2, nama: "Gudang Bali 70", lokasi: "Bali", total_items: 1889 }],
      },
    })

    await expect(service.getWarehouses()).resolves.toEqual([
      { id: 2, name: "Gudang Bali 70", location: "Bali", totalItems: 1889 },
    ])
  })
})
