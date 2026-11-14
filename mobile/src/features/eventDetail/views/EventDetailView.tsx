import { CalendarDays, CircleAlert, MapPin, Package, ScanLine, StickyNote, TriangleAlert, UserRound } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native"

import { fmtDate, fmtNum, fmtRange } from "../../../core/format"
import type { IEventItem } from "../../../entities/interfaces/events/IEventItem"
import { color, mono, tabular } from "../../../theme"
import { Header, ScanBar } from "../../../ui/domain"
import { Button, Callout, Card, Chip, EmptyState, ListCard, Meta, SectionLabel, Tag, Text, type Tone } from "../../../ui/primitives"
import type { IEventDetailViewProps } from "../interfaces/IEventDetailViewProps"

export function EventDetailView({
  event,
  currentStatus,
  statuses,
  selectedTab,
  tabs,
  sections,
  totalItems,
  scannedItems,
  scanMode,
  isLoading,
  isRefreshing,
  errorMessage,
  onBack,
  onRefresh,
  onRetry,
  onTabChange,
}: IEventDetailViewProps) {
  const subtitle = event
    ? [event.code !== "—" ? event.code : "", event.location !== "—" ? event.location : ""].filter(Boolean).join(" · ")
    : undefined

  return (
    <View style={{ flex: 1 }}>
      <Header title={event?.name ?? "Event Detail"} subtitle={subtitle} onBack={onBack} />
      {isLoading ? (
        <LoadingState />
      ) : errorMessage && !event ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : event ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={color.brand} colors={[color.brand]} />}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <EventSummary
            event={event}
            currentStatusName={currentStatus?.name ?? "Status unavailable"}
            currentStatusId={currentStatus?.id}
            statuses={statuses}
            totalItems={totalItems}
            scannedItems={scannedItems}
            scanMode={scanMode}
          />

          {errorMessage ? (
            <Callout icon={CircleAlert} tone="red" style={{ marginHorizontal: 16, marginTop: 12 }}>
              Some event data could not be refreshed. Pull down or tap Try again.
            </Callout>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityRole="radiogroup"
            contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingTop: 16 }}
          >
            {tabs.map((tab) => (
              <Chip
                key={tab.key}
                label={tab.label}
                count={tab.count}
                selected={selectedTab === tab.key}
                onPress={() => onTabChange(tab.key)}
              />
            ))}
          </ScrollView>

          {sections.length === 0 ? (
            <EmptyState icon={Package} title="No items in this view" body="Pull down to refresh the event items." />
          ) : (
            sections.map((section) => (
              <View key={section.areaName}>
                <SectionLabel
                  right={
                    <Text variant="tiny" style={tabular}>
                      {fmtNum(section.totalQty)} units
                    </Text>
                  }
                >
                  {section.areaName}
                </SectionLabel>
                <ListCard>
                  {section.items.map((item) => (
                    <EventItemRow key={item.id} item={item} scanMode={scanMode} />
                  ))}
                </ListCard>
              </View>
            ))
          )}
        </ScrollView>
      ) : null}
    </View>
  )
}

function LoadingState() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={color.brand} />
      <Text variant="meta" style={{ marginTop: 10 }}>
        Loading event detail…
      </Text>
    </View>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <EmptyState icon={CircleAlert} title="Unable to load event" body={message} />
      <Button title="Try again" size="sm" onPress={onRetry} />
    </View>
  )
}

function EventSummary({
  event,
  currentStatusName,
  currentStatusId,
  statuses,
  totalItems,
  scannedItems,
  scanMode,
}: {
  event: NonNullable<IEventDetailViewProps["event"]>
  currentStatusName: string
  currentStatusId?: number
  statuses: IEventDetailViewProps["statuses"]
  totalItems: number
  scannedItems: number
  scanMode: IEventDetailViewProps["scanMode"]
}) {
  const currentIndex = statuses.findIndex((status) => status.id === currentStatusId)
  const schedule = formatSchedule(event.startDate, event.endDate, event.eventDate)

  return (
    <Card style={{ marginHorizontal: 16, marginTop: 16, padding: 14, gap: 13 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Tag label={currentStatusName} tone="brand" />
        <Text variant="tiny" style={[{ marginLeft: "auto" }, tabular]}>
          {totalItems === 1 ? "1 item" : `${fmtNum(totalItems)} items`}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {schedule ? <Meta icon={CalendarDays}>{schedule}</Meta> : null}
        {event.location !== "—" ? <Meta icon={MapPin}>{event.location}</Meta> : null}
        {event.pic ? <Meta icon={UserRound}>PIC · {event.pic}</Meta> : null}
      </View>

      {statuses.length > 0 ? (
        <View accessibilityLabel={`Stage ${currentIndex + 1} of ${statuses.length}`}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {statuses.map((status, index) => (
              <View
                key={status.id}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: index < currentIndex ? color.green : index === currentIndex ? color.brand : color.raised,
                  opacity: index < currentIndex ? 0.75 : 1,
                }}
              />
            ))}
          </View>
          <Text variant="tiny" style={{ marginTop: 6 }}>
            {currentIndex >= 0 ? `Step ${currentIndex + 1} of ${statuses.length}` : "Status is not in the current workflow"}
          </Text>
        </View>
      ) : null}

      {scanMode ? (
        <View style={{ gap: 7 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ScanLine size={14} color={color.brand} />
            <Text variant="small" style={{ color: color.brandInk, fontWeight: "600" }}>
              Waiting scan {scanMode}
            </Text>
            <Text variant="tiny" style={[{ marginLeft: "auto" }, tabular]}>
              {fmtNum(scannedItems)}/{fmtNum(totalItems)} scanned {scanMode}
            </Text>
          </View>
          <ScanBar done={scannedItems} total={totalItems} />
        </View>
      ) : null}

      {event.description ? <Text variant="small">{event.description}</Text> : null}
      {event.notes ? (
        <Callout icon={StickyNote} tone="orange">
          {event.notes}
        </Callout>
      ) : null}
    </Card>
  )
}

function EventItemRow({ item, scanMode }: { item: IEventItem; scanMode: IEventDetailViewProps["scanMode"] }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
      <View style={{ width: 42, alignItems: "flex-end" }}>
        <Text style={[{ fontSize: 17, fontWeight: "700", color: color.ink }, tabular]}>{fmtNum(item.qty)}</Text>
        <Text variant="tiny" numberOfLines={1}>
          {item.unit}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text variant="strong" numberOfLines={1} style={{ flex: 1 }}>
            {item.name}
          </Text>
          <ScanStatus item={item} scanMode={scanMode} />
        </View>
        <Text variant="tiny" numberOfLines={1} style={{ fontFamily: mono }}>
          {[item.code !== "—" ? item.code : "", item.subAreaName, item.pic].filter(Boolean).join(" · ") || "No sub area or PIC"}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {item.ownerships.map((ownership) => (
            <Tag key={ownership} label={ownership} tone={ownership === "Outsource" ? "orange" : "purple"} />
          ))}
          {item.packageId !== null ? <Tag label={item.packageName || "Grouped"} tone="neutral" icon={Package} /> : null}
          {item.isNewProductionItem ? <Tag label="Production" tone="brand" /> : null}
          {item.isConverted ? <Tag label={`Converted · ${fmtNum(item.convertedQty)}`} tone="brand" /> : null}
          {item.brokenQty > 0 ? <Tag label={`Broken · ${fmtNum(item.brokenQty)}`} tone="red" icon={TriangleAlert} /> : null}
        </View>
        {item.notes ? <Text variant="meta">{item.notes}</Text> : null}
        {item.brokenNotes ? (
          <Text variant="meta" style={{ color: color.redInk }}>
            {item.brokenNotes}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

function ScanStatus({ item, scanMode }: { item: IEventItem; scanMode: IEventDetailViewProps["scanMode"] }) {
  const complete = scanMode === "in" ? item.scanIn : scanMode === "out" ? item.scanOut : false
  const label = scanMode ? `${scanMode.toUpperCase()} ${complete ? "done" : "pending"}` : "Not scanning"
  const tone: Tone = !scanMode ? "neutral" : complete ? "green" : "outline"
  return <Tag label={label} tone={tone} />
}

function formatSchedule(startDate: string, endDate: string, eventDate: string) {
  if (startDate && endDate) return fmtRange(startDate, endDate)
  if (eventDate) return fmtDate(eventDate)
  return ""
}
