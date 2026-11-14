import { apiClient } from "../../api/client"
import type { ILoginRequestBody } from "../../entities/api/request/ILoginRequestBody"
import type { ILoginResponse } from "../../entities/api/response/ILoginResponse"

class AuthRepositories {
  async login(body: ILoginRequestBody): Promise<ILoginResponse> {
    const response = await apiClient.post<ILoginResponse>("/v1/login-emi", body)
    return response.data
  }
}

export default new AuthRepositories()
