import { Cloud, CloudOff, LogOut } from "lucide-react-native"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import { stamp } from "../core/format"
import { useAppearanceController } from "../features/appearance/controllers/useAppearanceController"
import { AppearanceSection } from "../features/appearance/views/AppearanceSection"
import { useLogout } from "../features/auth/hooks/useLogout"
import { useAppStore } from "../store"
import { color, mono, radius, tabular } from "../theme"
import { Header } from "../ui/domain"
import { Button, Card, ListCard, SectionLabel, Tag, Text } from "../ui/primitives"
import { useToast } from "../ui/toast"

const ROLE_NOTE = {
  Admin: "Can approve stock opname.",
  Staff: "Scans, reports and counts. Opname approval is for admins.",
  Viewer: "View only on this phone.",
}

export function ProfileScreen() {
  const toast = useToast()
  const clearSession = useLogout()
  const appearance = useAppearanceController()
  const { user, online, outbox, lastSyncAt, forceOffline, setForceOffline, logout: clearLegacySession } = useAppStore()
  if (!user) return null

  const signOut = () => {
    if (outbox.length > 0) {
      toast.show(`${outbox.length} changes haven't been sent yet. Wait until you're online before signing out.`, "error")
      return
    }

    clearLegacySession()
    clearSession().catch(() => toast.show("Sign out failed. Please try again.", "error"))
  }

  return (
    <View style={{ flex: 1 }}>
      <Header large title="Profile" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Card style={{ marginHorizontal: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 48, height: 48, borderRadius: radius.control, backgroundColor: color.brandSoft, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: color.brandInk, fontWeight: "700", fontSize: 17 }}>
              {user.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="heading">{user.name}</Text>
            <Text variant="tiny" style={{ fontFamily: mono }}>
              {user.email}
            </Text>
          </View>
          <Tag label={user.role} tone={user.role === "Admin" ? "brand" : "neutral"} />
        </Card>
        <Text variant="tiny" style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {ROLE_NOTE[user.role]}
        </Text>

        <AppearanceSection {...appearance} />

        <SectionLabel>Sync</SectionLabel>
        <ListCard>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
            {online ? <Cloud size={18} color={color.brand} /> : <CloudOff size={18} color={color.orange} />}
            <View style={{ flex: 1 }}>
              <Text variant="strong" style={{ fontSize: 14 }}>
                {online ? "Online" : "Offline"}
              </Text>
              <Text variant="tiny" style={tabular}>
                {outbox.length > 0 ? `${outbox.length} waiting to send` : `Last sent ${stamp(lastSyncAt)}`}
              </Text>
            </View>
          </View>
          {outbox.slice(-4).map((o) => (
            <View key={o.id} style={{ flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingVertical: 9 }}>
              <Text variant="tiny" style={[{ width: 40 }, tabular]}>
                {stamp(o.at).slice(-5)}
              </Text>
              <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {o.label}
              </Text>
            </View>
          ))}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="strong" style={{ fontSize: 14 }}>
                Offline test mode
              </Text>
              <Text variant="tiny">Practise with no signal</Text>
            </View>
            <Switch accessibilityLabel="Offline test mode" value={forceOffline} onValueChange={setForceOffline} trackColor={{ true: color.brand, false: color.control }} thumbColor="#fff" />
          </View>
        </ListCard>

        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Button variant="ghost" icon={LogOut} title="Sign out" onPress={signOut} />
        </View>
        <Text variant="tiny" style={{ textAlign: "center", paddingTop: 24 }}>
          EMI mobile · v0.4
        </Text>
      </ScrollView>
    </View>
  )
}
