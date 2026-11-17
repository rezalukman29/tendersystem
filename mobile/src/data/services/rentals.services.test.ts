import type { ILoanItemListResponse } from "../../entities/api/response/ILoanItemListResponse"
import type { ILoanItemResponse } from "../../entities/api/response/ILoanItemResponse"
import type { IOutsourceItemListResponse } from "../../entities/api/response/IOutsourceItemListResponse"
import type { IOutsourceItemResponse } from "../../entities/api/response/IOutsourceItemResponse"
import { RentalsRepositories } from "../repositories/rentals.repositories"
import { RentalsServices } from "./rentals.services"

const loanItem: ILoanItemResponse = {
  id: 21,
  item_name: "Stage Light",
  qty: 2,
  unit: "unit",
  vendor_id: 7,
  vendor: { id: 7, name: "Light Vendor" },
  warehouse_id: 0,
  warehouse: null,
  event_id: 31,
  event: { id: 31, name: "Sample Event", area: "Hall", sub_area: "Main" },
  area_id: 4,
  sub_area_id: 9,
  borrow_from: "2026-11-18",
  return_by: "2026-11-20",
  purpose: "",
  notes: "",
  rental_cost_per_unit: 125000,
  rental_cost: 250000,
  status: "REQUESTED",
  requested_at: "2026-11-17",
  requested_by: "Staff",
  received_at: null,
  returned_at: null,
  created_at: "2026-11-17",
  updated_at: "2026-11-17",
}

const outsourceItem: IOutsourceItemResponse = {
  id: 42,
  event_id: 31,
  barang_id: 55,
  item_name: "Floral Arrangement",
  qty: 3,
  unit: "set",
  satuan_id: 2,
  area_id: 4,
  area_name: "Hall",
  sub_area_id: null,
  sub_area_name: null,
  outsource_vendor_id: 8,
  vendor: {},
  event: {},
  from_date: "2026-11-18",
  to_date: "2026-11-20",
  cost: 80000,
  total_cost: 240000,
  note: "",
  status: "RECEIVED",
}

describe("RentalsServices", () => {
  const repository = new RentalsRepositories()
  const service = new RentalsServices(repository)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("maps loan list fields, pagination, and summary", async () => {
    const data: ILoanItemListResponse = {
      data: [loanItem],
      page: 1,
      record_per_page: 20,
      total_records: 5,
      total_pages: 1,
      summary: {
        total_records: 5,
        borrowed: 2,
        overdue: 1,
        returned: 1,
        waiting_to_arrive: 1,
        total_rental_cost: 750000,
      },
    }
    const getLoanItems = jest.spyOn(repository, "getLoanItems").mockResolvedValue({
      success: true,
      message: "",
      data,
    })

    await expect(service.getRentalItems("loan", { page: 1, limit: 20 })).resolves.toEqual({
      items: [
        {
          id: 21,
          kind: "loan",
          itemName: "Stage Light",
          qty: 2,
          unit: "unit",
          vendorName: "Light Vendor",
          vendorId: 7,
          eventId: 31,
          eventName: "Sample Event",
          area: "Hall",
          subArea: "Main",
          areaId: 4,
          subAreaId: 9,
          warehouseId: undefined,
          startDate: "2026-11-18",
          dueDate: "2026-11-20",
          costPerUnit: 125000,
          totalCost: 250000,
          status: "REQUESTED",
          purpose: "",
          note: "",
        },
      ],
      page: 1,
      totalPages: 1,
      totalRecords: 5,
      summary: {
        requested: 1,
        received: 2,
        overdue: 1,
        done: 1,
      },
    })
    expect(getLoanItems).toHaveBeenCalledWith({ page: 1, limit: 20 }, undefined)
  })

  it("maps outsource records while normalizing nullable relationships", async () => {
    const data: IOutsourceItemListResponse = {
      data: [outsourceItem],
      page: 1,
      record_per_page: 20,
      total_records: 1,
      total_pages: 1,
      summary: {
        outsource_records: 1,
        waiting_to_arrive: 0,
        received_now: 1,
        overdue: 0,
        completed: 0,
        total_cost: 240000,
      },
    }
    jest.spyOn(repository, "getOutsourceItems").mockResolvedValue({
      success: true,
      message: "",
      data,
    })

    await expect(service.getRentalItems("outsource", { page: 1, limit: 20 })).resolves.toMatchObject({
      items: [
        {
          id: 42,
          kind: "outsource",
          itemName: "Floral Arrangement",
          vendorName: undefined,
          vendorId: 8,
          eventName: undefined,
          area: "Hall",
          subAreaId: undefined,
          itemId: 55,
          unitId: 2,
          status: "RECEIVED",
        },
      ],
      summary: { requested: 0, received: 1, overdue: 0, done: 0 },
    })
  })

  it("accepts loan records with nullable relations and an empty summary", async () => {
    const data: ILoanItemListResponse = {
      data: [{
        ...loanItem,
        warehouse: null,
        warehouse_id: null,
        event_id: null,
        event: null,
        area_id: null,
        sub_area_id: null,
      }],
      page: 1,
      record_per_page: 20,
      total_records: 1,
      total_pages: 1,
      summary: {},
    }
    jest.spyOn(repository, "getLoanItems").mockResolvedValue({
      success: true,
      message: "",
      data,
    })

    await expect(service.getRentalItems("loan", { page: 1, limit: 20 })).resolves.toMatchObject({
      items: [{
        eventId: undefined,
        eventName: undefined,
        areaId: undefined,
        subAreaId: undefined,
        warehouse: undefined,
        warehouseId: undefined,
      }],
      summary: {
        requested: undefined,
        received: undefined,
        overdue: undefined,
        done: undefined,
      },
    })
  })

  it("uses the current loan detail to send a complete status update", async () => {
    const getLoanItem = jest.spyOn(repository, "getLoanItem").mockResolvedValue({
      success: true,
      message: "",
      data: loanItem,
    })
    const updateLoanItem = jest.spyOn(repository, "updateLoanItem").mockResolvedValue({
      success: true,
      message: "",
      data: { ...loanItem, status: "BORROWED" },
    })

    await service.updateRentalStatus({
      record: {
        id: loanItem.id,
        kind: "loan",
        itemName: loanItem.item_name,
        qty: loanItem.qty,
        unit: loanItem.unit,
        vendorId: loanItem.vendor_id,
        startDate: loanItem.borrow_from,
        dueDate: loanItem.return_by,
        costPerUnit: loanItem.rental_cost_per_unit,
        totalCost: loanItem.rental_cost,
        status: "REQUESTED",
      },
      status: "BORROWED",
    })

    expect(getLoanItem).toHaveBeenCalledWith(21)
    expect(updateLoanItem).toHaveBeenCalledWith(21, {
      item_name: "Stage Light",
      qty: 2,
      unit: "unit",
      vendor_id: 7,
      event_id: 31,
      area_id: 4,
      sub_area_id: 9,
      borrow_from: "2026-11-18",
      return_by: "2026-11-20",
      rental_cost_per_unit: 125000,
      purpose: "",
      notes: "",
      status: "BORROWED",
    })
  })

  it("rejects a loan status outside the endpoint contract", async () => {
    const getLoanItems = jest.spyOn(repository, "getLoanItems").mockResolvedValue({
      success: true,
      message: "",
      data: {
        data: [{ ...loanItem, status: "UNKNOWN" }],
        page: 1,
        record_per_page: 20,
        total_records: 1,
        total_pages: 1,
        summary: {
          total_records: 1,
          borrowed: 0,
          overdue: 0,
          returned: 0,
          waiting_to_arrive: 1,
          total_rental_cost: 0,
        },
      },
    })

    await expect(service.getRentalItems("loan", { page: 1, limit: 20 })).rejects.toMatchObject({
      name: "ApiError",
    })
    expect(getLoanItems).toHaveBeenCalledTimes(1)
  })

  it("rejects a malformed pagination envelope instead of treating it as a valid page", async () => {
    const data = {
      data: [loanItem],
      page: "1",
      record_per_page: 20,
      total_records: 1,
      total_pages: 1,
      summary: {
        total_records: 1,
        borrowed: 0,
        overdue: 0,
        returned: 0,
        waiting_to_arrive: 1,
        total_rental_cost: 250000,
      },
    } as unknown as ILoanItemListResponse
    jest.spyOn(repository, "getLoanItems").mockResolvedValue({
      success: true,
      message: "",
      data,
    })

    await expect(service.getRentalItems("loan", { page: 1, limit: 20 })).rejects.toMatchObject({
      name: "ApiError",
      message: "Request failed",
    })
  })

  it("sends the outsourced item fields required by the update endpoint", async () => {
    const updateOutsourceItem = jest.spyOn(repository, "updateOutsourceItem").mockResolvedValue({
      success: true,
      message: "",
      data: { ...outsourceItem, status: "COMPLETED" },
    })

    await service.updateRentalStatus({
      record: {
        id: outsourceItem.id,
        kind: "outsource",
        itemName: outsourceItem.item_name,
        qty: outsourceItem.qty,
        unit: outsourceItem.unit,
        vendorId: outsourceItem.outsource_vendor_id,
        areaId: outsourceItem.area_id,
        itemId: outsourceItem.barang_id,
        unitId: outsourceItem.satuan_id,
        startDate: outsourceItem.from_date,
        dueDate: outsourceItem.to_date,
        costPerUnit: outsourceItem.cost,
        totalCost: outsourceItem.total_cost,
        status: "RECEIVED",
      },
      status: "COMPLETED",
    })

    expect(updateOutsourceItem).toHaveBeenCalledWith(42, {
      barang_id: 55,
      qty: 3,
      satuan_id: 2,
      area_id: 4,
      outsource_vendor_id: 8,
      from_date: "2026-11-18",
      to_date: "2026-11-20",
      cost: 80000,
      note: "",
      status: "COMPLETED",
    })
  })
})
