import * as React from "react"

import { useLoginController } from "../controllers/useLoginController"
import { LoginView } from "../views/LoginView"

export function LoginScreen() {
  return <LoginView {...useLoginController()} />
}
