import * as React from "react"

import { useRentalsController } from "../features/rentals/controllers/useRentalsController"
import { RentalsView } from "../features/rentals/views/RentalsView"

export function RentalsScreen() {
  const rentals = useRentalsController()

  return (
    <RentalsView
      kind={rentals.kind}
      filter={rentals.filter}
      counts={rentals.counts}
      items={rentals.items}
      totalCount={rentals.totalCount}
      openCost={rentals.openCost}
      isInitialLoading={rentals.isInitialLoading}
      isRefreshing={rentals.isRefreshing}
      isFetchingNextPage={rentals.isFetchingNextPage}
      isActing={rentals.isActing}
      errorMessage={rentals.errorMessage}
      onBack={rentals.onBack}
      onKindChange={rentals.onKindChange}
      onFilterChange={rentals.onFilterChange}
      onRefresh={rentals.onRefresh}
      onRetry={rentals.onRetry}
      onEndReached={rentals.onEndReached}
      onMarkReceived={rentals.onMarkReceived}
      onMarkDone={rentals.onMarkDone}
    />
  )
}
