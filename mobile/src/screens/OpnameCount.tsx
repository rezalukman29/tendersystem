import { usePreventRemove } from "@react-navigation/native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"
import { Alert } from "react-native"

import { OpnameCountView } from "../features/opnameCount/views/OpnameCountView"
import { useOpnameCountController } from "../features/opnameCount/controllers/useOpnameCountController"
import type { RootStackParamList } from "../navigation"

export function OpnameCountScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "OpnameCount">) {
  const props = useOpnameCountController(route.params)

  usePreventRemove(props.isDirty && !props.isSubmitted, ({ data }) =>
    Alert.alert("Discard this count?", "Counted numbers aren't saved until you submit.", [
      { text: "Keep counting", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => navigation.dispatch(data.action) },
    ])
  )

  return <OpnameCountView {...props} />
}
