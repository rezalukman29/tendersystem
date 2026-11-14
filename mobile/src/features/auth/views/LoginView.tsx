import * as React from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { color } from "../../../theme"
import { Button, Field, Input, Text } from "../../../ui/primitives"
import type { ILoginViewProps } from "../interfaces/ILoginViewProps"

export function LoginView(props: ILoginViewProps) {
  const insets = useSafeAreaInsets()

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.ground }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: insets.top + 32, gap: 32 }}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: color.brand, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13, letterSpacing: 0.5 }}>EMI</Text>
            </View>
            <Text variant="label">EVENT MANAGEMENT INVENTORY</Text>
          </View>
          <Text variant="title" style={{ fontSize: 28, marginTop: 18 }}>Sign in</Text>
          <Text variant="meta">Use your EMI account to continue.</Text>
        </View>

        <View style={{ gap: 14 }}>
          <Field label="Email" error={props.emailError}>
            <Input
              accessibilityLabel="Email"
              value={props.email}
              onChangeText={props.onEmailChange}
              onBlur={props.onEmailBlur}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="name@company.id"
              invalid={!!props.emailError || !!props.submitError}
              editable={!props.isSubmitting}
            />
          </Field>
          <Field label="Password" error={props.passwordError ?? props.submitError}>
            <Input
              accessibilityLabel="Password"
              value={props.password}
              onChangeText={props.onPasswordChange}
              onBlur={props.onPasswordBlur}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              invalid={!!props.passwordError || !!props.submitError}
              editable={!props.isSubmitting}
              onSubmitEditing={props.onSubmit}
            />
          </Field>
          <Button
            size="lg"
            title={props.isSubmitting ? "Signing in…" : "Sign in"}
            accessibilityLabel="Sign in"
            onPress={props.onSubmit}
            disabled={!props.canSubmit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
