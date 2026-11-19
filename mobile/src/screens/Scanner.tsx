import { useIsFocused } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AlertCircle, Camera as CameraIcon, Check, PackageCheck, X } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, FlatList, Image, Linking, Pressable, RefreshControl, StyleSheet, Vibration, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera"

import { parseEventItemQr, type EventItemScanType } from "../core/eventItemQr"
import { fmtNum } from "../core/format"
import { ApiError } from "../data/ApiError"
import type { IEventItem } from "../entities/interfaces/events/IEventItem"
import { useEventDetail } from "../hooks/api/useEventDetail"
import { useEventItems } from "../hooks/api/useEventItems"
import { useEventStatuses } from "../hooks/api/useEventStatuses"
import { useScanEventItem } from "../hooks/api/useScanEventItem"
import type { RootStackParamList } from "../navigation"
import { color, font, mono, radius, tabular } from "../theme"
import { Sheet } from "../ui/sheet"
import { Header, IconButton, ScanBar } from "../ui/domain"
import { Button, EmptyState, Text } from "../ui/primitives"
import { useToast } from "../ui/toast"
import { NotFound } from "./NotFound"

type ScanMode = EventItemScanType
const STORAGE_BOOQABLE = "https://storage-booqable.emi.web.id/booqable/"
const STORAGE_DEMOCREATION = "https://democreation.site/home/public/"
const LEGACY_BOOQABLE_URL = "http://66.42.48.163:9000/booqable/"

export function ScannerScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, "Scanner">) {
  const eventId = Number(route.params.eventKey)

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return <NotFound onBack={() => navigation.goBack()} />
  }

  return <EventScanner eventId={eventId} onBack={() => navigation.goBack()} />
}

function EventScanner({ eventId, onBack }: { eventId: number; onBack: () => void }) {
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const focused = useIsFocused()
  const detailQuery = useEventDetail(eventId)
  const itemsQuery = useEventItems(eventId)
  const statusesQuery = useEventStatuses()
  const scanMutation = useScanEventItem(eventId)
  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()

  const [cameraOn, setCameraOn] = React.useState(false)
  const [showDone, setShowDone] = React.useState(false)
  const [selectedScan, setSelectedScan] = React.useState<{ item: IEventItem; type: ScanMode } | null>(null)
  const lastScan = React.useRef({ code: "", at: 0 })
  const scanInProgress = React.useRef(false)

  const status = statusesQuery.data?.find((item) => item.id === detailQuery.data?.statusId)
  const mode = status?.action === "SCAN_IN" ? "IN" : status?.action === "SCAN_OUT" ? "OUT" : null
  const items = React.useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const isScanned = React.useCallback((item: IEventItem) => (mode === "IN" ? item.scanIn : mode === "OUT" ? item.scanOut : false), [mode])
  const waitingItems = items.filter((item) => !isScanned(item))
  const doneItems = items.filter(isScanned)
  const shownItems = showDone ? doneItems : waitingItems
  const refetch = React.useCallback(() => {
    detailQuery.refetch()
    itemsQuery.refetch()
    statusesQuery.refetch()
  }, [detailQuery, itemsQuery, statusesQuery])

  const handleCode = React.useCallback(
    (rawCode: string) => {
      const payload = parseEventItemQr(rawCode)
      if (!payload) {
        toast.show("QR Code not valid", "error")
        Vibration.vibrate([0, 60, 40, 60])
        return
      }

      const item = items.find((candidate) => candidate.id === payload.itemId)
      if (!item) {
        toast.show("Barang ini tidak ada di event ini.", "error")
        Vibration.vibrate([0, 60, 40, 60])
        return
      }
      if (!mode || payload.type !== mode) {
        toast.show(`QR ini untuk scan ${payload.type.toLowerCase()}, bukan tahap event saat ini.`, "error")
        Vibration.vibrate([0, 60, 40, 60])
        return
      }
      setSelectedScan({ item, type: payload.type })
      Vibration.vibrate(20)
    },
    [items, mode, toast]
  )

  const confirmScan = async () => {
    if (!selectedScan || scanInProgress.current) return
    const wasAlreadyScanned = isScanned(selectedScan.item)
    scanInProgress.current = true
    try {
      const message = await scanMutation.mutateAsync({ id: selectedScan.item.id, type: selectedScan.type })
      setSelectedScan(null)
      setShowDone(wasAlreadyScanned)
      toast.show(message || "Item berhasil di-scan.", "success")
      Vibration.vibrate(35)
    } catch (error) {
      toast.show(error instanceof ApiError ? error.message : "Gagal menyimpan scan item.", "error")
      Vibration.vibrate([0, 60, 40, 60])
    } finally {
      scanInProgress.current = false
    }
  }

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      const value = codes[0]?.value
      const now = Date.now()
      if (!value || scanMutation.isPending || (value === lastScan.current.code && now - lastScan.current.at < 2500)) return
      lastScan.current = { code: value, at: now }
      handleCode(value)
    },
  })

  const toggleCamera = async () => {
    if (cameraOn) {
      setCameraOn(false)
      return
    }
    try {
      if (!hasPermission && !(await requestPermission())) {
        toast.show("Izin kamera belum diberikan. Izinkan kamera di Settings untuk melakukan scan.", "error")
        try {
          await Linking.openSettings()
        } catch {
          toast.show("Tidak dapat membuka Settings.", "error")
        }
        return
      }
      if (!device) {
        toast.show("Kamera tidak ditemukan.", "error")
        return
      }
      setCameraOn(true)
    } catch (error) {
      toast.show(error instanceof Error ? error.message : "Tidak dapat mengakses kamera.", "error")
    }
  }

  const loading = detailQuery.isPending || itemsQuery.isPending || statusesQuery.isPending
  const errorMessage = detailQuery.error?.message ?? itemsQuery.error?.message ?? statusesQuery.error?.message

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Loading event…" onBack={onBack} />
        <View style={styles.center}>
          <ActivityIndicator color={color.brand} />
        </View>
      </View>
    )
  }

  if (errorMessage || !detailQuery.data) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Scan event" onBack={onBack} />
        <View style={styles.center}>
          <EmptyState icon={AlertCircle} title="Unable to load event" body={errorMessage ?? "Event tidak ditemukan."} />
          <Button title="Try again" size="sm" onPress={refetch} />
        </View>
      </View>
    )
  }

  if (!mode) {
    return (
      <View style={{ flex: 1 }}>
        <Header title={detailQuery.data.name} onBack={onBack} />
        <View style={styles.center}>
          <EmptyState icon={AlertCircle} title={`${status?.name ?? "Status event"} tidak membutuhkan scan`} />
        </View>
      </View>
    )
  }

  const capture = (
    <View style={{ backgroundColor: color.dark, paddingTop: insets.top }}>
      <View style={styles.darkHeader}>
        <IconButton icon={X} label="Close scanner" tone="dark" onPress={onBack} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="label" style={{ color: mode === "IN" ? "#a5b4fc" : "#fdba74" }}>
            {`SCAN ${mode}`}
          </Text>
          <Text variant="strong" style={{ color: "#fff" }} numberOfLines={1} accessibilityRole="header">
            {detailQuery.data.name}
          </Text>
        </View>
        <Text style={[{ color: "#fff", fontSize: 22, fontWeight: "700" }, tabular]}>
          {doneItems.length}
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: "500" }}>{`/${items.length}`}</Text>
        </Text>
      </View>
      <ScanBar done={doneItems.length} total={items.length} dark style={{ marginHorizontal: 16 }} />

      <View style={styles.viewfinder}>
        {cameraOn && device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={focused && cameraOn && !scanMutation.isPending && !selectedScan}
            codeScanner={codeScanner}
          />
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel={cameraOn ? "Turn camera off" : "Turn camera on"} onPress={toggleCamera} style={StyleSheet.absoluteFill}>
          <Corners />
          {!cameraOn ? (
            <View style={styles.tapHint}>
              {device ? <CameraIcon size={16} color="rgba(255,255,255,0.85)" /> : null}
              <Text style={{ color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>{device ? "Tap untuk mulai scan" : "Kamera tidak tersedia"}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <FlatList
        data={shownItems}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View>
            {capture}
            <View style={{ flexDirection: "row", gap: 8, padding: 16, paddingBottom: 10 }}>
              <Button size="sm" variant={showDone ? "secondary" : "primary"} title={`Perlu scan · ${waitingItems.length}`} onPress={() => setShowDone(false)} />
              <Button size="sm" variant={showDone ? "primary" : "secondary"} title={`Selesai · ${doneItems.length}`} onPress={() => setShowDone(true)} />
            </View>
            {itemsQuery.error ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text variant="tiny" style={{ color: color.red, flex: 1 }}>{itemsQuery.error.message}</Text>
                <Button title="Retry" size="sm" onPress={refetch} />
              </View>
            ) : null}
          </View>
        }
        refreshControl={<RefreshControl refreshing={itemsQuery.isRefetching} onRefresh={refetch} tintColor={color.brand} colors={[color.brand]} />}
        contentContainerStyle={{ paddingBottom: waitingItems.length === 0 ? 100 : 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon={PackageCheck} title={showDone ? "Belum ada item yang selesai di-scan" : "Semua item sudah di-scan"} />}
        renderItem={({ item, index }) => (
          <EventItemRow item={item} mode={mode} scanned={isScanned(item)} first={index === 0} last={index === shownItems.length - 1} />
        )}
      />
      {waitingItems.length === 0 ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Button size="lg" variant="positive" title="Selesai · kembali ke daftar event" onPress={onBack} />
        </View>
      ) : null}
      <Sheet
        visible={!!selectedScan}
        onClose={() => {
          if (!scanMutation.isPending) setSelectedScan(null)
        }}
        title={selectedScan?.item.name ?? "Item"}
        subtitle={selectedScan?.item.code !== "—" ? selectedScan?.item.code : undefined}
      >
        {selectedScan ? (
          <ScanItemDetails
            item={selectedScan.item}
            type={selectedScan.type}
            isSubmitting={scanMutation.isPending}
            onScan={confirmScan}
          />
        ) : null}
      </Sheet>
    </View>
  )
}

function ScanItemDetails({
  item,
  type,
  isSubmitting,
  onScan,
}: {
  item: IEventItem
  type: ScanMode
  isSubmitting: boolean
  onScan: () => void
}) {
  const imageUri = getItemPhotoUri(item.photoUrl)

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 14 }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.itemPhoto} resizeMode="cover" accessibilityLabel={`${item.name} photo`} />
      ) : (
        <View style={[styles.itemPhoto, styles.photoPlaceholder]}>
          <PackageCheck size={30} color={color.faint} />
        </View>
      )}
      <View style={{ gap: 8 }}>
        <ItemInfo label="Qty" value={`${fmtNum(item.qty)} ${item.unit}`} />
        <ItemInfo label="Area" value={item.areaName || "—"} />
        <ItemInfo label="Sub area" value={item.subAreaName || "—"} />
      </View>
      <Button
        size="lg"
        variant="positive"
        title={isSubmitting ? "Scanning…" : isScannedForType(item, type) ? "Scan again" : `Scan ${type}`}
        disabled={isSubmitting}
        onPress={onScan}
      />
    </View>
  )
}

function isScannedForType(item: IEventItem, type: ScanMode): boolean {
  return type === "IN" ? item.scanIn : item.scanOut
}

function ItemInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.itemInfo}>
      <Text variant="meta">{label}</Text>
      <Text variant="strong" style={{ flex: 1, textAlign: "right" }} numberOfLines={2}>
        {value}
      </Text>
    </View>
  )
}

function getItemPhotoUri(photo: string): string | undefined {
  if (!photo) return undefined
  if (/^https?:\/\//i.test(photo)) {
    return photo.replace(LEGACY_BOOQABLE_URL, STORAGE_BOOQABLE)
  }
  const baseUrl = photo.includes("users/")
    ? STORAGE_BOOQABLE
    : STORAGE_DEMOCREATION
  return `${baseUrl}${photo.replace(/^\/+/, "")}`
}

function EventItemRow({ item, mode, scanned, first, last }: { item: IEventItem; mode: ScanMode; scanned: boolean; first: boolean; last: boolean }) {
  return (
    <View style={[styles.listRow, first && styles.listFirst, last && styles.listLast]}>
      <View style={{ width: 44, alignItems: "flex-end" }}>
        <Text style={[{ fontSize: 17, fontWeight: "700", color: color.ink }, tabular]}>{fmtNum(item.qty)}</Text>
        <Text variant="tiny" numberOfLines={1}>{item.unit}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text variant="strong" numberOfLines={1}>{item.name}</Text>
        <Text variant="tiny" numberOfLines={1} style={{ fontFamily: mono }}>
          {[item.code !== "—" ? item.code : "", item.areaName, item.subAreaName].filter(Boolean).join(" · ") || "No item code"}
        </Text>
      </View>
      <View style={[styles.status, scanned && styles.statusDone]}>
        {scanned ? <Check size={12} color={color.greenInk} strokeWidth={3} /> : null}
        <Text style={{ color: scanned ? color.greenInk : mode === "IN" ? color.brandInk : color.orangeInk, fontSize: font.tiny, fontWeight: "700" }}>
          {scanned ? "Done" : `Scan ${mode.toLowerCase()}`}
        </Text>
      </View>
    </View>
  )
}

function Corners() {
  const corner = { position: "absolute" as const, width: 26, height: 26, borderColor: "rgba(255,255,255,0.75)" }
  return (
    <>
      <View style={[corner, { top: 18, left: 18, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 }]} />
      <View style={[corner, { top: 18, right: 18, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 }]} />
      <View style={[corner, { bottom: 18, left: 18, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 }]} />
      <View style={[corner, { bottom: 18, right: 18, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 }]} />
    </>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  darkHeader: { flexDirection: "row", alignItems: "center", gap: 10, height: 56, paddingHorizontal: 12 },
  viewfinder: { height: 220, marginHorizontal: 16, marginTop: 14, borderRadius: radius.card, overflow: "hidden", backgroundColor: color.darkSurface },
  tapHint: { position: "absolute", alignSelf: "center", top: 88, flexDirection: "row", alignItems: "center", gap: 6 },
  itemPhoto: { width: "100%", height: 190, borderRadius: radius.control, backgroundColor: color.raised },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  itemInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  listRow: { marginHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: color.surface, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: color.border },
  listFirst: { borderTopWidth: 1, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  listLast: { borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card },
  status: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7, backgroundColor: color.brandSoft },
  statusDone: { backgroundColor: color.greenSoft },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: color.surface, borderTopWidth: 1, borderTopColor: color.border },
})
