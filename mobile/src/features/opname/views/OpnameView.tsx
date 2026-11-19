import { CalendarX2, ChevronRight, Warehouse as WarehouseIcon } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, FlatList, Pressable, View } from "react-native"

import { fmtDate, fmtNum, formatIDR } from "../../../core/format"
import type { IStockOpname } from "../../../entities/interfaces/stock/IStockOpname"
import type { IWarehouse } from "../../../entities/interfaces/stock/IWarehouse"
import { color, tabular } from "../../../theme"
import { Header } from "../../../ui/domain"
import { Button, EmptyState, ListCard, SectionLabel, Tag, Text } from "../../../ui/primitives"
import type { IOpnameViewProps } from "../interfaces/IOpnameViewProps"

export function OpnameView({
  warehouses,
  history,
  totalHistoryCount,
  isWarehousesLoading,
  isHistoryLoading,
  isFetchingNextPage,
  isRefreshing,
  warehousesError,
  historyError,
  onWarehousePress,
  onHistoryPress,
  onRefresh,
  onRetry,
  onEndReached,
}: IOpnameViewProps) {
  const listHeader = React.useMemo(
    () => (
      <View>
        <SectionLabel>Count a warehouse</SectionLabel>
        {isWarehousesLoading ? (
          <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} />
        ) : warehousesError ? (
          <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 16 }}>
            <EmptyState icon={CalendarX2} title="Unable to load stock" body={warehousesError} />
            <Button title="Try again" size="sm" onPress={onRetry} />
          </View>
        ) : warehouses.length === 0 ? (
          <EmptyState icon={WarehouseIcon} title="Nothing here" />
        ) : (
          <ListCard>
            {warehouses.map((warehouse) => (
              <WarehouseRow key={warehouse.id} warehouse={warehouse} onPress={onWarehousePress} />
            ))}
          </ListCard>
        )}
        <SectionLabel>{`History · ${totalHistoryCount}`}</SectionLabel>
      </View>
    ),
    [
      isWarehousesLoading,
      warehousesError,
      warehouses,
      onRetry,
      onWarehousePress,
      totalHistoryCount,
    ]
  )

  return (
    <View style={{ flex: 1 }}>
      <Header large title="Stock opname" subtitle="Physical count" />
      <FlatList
        data={history}
        keyExtractor={(record) => String(record.id)}
        ListHeaderComponent={listHeader}
        renderItem={({ item, index }) => (
          <HistoryRow
            record={item}
            isFirst={index === 0}
            isLast={index === history.length - 1}
            onPress={onHistoryPress}
          />
        )}
        ItemSeparatorComponent={HistorySeparator}
        ListEmptyComponent={
          isHistoryLoading ? (
            <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} />
          ) : historyError ? (
            <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 16 }}>
              <EmptyState icon={CalendarX2} title="Unable to load stock" body={historyError} />
              <Button title="Try again" size="sm" onPress={onRetry} />
            </View>
          ) : (
            <EmptyState icon={CalendarX2} title="Nothing here" />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={color.brand} style={{ paddingVertical: 18 }} /> : null
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
      />
    </View>
  )
}

function WarehouseRow({
  warehouse,
  onPress,
}: {
  warehouse: IWarehouse
  onPress: (warehouse: IWarehouse) => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Count items in ${warehouse.name}`}
      onPress={() => onPress(warehouse)}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
        pressed && { backgroundColor: color.raised },
      ]}
    >
      <WarehouseIcon size={18} color={color.muted} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="strong" numberOfLines={1} style={{ fontSize: 14 }}>
          {warehouse.name}
        </Text>
        {!!warehouse.location && (
          <Text variant="tiny" numberOfLines={1}>
            {warehouse.location}
          </Text>
        )}
      </View>
      <Text variant="meta" style={tabular}>{`${fmtNum(warehouse.totalItems)} rows`}</Text>
      <ChevronRight size={16} color={color.faint} />
    </Pressable>
  )
}

function HistoryRow({
  record,
  isFirst,
  isLast,
  onPress,
}: {
  record: IStockOpname
  isFirst: boolean
  isLast: boolean
  onPress: (record: IStockOpname) => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(record)}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginHorizontal: 16,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: color.border,
          ...(isFirst ? {
            borderTopWidth: 1,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          } : {}),
          ...(isLast ? {
            borderBottomWidth: 1,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          } : {}),
        },
        pressed && { backgroundColor: color.raised },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="strong" numberOfLines={1} style={{ fontSize: 14 }}>
          {`#${record.id} · ${record.warehouse ?? "—"}`}
        </Text>
        <Text variant="tiny" numberOfLines={2} style={tabular}>
          {`${record.period} · ${fmtDate(record.appliedAt.slice(0, 10))} · ${record.items.length} lines · ${formatIDR(record.amount)}`}
        </Text>
      </View>
      <Tag
        label={record.status}
        tone={record.status === "Pending" ? "orange" : "green"}
      />
      <ChevronRight size={16} color={color.faint} />
    </Pressable>
  )
}

function HistorySeparator() {
  return <View style={{ height: 1, backgroundColor: color.border, marginHorizontal: 16 }} />
}
