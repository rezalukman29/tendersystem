export interface ILoginResponse {
  success: boolean
  message: string
  data?: {
    id?: number
    fullname?: string
    email?: string
    user_type?: string
    token?: string
  }
}
