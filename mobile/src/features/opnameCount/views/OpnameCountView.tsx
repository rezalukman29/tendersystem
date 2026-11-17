import { CalendarX2, Warehouse as WarehouseIcon } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, FlatList, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { fmtNum, formatIDR } from "../../../core/format"
import type { IWarehouseStockItem } from "../../../entities/interfaces/stock/IWarehouseStockItem"
import { color, radius, tabular } from "../../../theme"
import { Header, Sku } from "../../../ui/domain"
import { SearchInput } from "../../../ui/SearchInput"
import { Sheet } from "../../../ui/sheet"
import { Button, Callout, EmptyState, Field, Input, Segmented, Stepper, Text } from "../../../ui/primitives"
import type { IOpnameCountViewProps } from "../interfaces/IOpnameCountViewProps"

export function OpnameCountView(props: IOpnameCountViewProps) {
  const insets = useSafeAreaInsets()
  const blocked = props.pendingOpname || !!props.pendingCheckError || props.isPendingCheckLoading
  const data = blocked ? [] : props.rows

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={`Count · ${props.warehouse}`}
        subtitle={`${fmtNum(props.totalRows)} rows · defaults to system stock`}
        onBack={props.onBack}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 8 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <SearchInput value={props.search} onChangeText={props.onSearchChange} placeholder="Find item" />
            {props.isPendingCheckLoading && <ActivityIndicator color={color.brand} />}
            {props.pendingOpname && (
              <Callout icon={CalendarX2} tone="orange">
                Another opname is waiting for approval.
              </Callout>
            )}
            {props.pendingCheckError && (
              <Callout icon={CalendarX2} tone="red">
                {props.pendingCheckError}
              </Callout>
            )}
            {props.inventoryError && props.rows.length > 0 && (
              <Callout icon={CalendarX2} tone="red">
                {props.inventoryError}
              </Callout>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CountRow
            item={item}
            count={props.counts[item.id] ?? { actual: item.warehouseStock, condition: "Good", note: "" }}
            onChange={(patch) => props.onCountChange(item, patch)}
          />
        )}
        ListEmptyComponent={
          props.isInventoryLoading ? (
            <ActivityIndicator color={color.brand} style={{ paddingVertical: 28 }} />
          ) : props.inventoryError ? (
            <View style={{ alignItems: "center", gap: 8 }}>
              <EmptyState icon={CalendarX2} title="Unable to load stock" body={props.inventoryError} />
              <Button title="Try again" size="sm" onPress={props.onRetry} />
            </View>
          ) : props.pendingCheckError ? (
            <View style={{ alignItems: "center", gap: 8 }}>
              <EmptyState icon={CalendarX2} title="Unable to verify pending stock opname" />
              <Button title="Try again" size="sm" onPress={props.onRetry} />
            </View>
          ) : props.pendingOpname ? (
            <EmptyState icon={CalendarX2} title="Another opname is waiting for approval." />
          ) : props.rows.length === 0 ? (
            <EmptyState icon={WarehouseIcon} title="No items in this warehouse" />
          ) : (
            <EmptyState icon={WarehouseIcon} title="Nothing here" />
          )
        }
        ListFooterComponent={
          props.isFetchingNextPage ? <ActivityIndicator color={color.brand} style={{ paddingVertical: 16 }} /> : null
        }
        refreshing={props.isRefreshing}
        onRefresh={props.onRefresh}
        onEndReached={props.onEndReached}
        onEndReachedThreshold={0.4}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 14),
          backgroundColor: color.surface,
          borderTopWidth: 1,
          borderTopColor: color.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="strong" style={tabular}>{`${props.changedCount} to report`}</Text>
          <Text variant="tiny" style={[tabular, props.varianceValue < 0 && { color: color.red }]}>
            {`Variance ${formatIDR(props.varianceValue)}`}
          </Text>
        </View>
        <Button
          variant="positive"
          title="Submit"
          onPress={props.onOpenSubmit}
          disabled={!props.changedCount || blocked || props.isSubmitting}
          style={{ minWidth: 120 }}
        />
      </View>

      <Sheet
        visible={props.submitModalVisible}
        onClose={props.onCloseSubmit}
        title="Submit stock opname"
        subtitle={`${props.changedCount} items will be sent for approval`}
      >
        <View style={{ padding: 16, gap: 12 }}>
          <Field label="Period" error={props.periodError}>
            <Input
              value={props.period}
              onChangeText={props.onPeriodChange}
              placeholder="e.g. Nov 2026"
              editable={!props.isSubmitting}
              accessibilityLabel="Period"
            />
          </Field>
          <Field label="Remark" error={props.remarkError}>
            <Input
              value={props.remark}
              onChangeText={props.onRemarkChange}
              placeholder="Add a remark"
              editable={!props.isSubmitting}
              accessibilityLabel="Remark"
            />
          </Field>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <Button title="Cancel" variant="outline" onPress={props.onCloseSubmit} disabled={props.isSubmitting} />
            <Button
              title={props.isSubmitting ? "Submitting..." : "Submit for approval"}
              variant="positive"
              onPress={props.onConfirmSubmit}
              disabled={props.isSubmitting}
            />
          </View>
        </View>
      </Sheet>
    </View>
  )
}

function CountRow({
  item,
  count,
  onChange,
}: {
  item: IWarehouseStockItem
  count: { actual: number; condition: "Good" | "Poor"; note: string }
  onChange: (patch: Partial<{ actual: number; condition: "Good" | "Poor"; note: string }>) => void
}) {
  const diff = count.actual - item.warehouseStock
  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: diff !== 0 || count.condition === "Poor" ? color.orange : color.border,
        borderRadius: radius.card,
        padding: 12,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text variant="strong" numberOfLines={1} style={{ fontSize: 14 }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {!!item.code && <Sku code={item.code} />}
            {!!item.unit && <Text variant="tiny">{item.unit}</Text>}
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text variant="tiny">System</Text>
          <Text style={[{ fontWeight: "700" }, tabular]}>{fmtNum(item.warehouseStock)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Stepper
          label={`Actual ${item.name}`}
          value={count.actual}
          max={Number.MAX_SAFE_INTEGER}
          onChange={(actual) => onChange({ actual })}
        />
        <Text
          style={[
            { width: 44, textAlign: "right", fontWeight: "700", color: diff === 0 ? color.faint : diff < 0 ? color.red : color.green },
            tabular,
          ]}
        >
          {diff === 0 ? "±0" : `${diff > 0 ? "+" : ""}${fmtNum(diff)}`}
        </Text>
        <Segmented
          style={{ flex: 1, minWidth: 0 }}
          value={count.condition}
          onChange={(condition) => onChange({ condition })}
          options={[
            { value: "Good", label: "Good" },
            { value: "Poor", label: "Poor", tone: color.orange },
          ]}
        />
      </View>
      {count.condition === "Poor" && (
        <Input
          value={count.note}
          onChangeText={(note) => onChange({ note })}
          placeholder="Why poor? e.g. faded, chipped"
          accessibilityLabel={`Note for ${item.name}`}
        />
      )}
    </View>
  )
}
