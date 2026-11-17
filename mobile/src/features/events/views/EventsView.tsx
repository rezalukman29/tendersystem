import { CalendarDays, CalendarX2, MapPin, ScanLine } from "lucide-react-native"
import * as React from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  View,
} from "react-native"

import { fmtDate, fmtNum, fmtRange } from "../../../core/format"
import { CLOSING_LABEL } from "../../../core/rules"
import { color, mono, tabular } from "../../../theme"
import { ClosingTag, Header, ScanBar } from "../../../ui/domain"
import { Button, Chip, EmptyState, Text } from "../../../ui/primitives"
import { SearchInput } from "../../../ui/SearchInput"
import type { IEventListItemView } from "../interfaces/IEventListItemView"
import type { IEventsViewProps } from "../interfaces/IEventsViewProps"

export function EventsView({
  greetingName,
  query,
  selectedTab,
  tabs,
  tabCounts,
  events,
  isInitialLoading,
  isRefreshing,
  isFetchingNextPage,
  errorMessage,
  onQueryChange,
  onTabChange,
  onEventPress,
  onRefresh,
  onRetry,
  onEndReached,
}: IEventsViewProps) {
  const hasSearch = query.trim().length > 0

  return (
    <View style={{ flex: 1 }}>
      <Header large title="Events" subtitle={`Hi ${greetingName}`} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <SearchInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Event, code or city"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
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

      {isInitialLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={color.brand} />
          <Text variant="meta" style={{ marginTop: 10 }}>Loading events…</Text>
        </View>
      ) : errorMessage && events.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <EmptyState icon={CalendarX2} title="Unable to load events" body={errorMessage} />
          <Button title="Try again" size="sm" onPress={onRetry} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventRow view={item} onPress={() => onEventPress(item.id)} />
          )}
          ItemSeparatorComponent={EventSeparator}
          ListEmptyComponent={
            <EmptyState
              icon={CalendarX2}
              title={
                hasSearch
                  ? `No match for “${query}”`
                  : `No ${CLOSING_LABEL[selectedTab].toLowerCase()} events`
              }
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} />
            ) : null
          }
          contentContainerStyle={{
            paddingBottom: 24,
            ...(events.length === 0 ? { flexGrow: 1 } : {}),
          }}
          style={{
            flex: 1,
            ...(events.length > 0
              ? {
                  marginHorizontal: 16,
                  borderWidth: 1,
                  borderColor: color.border,
                  borderRadius: 12,
                  backgroundColor: color.surface,
                }
              : {}),
          }}
          keyboardShouldPersistTaps="handled"
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
        />
      )}
    </View>
  )
}

function EventRow({ view, onPress }: { view: IEventListItemView; onPress: () => void }) {
  const hasStageDetails = view.tab === "on-going" || view.tab === "ready-to-close"

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
        <Text
          style={{ fontFamily: mono, fontSize: 12, color: color.muted, width: 34 }}
          numberOfLines={1}
        >
          {view.code}
        </Text>
        <Text variant="strong" numberOfLines={1} style={{ flex: 1 }}>{view.name}</Text>
        {view.tab !== "on-going" && <ClosingTag tab={view.tab} />}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 42 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <CalendarDays size={13} color={color.faint} />
          <Text variant="meta" style={tabular}>
            {formatEventRange(view.startDate, view.endDate)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
          <MapPin size={13} color={color.faint} />
          <Text variant="meta" numberOfLines={1}>{view.location}</Text>
        </View>
      </View>
      {hasStageDetails ? (
        <View style={{ paddingLeft: 42, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {view.scanMode && <ScanLine size={13} color={color.brand} />}
            <Text
              variant="meta"
              style={{
                color: view.scanMode ? color.brandInk : color.ink2,
                fontWeight: "600",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {view.stageName}
            </Text>
            <Text variant="meta" style={tabular}>
              {view.scanMode
                ? `${fmtNum(view.scannedItems)}/${fmtNum(view.totalItems)} scanned ${view.scanMode}`
                : `${fmtNum(view.totalItems)} items`}
            </Text>
          </View>
          {view.scanMode && <ScanBar done={view.scannedItems} total={view.totalItems} />}
        </View>
      ) : null}
    </Pressable>
  )
}

function EventSeparator() {
  return <View style={{ height: 1, backgroundColor: color.border }} />
}

function formatEventRange(startDate: string, endDate: string): string {
  if (!startDate) return "—"
  if (!endDate) return fmtDate(startDate)
  return fmtRange(startDate, endDate)
}
