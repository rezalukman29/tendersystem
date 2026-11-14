import * as Yup from "yup"

import type { ILoginFormValues } from "../interfaces/ILoginFormValues"

export const loginSchema: Yup.ObjectSchema<ILoginFormValues> = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),
  password: Yup.string().required("Password is required."),
})
