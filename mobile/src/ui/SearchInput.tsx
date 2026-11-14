import { Search, X } from "lucide-react-native"
import * as React from "react"
import { Pressable, TextInput, View } from "react-native"

import { color, font, radius } from "../theme"

export interface SearchInputProps {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
}

export function SearchInput(props: SearchInputProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: 42,
        borderWidth: 1,
        borderColor: color.border,
        borderRadius: radius.control,
        backgroundColor: color.surface,
        paddingHorizontal: 12,
      }}
    >
      <Search size={16} color={color.faint} />
      <TextInput
        {...props}
        accessibilityLabel={props.placeholder}
        placeholderTextColor={color.faint}
        autoCorrect={false}
        style={{ flex: 1, fontSize: font.body, color: color.ink, paddingVertical: 0 }}
      />
      {!!props.value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => props.onChangeText("")}
        >
          <X size={16} color={color.muted} />
        </Pressable>
      )}
    </View>
  )
}
