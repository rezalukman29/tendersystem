import { configureStore } from "@reduxjs/toolkit"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as React from "react"
import { StyleSheet, Text } from "react-native"
import { Provider } from "react-redux"
import ReactTestRenderer from "react-test-renderer"

import { ThemeGate } from "../src/app/theme/ThemeGate"
import { APPEARANCE_STORAGE_KEY, appearanceStore } from "../src/data/appearance/appearanceStore"
import appearanceReducer from "../src/redux/appearanceSlice"
import { applyColorScheme, color, currentColorScheme, themed } from "../src/theme"

afterEach(() => applyColorScheme("light"))

test("swaps the live palette between light and dark", () => {
  expect(color.ground).toBe("#f6f8fb")
  applyColorScheme("dark")
  expect(currentColorScheme()).toBe("dark")
  expect(color.ground).toBe("#0b0d12")
  expect(color.inverse).toBe("#e6e9ef")
  applyColorScheme("light")
  expect(color.ground).toBe("#f6f8fb")
})

test("themed styles are rebuilt after a mode change", () => {
  const styles = themed(() => StyleSheet.create({ card: { backgroundColor: color.surface } }))
  expect(StyleSheet.flatten(styles.card).backgroundColor).toBe("#ffffff")
  applyColorScheme("dark")
  expect(StyleSheet.flatten(styles.card).backgroundColor).toBe("#151820")
})

test("the saved choice defaults to light and ignores junk", async () => {
  expect(await appearanceStore.read()).toBe("light")
  await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, "purple")
  expect(await appearanceStore.read()).toBe("light")
  await appearanceStore.write("system")
  expect(await appearanceStore.read()).toBe("system")
})

test("restores a saved dark choice before drawing anything", async () => {
  await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, "dark")
  const store = configureStore({ reducer: { appearance: appearanceReducer } })
  let tree!: ReactTestRenderer.ReactTestRenderer
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <Provider store={store as never}>
        <ThemeGate>
          <Text>content</Text>
        </ThemeGate>
      </Provider>
    )
  })
  await ReactTestRenderer.act(async () => {
    await Promise.resolve()
  })
  expect(store.getState().appearance).toEqual({ preference: "dark", loaded: true })
  expect(color.ground).toBe("#0b0d12")
  expect(tree.root.findAllByType(Text).some((n) => n.props.children === "content")).toBe(true)
  ReactTestRenderer.act(() => tree.unmount())
})
