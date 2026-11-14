import * as React from "react"
import { ActivityIndicator, View } from "react-native"

import { sessionCoordinator } from "../../app/session/sessionCoordinator"
import { useAppDispatch } from "../../redux/hooks"
import { useAppSelector } from "../../redux/hooks"
import { color } from "../../theme"

export function AuthBootstrap({ children }: React.PropsWithChildren) {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.session.status)
  const started = React.useRef(false)

  React.useEffect(() => {
    if (started.current) return
    started.current = true
    sessionCoordinator.restore(dispatch)
  }, [dispatch])

  if (status === "bootstrapping") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.ground }}>
        <ActivityIndicator color={color.brand} />
      </View>
    )
  }

  return <>{children}</>
}
