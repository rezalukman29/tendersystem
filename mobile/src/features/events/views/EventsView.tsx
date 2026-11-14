import { CalendarDays, CalendarX2, MapPin, ScanLine } from "lucide-react-native"
import * as React from "react"
import { Pressable, ScrollView, View } from "react-native"

import { fmtNum, fmtRange } from "../../../core/format"
import { CLOSING_LABEL } from "../../../core/rules"
import type { EventView } from "../../../selectors"
import { color, mono, tabular } from "../../../theme"
import { ClosingTag, Header, ScanBar } from "../../../ui/domain"
import { Chip, EmptyState, ListCard, Text } from "../../../ui/primitives"
import { SearchInput } from "../../../ui/SearchInput"
import type { EventsViewProps } from "../interfaces/eventsView"

export function EventsView({
  greetingName,
  query,
  selectedTab,
  tabs,
  tabCounts,
  events,
  onQueryChange,
  onTabChange,
  onEventPress,
}: EventsViewProps) {
  const hasSearch = query.trim().length > 0

  return (
    <View style={{ flex: 1 }}>
      <Header large title="Events" subtitle={`Hi ${greetingName}`} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <SearchInput value={query} onChangeText={onQueryChange} placeholder="Event, code or city" />
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityRole="radiogroup"
          contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingBottom: 12 }}
        >
          {tabs.map((tab) => (
            <Chip
              key={tab}
              label={CLOSING_LABEL[tab]}
              count={tabCounts[tab]}
              selected={selectedTab === tab}
              onPress={() => onTabChange(tab)}
            />
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title={
              hasSearch
                ? `No match for “${query}”`
                : `No ${CLOSING_LABEL[selectedTab].toLowerCase()} events`
            }
          />
        ) : (
          <ListCard>
            {events.map((event) => (
              <EventRow key={event.key} view={event} onPress={() => onEventPress(event.key)} />
            ))}
          </ListCard>
        )}
      </ScrollView>
    </View>
  )
}

function EventRow({ view, onPress }: { view: EventView; onPress: () => void }) {
  const { event, stage, lines, mode, waiting, tab } = view

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        { paddingHorizontal: 14, paddingVertical: 12, gap: 6 },
        pressed && { backgroundColor: color.raised },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontFamily: mono, fontSize: 12, color: color.muted, width: 34 }}>{event.code}</Text>
        <Text variant="strong" numberOfLines={1} style={{ flex: 1 }}>
          {event.name}
        </Text>
        {tab !== "on-going" && <ClosingTag tab={tab} />}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 42 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <CalendarDays size={13} color={color.faint} />
          <Text variant="meta" style={tabular}>
            {fmtRange(event.start, event.finish)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
          <MapPin size={13} color={color.faint} />
          <Text variant="meta" numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>
      {tab === "on-going" || tab === "ready-to-close" ? (
        <View style={{ paddingLeft: 42, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {mode && <ScanLine size={13} color={color.brand} />}
            <Text
              variant="meta"
              style={{ color: mode ? color.brandInk : color.ink2, fontWeight: "600", flex: 1 }}
              numberOfLines={1}
            >
              {stage.status}
            </Text>
            <Text variant="meta" style={tabular}>
              {mode
                ? `${fmtNum(lines.length - waiting)}/${fmtNum(lines.length)} scanned ${mode}`
                : `${fmtNum(lines.length)} items`}
            </Text>
          </View>
          {mode && <ScanBar done={lines.length - waiting} total={lines.length} />}
        </View>
      ) : null}
    </Pressable>
  )
}
