import { EventsServices } from "../src/data/services/events.services"
import type { EventsRepositories } from "../src/data/repositories/events.repositories"
import type { IEvent } from "../src/entities/interfaces/events/IEvent"
import type { IEventStatus } from "../src/entities/interfaces/events/IEventStatus"
import { toEventListItem } from "../src/features/events/presenters/toEventListItem"

describe("event list integration", () => {
  it("maps paginated event transport data and uses a page size of 20", async () => {
    const getEvents = jest.fn().mockResolvedValue({
      success: true,
      message: "events",
      data: {
        page: 1,
        total_pages: 2,
        total_records: 21,
        record_per_page: 20,
        prev: 1,
        next: 2,
        data: [
          {
            id: 92,
            name: { String: "MCR Live", Valid: true },
            event_code: { string: "MCR", valid: true },
            event_start: "2026-10-01",
            event_end: "2026-10-02",
            date_event: "2026-10-01",
            address: { String: "Jakarta", Valid: true },
            status: 4,
            lifecycle_status: "on-going",
            total_items: 8,
          },
        ],
      },
    })
    const repository = {
      getEvents,
      getEventStatuses: jest.fn(),
      getEventDetail: jest.fn(),
      getEventItems: jest.fn(),
    } as unknown as EventsRepositories
    const service = new EventsServices(repository)

    const result = await service.getEvents({
      lifecycleStatus: "on-going",
      page: 1,
      limit: 20,
      sort: "ASC",
      sortBy: "date_event",
    })

    expect(getEvents).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20, status: "on-going" }), undefined)
    expect(result.totalPages).toBe(2)
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: 92,
        name: "MCR Live",
        code: "MCR",
        location: "Jakarta",
        totalItems: 8,
      })
    )
  })

  it("maps event detail and event items from their backend contracts", async () => {
    const getEventDetail = jest.fn().mockResolvedValue({
      success: true,
      message: "event detail",
      data: {
        id: 92,
        name: { String: "MCR Live", Valid: true },
        description: "Concert",
        event_code: "MCR",
        event_start: "2026-10-01",
        event_end: "2026-10-02",
        date_event: "2026-10-01",
        address: "Jakarta",
        PIC: "Anto",
        notes: "Keep dry",
        status: 4,
        is_complete: 0,
        is_finished: 0,
        images: "",
        type: "Concert",
      },
    })
    const getEventItems = jest.fn().mockResolvedValue({
      success: true,
      message: "list item event",
      data: [
        {
          id: 401,
          event_id: 92,
          barang_id: 2201,
          nama_barang: "Tiffany Chair",
          code: "TC01",
          qty: 3,
          satuan: "pcs",
          notes: "",
          area_name: "CEREMONY",
          sub_list_name: "AISLE",
          pic: "Anto",
          event_status_id: 4,
          scan_in: 1,
          scan_out: 0,
          ownerships: { ihc: true, ihp: false, outsource: false },
          package: null,
          is_new_production_item: false,
          is_converted: false,
          converted_qty: 0,
          broken_item: { id: 2, qty: 1, notes: "Scratch" },
        },
      ],
    })
    const repository = {
      getEvents: jest.fn(),
      getEventStatuses: jest.fn(),
      getEventDetail,
      getEventItems,
    } as unknown as EventsRepositories
    const service = new EventsServices(repository)

    const [detail, items] = await Promise.all([service.getEventDetail(92), service.getEventItems(92)])

    expect(getEventDetail).toHaveBeenCalledWith(92, undefined)
    expect(getEventItems).toHaveBeenCalledWith({ event_id: 92, order: "asc" }, undefined)
    expect(detail).toEqual(
      expect.objectContaining({
        id: 92,
        name: "MCR Live",
        location: "Jakarta",
        pic: "Anto",
      })
    )
    expect(items[0]).toEqual(
      expect.objectContaining({
        name: "Tiffany Chair",
        areaName: "CEREMONY",
        scanIn: true,
        ownerships: ["IHC"],
        brokenQty: 1,
      })
    )
  })

  it("uses status action for scan mode and the status name for the stage", () => {
    const event: IEvent = {
      id: 92,
      name: "MCR Live",
      code: "MCR",
      startDate: "2026-10-01",
      endDate: "2026-10-02",
      location: "Jakarta",
      statusId: 4,
      lifecycleStatus: "on-going",
      totalItems: 8,
    }
    const status: IEventStatus = {
      id: 4,
      name: "Waiting scan out",
      action: "SCAN_OUT",
      order: 4,
      activeEvent: 1,
    }

    const view = toEventListItem(event, "on-going", new Map([[status.id, status]]))

    expect(view.stageName).toBe("Waiting scan out")
    expect(view.scanMode).toBe("out")
    expect(view.scannedItems).toBe(8)
    expect(view.totalItems).toBe(8)
  })

  it("uses the backend status name when the action is not a scan", () => {
    const event: IEvent = {
      id: 93,
      name: "Setup Event",
      code: "SET",
      startDate: "2026-10-03",
      endDate: "2026-10-03",
      location: "Bali",
      statusId: 2,
      lifecycleStatus: "on-going",
      totalItems: 5,
    }
    const status: IEventStatus = {
      id: 2,
      name: "On preparing items",
      action: "",
      order: 2,
      activeEvent: 1,
    }

    const view = toEventListItem(event, "on-going", new Map([[status.id, status]]))

    expect(view.stageName).toBe("On preparing items")
    expect(view.scanMode).toBeNull()
  })
})
