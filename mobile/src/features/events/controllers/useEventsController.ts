import * as React from "react"

import type { ClosingTab } from "../../../core/rules"
import { useNav } from "../../../navigation"
import { eventView } from "../../../selectors"
import { useAppStore } from "../../../store"
import type { EventsViewProps } from "../interfaces/eventsView"

const TABS: readonly ClosingTab[] = [
  "on-going",
  "upcoming",
  "ready-to-close",
  "checking-inventory",
  "returned-completed",
  "transferred",
]

export function useEventsController(): EventsViewProps {
  const navigation = useNav()
  const store = useAppStore()
  const [selectedTab, setSelectedTab] = React.useState<ClosingTab>("on-going")
  const [query, setQuery] = React.useState("")

  const allEvents = React.useMemo(
    () =>
      store.events
        .map((event) => eventView(event, store, store.stages))
        .sort((a, b) => a.event.date.localeCompare(b.event.date)),
    [store]
  )

  const tabCounts = React.useMemo(
    () =>
      TABS.reduce<Record<ClosingTab, number>>(
        (counts, tab) => ({
          ...counts,
          [tab]: allEvents.filter((event) => event.tab === tab).length,
        }),
        {
          "on-going": 0,
          upcoming: 0,
          "ready-to-close": 0,
          "checking-inventory": 0,
          "returned-completed": 0,
          transferred: 0,
        }
      ),
    [allEvents]
  )

  const events = React.useMemo(() => {
    const search = query.trim().toLowerCase()

    return allEvents
      .filter((event) => event.tab === selectedTab)
      .filter(
        ({ event }) =>
          !search ||
          `${event.name} ${event.code} ${event.location}`
            .toLowerCase()
            .includes(search)
      )
  }, [allEvents, query, selectedTab])

  const onEventPress = React.useCallback(
    (eventKey: string) => navigation.navigate("EventDetail", { eventKey }),
    [navigation]
  )

  return {
    greetingName: store.user?.name.split(" ")[0] ?? "",
    query,
    selectedTab,
    tabs: TABS,
    tabCounts,
    events,
    onQueryChange: setQuery,
    onTabChange: setSelectedTab,
    onEventPress,
  }
}
