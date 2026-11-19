import { CalendarX2, ChevronRight, ScanLine } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, FlatList, Pressable, View } from "react-native"

import { fmtDate, fmtNum, fmtRange } from "../../../core/format"
import type { IEventListItemView } from "../../events/interfaces/IEventListItemView"
import { color, mono, tabular } from "../../../theme"
import { Header } from "../../../ui/domain"
import { Button, EmptyState, SectionLabel, Tag, Text } from "../../../ui/primitives"
import type { IScanPickerViewProps } from "../interfaces/IScanPickerViewProps"

export function ScanPickerView(props: IScanPickerViewProps) {
  return (
    <View style={{ flex: 1 }}>
      <Header large title="Scan" />
      {props.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={color.brand} />
          <Text variant="meta" style={{ marginTop: 10 }}>Loading events…</Text>
        </View>
      ) : props.errorMessage && props.events.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <EmptyState icon={CalendarX2} title="Unable to load scan events" body={props.errorMessage} />
          <Button title="Try again" size="sm" onPress={props.onRetry} />
        </View>
      ) : (
        <>
          {props.events.length > 0 && (
            <SectionLabel>{`At a scan stage · ${props.totalEvents}`}</SectionLabel>
          )}
          <FlatList
            data={props.events}
            keyExtractor={(event) => String(event.id)}
            renderItem={({ item }) => <ScanEventRow event={item} onPress={() => props.onEventPress(item.id)} />}
            ItemSeparatorComponent={EventSeparator}
            ListEmptyComponent={
              <EmptyState
                icon={ScanLine}
                title={props.hasScanStatuses ? "No event is at a scan stage" : "No scan stages available"}
                body={props.hasScanStatuses ? "Events show here at a scan in / out status." : undefined}
              />
            }
            ListFooterComponent={
              <>
                {props.errorMessage && props.events.length > 0 && (
                  <View style={{ alignItems: "center", gap: 8, padding: 16 }}>
                    <Text variant="meta" style={{ color: color.red }}>{props.errorMessage}</Text>
                    <Button title="Try again" size="sm" onPress={props.onRetry} />
                  </View>
                )}
                {props.isFetchingNextPage ? <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} /> : null}
              </>
            }
            contentContainerStyle={{ paddingBottom: 24, ...(props.events.length === 0 ? { flexGrow: 1 } : {}) }}
            style={{
              flex: 1,
              ...(props.events.length > 0
                ? {
                    marginHorizontal: 16,
                    borderWidth: 1,
                    borderColor: color.border,
                    borderRadius: 12,
                    backgroundColor: color.surface,
                  }
                : {}),
            }}
            refreshing={props.isRefreshing}
            onRefresh={props.onRefresh}
            onEndReached={props.onEndReached}
            onEndReachedThreshold={0.4}
          />
        </>
      )}
    </View>
  )
}

function ScanEventRow({ event, onPress }: { event: IEventListItemView; onPress: () => void }) {
  const scanIn = event.scanMode === "in"
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
        pressed && { backgroundColor: color.raised },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ fontFamily: mono, fontSize: 12, color: color.muted, width: 34 }} numberOfLines={1}>
          {event.code}
        </Text>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="strong" numberOfLines={1}>{event.name}</Text>
          <Text variant="meta">{formatEventDate(event.startDate, event.endDate)}</Text>
        </View>
        <Tag label={scanIn ? "Scan in" : "Scan out"} tone={scanIn ? "brand" : "orange"} />
        <Text variant="strong" style={[{ minWidth: 28, textAlign: "right" }, tabular]}>
          {`${fmtNum(event.scannedItems)}/${fmtNum(event.totalItems)}`}
        </Text>
        <ChevronRight size={16} color={color.faint} />
      </View>
    </Pressable>
  )
}

function EventSeparator() {
  return <View style={{ height: 1, backgroundColor: color.border }} />
}

function formatEventDate(startDate: string, endDate: string): string {
  if (!startDate) return "—"
  return endDate ? fmtRange(startDate, endDate) : fmtDate(startDate)
}
