import { CalendarX2, Repeat } from "lucide-react-native"
import * as React from "react"
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  View,
} from "react-native"

import { formatIDR } from "../../../core/format"
import { KIND_TEXT } from "../../../core/rules"
import type { RentalKind } from "../../../entities/interfaces/rentals/IRentalRecord"
import { color } from "../../../theme"
import { Header } from "../../../ui/domain"
import { Button, Chip, EmptyState, SectionLabel, Segmented, Text } from "../../../ui/primitives"
import type { IRentalsViewProps, RentalFilter } from "../interfaces/IRentalsViewProps"
import { RentalRow } from "./RentalRow"

const FILTERS: RentalFilter[] = ["all", "open", "Requested", "Received", "Overdue", "Done"]

export function RentalsView({
  kind,
  filter,
  counts,
  items,
  totalCount,
  openCost,
  isInitialLoading,
  isRefreshing,
  isFetchingNextPage,
  isActing,
  errorMessage,
  onBack,
  onKindChange,
  onFilterChange,
  onRefresh,
  onRetry,
  onEndReached,
  onMarkReceived,
  onMarkDone,
}: IRentalsViewProps) {
  const labels = KIND_TEXT[kind]

  return (
    <View style={{ flex: 1 }}>
      <Header title="Rent & Outsource" subtitle="Never our stock. Always the full qty." onBack={onBack} />
      <View style={{ padding: 16, paddingBottom: 0, gap: 10 }}>
        <Segmented
          value={kind}
          onChange={onKindChange}
          options={[
            { value: "loan", label: "Rent" },
            { value: "outsource", label: "Outsource" },
          ]}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {FILTERS.map((value) => (
          <Chip
            key={value}
            label={getFilterLabel(value, labels)}
            count={counts[value]}
            selected={filter === value}
            onPress={() => onFilterChange(value)}
          />
        ))}
      </ScrollView>
      {isInitialLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={color.brand} />
        </View>
      ) : errorMessage && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <EmptyState icon={CalendarX2} title={errorMessage} />
          <Button title="Try again" size="sm" onPress={onRetry} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.record.kind}-${item.record.id}`}
          renderItem={({ item }) => (
            <RentalRow
              item={item}
              isActing={isActing}
              onMarkReceived={() => onMarkReceived(item.record)}
              onMarkDone={() => onMarkDone(item.record)}
            />
          )}
          ItemSeparatorComponent={RentalSeparator}
          ListHeaderComponent={
            <SectionLabel
              right={openCost === undefined ? undefined : <Text variant="tiny">{`Open ${formatIDR(openCost)}`}</Text>}
            >
              {`${kind === "loan" ? "RENT" : "OUTSOURCE"} · ${totalCount}`}
            </SectionLabel>
          }
          ListEmptyComponent={<EmptyState icon={Repeat} title="Nothing here" />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} />
            ) : errorMessage ? (
              <View style={{ alignItems: "center", gap: 8, padding: 16 }}>
                <Text variant="meta">{errorMessage}</Text>
                <Button title="Try again" size="sm" onPress={onRetry} />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24, ...(items.length === 0 ? { flexGrow: 1 } : {}) }}
          style={{
            flex: 1,
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: color.border,
            borderRadius: 12,
            backgroundColor: color.surface,
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

function getFilterLabel(filter: RentalFilter, labels: (typeof KIND_TEXT)[RentalKind]): string {
  if (filter === "all") return "All"
  if (filter === "open") return "Open"
  if (filter === "Received") return labels.received
  if (filter === "Done") return labels.done
  return filter
}

function RentalSeparator() {
  return <View style={{ height: 1, backgroundColor: color.border }} />
}
