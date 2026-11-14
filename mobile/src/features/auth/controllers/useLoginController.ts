import * as React from "react"
import { useFormik } from "formik"

import { sessionCoordinator } from "../../../app/session/sessionCoordinator"
import { useAppDispatch } from "../../../redux/hooks"
import {
  authenticationFailed,
  authenticationStarted,
} from "../../../redux/sessionSlice"
import { useToast } from "../../../ui/toast"
import { useLogin } from "../hooks/useLogin"
import type { ILoginFormValues } from "../interfaces/ILoginFormValues"
import type { ILoginViewProps } from "../interfaces/ILoginViewProps"
import { loginSchema } from "../validation/loginSchema"

export function useLoginController(): ILoginViewProps {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const establishSession = React.useCallback(
    (session: Parameters<typeof sessionCoordinator.establish>[0]) =>
      sessionCoordinator.establish(session, dispatch),
    [dispatch]
  )
  const mutation = useLogin(establishSession)

  const formik = useFormik<ILoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined)
      dispatch(authenticationStarted())

      try {
        await mutation.mutateAsync({
          email: values.email.trim(),
          password: values.password,
        })

        helpers.resetForm()
        toast.show("Login successful", "success")
      } catch (error) {
        dispatch(authenticationFailed())
        const message = error instanceof Error ? error.message : "Unable to sign in. Please try again."
        helpers.setStatus(message)
        helpers.setFieldValue("password", "", false)
        helpers.setFieldTouched("password", false, false)
      }
    },
  })

  const setValue = (field: "email" | "password") => (value: string) => {
    formik.setStatus(undefined)
    formik.setFieldValue(field, value)
  }

  return {
    email: formik.values.email,
    password: formik.values.password,
    emailError: formik.touched.email ? formik.errors.email : undefined,
    passwordError: formik.touched.password ? formik.errors.password : undefined,
    submitError: typeof formik.status === "string" ? formik.status : undefined,
    isSubmitting: formik.isSubmitting || mutation.isPending,
    canSubmit:
      formik.isValid &&
      !formik.isValidating &&
      !formik.isSubmitting &&
      !mutation.isPending,
    onEmailChange: setValue("email"),
    onPasswordChange: setValue("password"),
    onEmailBlur: () => formik.setFieldTouched("email"),
    onPasswordBlur: () => formik.setFieldTouched("password"),
    onSubmit: () => formik.handleSubmit(),
  }
}
