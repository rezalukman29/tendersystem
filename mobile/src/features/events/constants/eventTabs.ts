import type { ClosingTab } from "../../../core/rules"

export const EVENT_TABS: readonly ClosingTab[] = [
  "on-going",
  "upcoming",
  "ready-to-close",
  "checking-inventory",
  "returned-completed",
  "transferred",
]

export const EMPTY_EVENT_TAB_COUNTS: Record<ClosingTab, number> = {
  "on-going": 0,
  upcoming: 0,
  "ready-to-close": 0,
  "checking-inventory": 0,
  "returned-completed": 0,
  transferred: 0,
}
