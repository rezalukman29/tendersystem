import { ChevronRight, PackageSearch, Repeat } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from "react-native"

import { fmtNum } from "../../../core/format"
import type { WarehouseInventoryStatus } from "../../../entities/interfaces/stock/WarehouseInventoryStatus"
import { color, tabular } from "../../../theme"
import { Header, Sku } from "../../../ui/domain"
import { Button, Chip, EmptyState, Stat, StatStrip, Tag, Text, type Tone } from "../../../ui/primitives"
import { SearchInput } from "../../../ui/SearchInput"
import type { IStockListItemView } from "../interfaces/IStockListItemView"
import type { IStockViewProps } from "../interfaces/IStockViewProps"

export function StockView({
  totalItems,
  safeCount,
  criticalCount,
  warningCount,
  overdueRentalCount,
  query,
  onlyLow,
  selectedWarehouseId,
  warehouses,
  items,
  isInitialLoading,
  isRefreshing,
  isFetchingNextPage,
  errorMessage,
  onQueryChange,
  onOnlyLowToggle,
  onWarehouseChange,
  onItemPress,
  onRentalsPress,
  onRefresh,
  onRetry,
  onEndReached,
}: IStockViewProps) {
  const hasOverdueRentals = overdueRentalCount > 0

  return (
    <View style={{ flex: 1 }}>
      <Header
        large
        title="Stock"
        right={
          <Button
            size={hasOverdueRentals ? "sm" : "icon"}
            variant="outline"
            icon={Repeat}
            title={hasOverdueRentals ? `Rentals · ${overdueRentalCount} late` : undefined}
            accessibilityLabel={hasOverdueRentals ? `Rentals, ${overdueRentalCount} late` : "Rentals"}
            onPress={onRentalsPress}
          />
        }
      />
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        <StatStrip>
          <Stat value={fmtNum(totalItems)} label="Total items" />
          <Stat value={fmtNum(safeCount)} label="Safe" tone={safeCount ? color.green : undefined} />
          <Stat value={fmtNum(criticalCount)} label="Critical" tone={criticalCount ? color.red : undefined} />
          <Stat value={fmtNum(warningCount)} label="Warning" tone={warningCount ? color.orange : undefined} />
        </StatStrip>
        <SearchInput value={query} onChangeText={onQueryChange} placeholder="Item name or SKU" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          gap: 6,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 8,
        }}
      >
        <Chip label="Low only" selected={onlyLow} onPress={onOnlyLowToggle} />
        <Chip label="All warehouses" selected={selectedWarehouseId === undefined} onPress={() => onWarehouseChange(undefined)} />
        {warehouses.map((warehouse) => (
          <Chip
            key={warehouse.id}
            label={warehouse.label}
            selected={selectedWarehouseId === warehouse.id}
            onPress={() => onWarehouseChange(warehouse.id)}
          />
        ))}
      </ScrollView>

      <View style={{ flex: 1, marginTop: 8 }}>
        {isInitialLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={color.brand} />
            <Text variant="meta" style={{ marginTop: 10 }}>
              Loading stock…
            </Text>
          </View>
        ) : errorMessage && items.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <EmptyState icon={PackageSearch} title="Unable to load stock" body={errorMessage} />
            <Button title="Try again" size="sm" onPress={onRetry} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <StockRow item={item} onPress={() => onItemPress(item.name)} />}
            ItemSeparatorComponent={StockSeparator}
            ListEmptyComponent={<EmptyState icon={PackageSearch} title="No items found" />}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} /> : null}
            contentContainerStyle={{
              paddingBottom: 24,
              ...(items.length === 0 ? { flexGrow: 1 } : {}),
            }}
            style={
              items.length > 0
                ? {
                    marginHorizontal: 16,
                    borderWidth: 1,
                    borderColor: color.border,
                    borderRadius: 12,
                    backgroundColor: color.surface,
                  }
                : undefined
            }
            keyboardShouldPersistTaps="handled"
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.35}
          />
        )}
      </View>
    </View>
  )
}

function StockRow({ item, onPress }: { item: IStockListItemView; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
        },
        pressed && { backgroundColor: color.raised },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text variant="strong" numberOfLines={1} style={{ fontSize: 15 }}>
          {item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {!!item.code && <Sku code={item.code} />}
          <Text variant="tiny" numberOfLines={1} style={{ flexShrink: 1 }}>
            {item.warehouseName.replace(/^Gudang\s+/i, "")}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 3 }}>
        <Text style={[{ fontSize: 16, fontWeight: "700", color: color.ink }, tabular]}>
          {fmtNum(item.stock)}
          <Text variant="tiny">{` ${item.unit}`}</Text>
        </Text>
        <Tag label={statusLabel(item.status)} tone={statusTone(item.status)} />
      </View>
      <ChevronRight size={16} color={color.faint} />
    </Pressable>
  )
}

function StockSeparator() {
  return <View style={{ height: 1, backgroundColor: color.border }} />
}

function statusLabel(status: WarehouseInventoryStatus): string {
  if (status === "NOT_SET") return "Not set"
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function statusTone(status: WarehouseInventoryStatus): Tone {
  if (status === "CRITICAL") return "red"
  if (status === "WARNING") return "orange"
  if (status === "SAFE") return "green"
  return "neutral"
}
