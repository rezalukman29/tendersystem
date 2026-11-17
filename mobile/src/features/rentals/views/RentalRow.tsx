import { CalendarRange, Store, Warehouse } from "lucide-react-native"
import * as React from "react"
import { View } from "react-native"

import { fmtDay, fmtNum, formatIDR } from "../../../core/format"
import { KIND_TEXT } from "../../../core/rules"
import type { IRentalListItemView } from "../interfaces/IRentalListItemView"
import { color, tabular } from "../../../theme"
import { Button, Meta, MetaRow, Tag, Text, type Tone } from "../../../ui/primitives"

const TONE = {
  Requested: "orange",
  Received: "brand",
  Done: "green",
  Overdue: "red",
} as const satisfies Record<IRentalListItemView["display"], Tone>

export function RentalRow({
  item,
  isActing,
  onMarkReceived,
  onMarkDone,
}: {
  item: IRentalListItemView
  isActing: boolean
  onMarkReceived: () => void
  onMarkDone: () => void
}) {
  const { record, display } = item
  const text = KIND_TEXT[record.kind]
  const context = record.eventName || [record.area, record.subArea].filter(Boolean).join(" · ")
  const label = display === "Received" ? text.received : display === "Done" ? text.done : display

  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text variant="strong" numberOfLines={1}>
            {record.itemName}
          </Text>
          <Text variant="meta" style={tabular} numberOfLines={1}>
            {`${fmtNum(record.qty)} ${record.unit} · ${formatIDR(record.totalCost)}${context ? ` · ${context}` : ""}`}
          </Text>
        </View>
        <Tag label={label} tone={TONE[display]} />
      </View>
      <MetaRow>
        <Meta icon={Store}>{record.vendorName ?? "—"}</Meta>
        <Meta icon={CalendarRange} textStyle={display === "Overdue" && { color: color.red, fontWeight: "600" }}>
          {`${fmtDay(record.startDate)} → ${fmtDay(record.dueDate)}`}
        </Meta>
        {record.warehouse && <Meta icon={Warehouse}>{record.warehouse}</Meta>}
      </MetaRow>
      {item.canMarkReceived && (
        <Button
          size="sm"
          variant="positive"
          title={text.markReceived}
          disabled={isActing}
          onPress={onMarkReceived}
          style={{ alignSelf: "flex-start" }}
        />
      )}
      {item.canMarkDone && (
        <Button
          size="sm"
          variant="outline"
          title={text.markDone}
          disabled={isActing}
          onPress={onMarkDone}
          style={{ alignSelf: "flex-start" }}
        />
      )}
    </View>
  )
}
