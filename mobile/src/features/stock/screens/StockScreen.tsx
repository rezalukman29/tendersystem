import * as React from "react"

import { useStockController } from "../controllers/useStockController"
import { StockView } from "../views/StockView"

export function StockScreen() {
  const props = useStockController()
  return <StockView {...props} />
}
