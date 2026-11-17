import * as React from "react"

import { useOpnameController } from "../features/opname/controllers/useOpnameController"
import { OpnameView } from "../features/opname/views/OpnameView"

export function OpnameScreen() {
  const props = useOpnameController()
  return <OpnameView {...props} />
}
