import { Moon, Sun, SunMoon } from "lucide-react-native"
import * as React from "react"
import { View } from "react-native"

import { color } from "../../../theme"
import { ListCard, SectionLabel, Segmented, Text } from "../../../ui/primitives"
import type { IAppearanceViewProps } from "../interfaces/IAppearanceViewProps"

const ICON = { light: Sun, dark: Moon, system: SunMoon }

export function AppearanceSection({ preference, options, hint, onPreferenceChange }: IAppearanceViewProps) {
  const Icon = ICON[preference]
  return (
    <>
      <SectionLabel>Appearance</SectionLabel>
      <ListCard>
        <View style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon size={18} color={color.brand} />
            <View style={{ flex: 1 }}>
              <Text variant="strong" style={{ fontSize: 14 }}>
                Theme
              </Text>
              <Text variant="tiny">{hint}</Text>
            </View>
          </View>
          <Segmented value={preference} onChange={onPreferenceChange} options={options} />
        </View>
      </ListCard>
    </>
  )
}
