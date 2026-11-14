import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"

import type { RootStackParamList } from "../../../navigation"
import { NotFound } from "../../../screens/NotFound"
import { useEventDetailController } from "../controllers/useEventDetailController"
import { EventDetailView } from "../views/EventDetailView"

export function EventDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, "EventDetail">) {
  const eventId = Number(route.params.eventKey)

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return <NotFound onBack={() => navigation.goBack()} />
  }

  return <IntegratedEventDetail eventId={eventId} />
}

function IntegratedEventDetail({ eventId }: { eventId: number }) {
  const controller = useEventDetailController(eventId)
  return <EventDetailView {...controller} />
}
