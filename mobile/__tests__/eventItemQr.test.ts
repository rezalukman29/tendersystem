import { parseEventItemQr } from "../src/core/eventItemQr"

describe("parseEventItemQr", () => {
  it.each([
    ["event_item/12/IN", { itemId: 12, type: "IN" }],
    ["event_item/204/OUT", { itemId: 204, type: "OUT" }],
    ["event_item/12/in", { itemId: 12, type: "IN" }],
  ])("parses %s", (value, expected) => {
    expect(parseEventItemQr(value)).toEqual(expected)
  })

  it.each(["sku/12/IN", "event_item/0/IN", "event_item/12/UNKNOWN", "event_item/12/IN/extra"])(
    "rejects invalid payload %s",
    (value) => {
      expect(parseEventItemQr(value)).toBeNull()
    }
  )
})
