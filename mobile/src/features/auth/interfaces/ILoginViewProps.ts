export interface ILoginViewProps {
  email: string
  password: string
  emailError?: string
  passwordError?: string
  submitError?: string
  isSubmitting: boolean
  canSubmit: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onEmailBlur: () => void
  onPasswordBlur: () => void
  onSubmit: () => void
}
