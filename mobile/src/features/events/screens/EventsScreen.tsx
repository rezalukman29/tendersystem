import * as React from "react"

import { useEventsController } from "../controllers/useEventsController"
import { EventsView } from "../views/EventsView"

export function EventsScreen() {
  const controller = useEventsController()

  return <EventsView {...controller} />
}
