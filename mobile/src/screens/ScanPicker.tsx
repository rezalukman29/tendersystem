import * as React from "react"

import { ScanPickerView } from "../features/scanPicker/views/ScanPickerView"
import { useScanPickerController } from "../features/scanPicker/controllers/useScanPickerController"

export function ScanPickerScreen() {
  const props = useScanPickerController()
  return <ScanPickerView {...props} />
}
