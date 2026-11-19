import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  type NavigationState,
  createNavigationContainerRef,
  useNavigation,
  type NavigatorScreenParams,
} from "@react-navigation/native"
import { createNativeStackNavigator, type NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Boxes, CalendarRange, CircleUserRound, ClipboardCheck, ScanLine, type LucideIcon } from "lucide-react-native"
import * as React from "react"
import { Text, View } from "react-native"

import { useResolvedColorScheme } from "./app/theme/useColorSchemeState"
import { EventsScreen } from "./features/events/screens/EventsScreen"
import { LoginScreen } from "./features/auth/screens/LoginScreen"
import { EventDetailScreen } from "./features/eventDetail/screens/EventDetailScreen"
import { StockScreen } from "./features/stock/screens/StockScreen"
import { useAppSelector } from "./redux/hooks"
import { ItemDetailScreen } from "./screens/ItemDetail"
import { OpnameScreen } from "./screens/Opname"
import { OpnameCountScreen } from "./screens/OpnameCount"
import { OpnameDetailScreen } from "./screens/OpnameDetail"
import type { IStockOpname } from "./entities/interfaces/stock/IStockOpname"
import { ProfileScreen } from "./screens/Profile"
import { RentalsScreen } from "./screens/Rentals"
import { ScannerScreen } from "./screens/Scanner"
import { ScanPickerScreen } from "./screens/ScanPicker"
import { useAppStore } from "./store"
import { color } from "./theme"

export type TabParamList = {
  Events: undefined
  ScanPicker: undefined
  Stock: undefined
  Opname: undefined
  Profile: undefined
}

export type RootStackParamList = {
  Login: undefined
  Tabs: NavigatorScreenParams<TabParamList> | undefined
  EventDetail: { eventKey: string }
  Scanner: { eventKey: string }
  ItemDetail: { name: string }
  Rentals: undefined
  OpnameCount: { warehouse: string; warehouseId: number }
  OpnameDetail: { id: number; opname?: IStockOpname }
}

export type Nav = NativeStackNavigationProp<RootStackParamList>
export const useNav = () => useNavigation<Nav>()
/** For navigating from outside a screen (tests, notifications later). */
export const navigationRef = createNavigationContainerRef<RootStackParamList>()

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

function navigationTheme(scheme: "light" | "dark") {
  const base = scheme === "dark" ? DarkTheme : DefaultTheme
  return {
    ...base,
    colors: {
      ...base.colors,
      background: color.ground,
      primary: color.brand,
      card: color.surface,
      border: color.border,
      text: color.ink,
    },
  }
}

function tabIcon(Icon: LucideIcon, badge?: number) {
  return ({ focused }: { focused: boolean }) => (
    <View style={{ width: 40, height: 26, alignItems: "center", justifyContent: "center" }}>
      <Icon size={21} color={focused ? color.brand : color.muted} strokeWidth={focused ? 2.2 : 1.8} />
      {!!badge && (
        <View
          style={{
            position: "absolute",
            top: -3,
            right: 0,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            paddingHorizontal: 4,
            backgroundColor: color.red,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{badge}</Text>
        </View>
      )}
    </View>
  )
}

function Tabs() {
  const { opnames, user } = useAppStore()
  // Admins see the opname waiting for their approval.
  const pending = user?.role === "Admin" ? opnames.filter((o) => o.status === "Pending").length : 0
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.brand,
        tabBarInactiveTintColor: color.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: { borderTopColor: color.border, height: 62, paddingTop: 6 },
      }}
    >
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarIcon: tabIcon(CalendarRange) }} />
      <Tab.Screen name="ScanPicker" component={ScanPickerScreen} options={{ title: "Scan", tabBarIcon: tabIcon(ScanLine) }} />
      <Tab.Screen name="Stock" component={StockScreen} options={{ tabBarIcon: tabIcon(Boxes) }} />
      <Tab.Screen name="Opname" component={OpnameScreen} options={{ tabBarIcon: tabIcon(ClipboardCheck, pending) }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon(CircleUserRound) }} />
    </Tab.Navigator>
  )
}

export function RootNavigator() {
  const isAuthenticated = useAppSelector((state) => state.session.status === "authenticated")
  const scheme = useResolvedColorScheme()
  // Switching the theme redraws every screen; keep the user where they were.
  const navState = React.useRef<NavigationState | undefined>(undefined)
  return (
    <NavigationContainer
      key={scheme}
      ref={navigationRef}
      theme={navigationTheme(scheme)}
      initialState={navState.current}
      onStateChange={(state) => {
        navState.current = state
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.ground } }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="Rentals" component={RentalsScreen} />
            <Stack.Screen name="OpnameDetail" component={OpnameDetailScreen} />
            <Stack.Screen name="OpnameCount" component={OpnameCountScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
