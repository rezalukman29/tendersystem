import { ApiError } from "../ApiError"
import type { ILoginRequestBody } from "../../entities/api/request/ILoginRequestBody"
import type { ILoginResponse } from "../../entities/api/response/ILoginResponse"
import type { IAuthenticatedSession } from "../../entities/interfaces/auth/IAuthenticatedSession"
import type { ILoginCredentials } from "../../entities/interfaces/auth/ILoginCredentials"
import authRepositories from "../repositories/auth.repositories"

class AuthServices {
  async login(credentials: ILoginCredentials): Promise<IAuthenticatedSession> {
    try {
      const body = this.transformLoginRequest(credentials)
      const response = await authRepositories.login(body)
      return this.transformLoginResponse(response, body.email)
    } catch (error) {
      throw new ApiError(error)
    }
  }

  private transformLoginRequest(credentials: ILoginCredentials): ILoginRequestBody {
    return {
      email: credentials.email.trim(),
      password: credentials.password,
    }
  }

  private transformLoginResponse(
    response: ILoginResponse,
    fallbackEmail: string
  ): IAuthenticatedSession {
    const data = response.data
    const userId = Number(data?.id)
    const token = data?.token

    if (!response.success || !userId || !token) {
      throw new ApiError(response.message || "Login failed")
    }

    return {
      credential: { userId, token },
      profile: {
        id: userId,
        fullname: data?.fullname ?? "",
        email: data?.email ?? fallbackEmail,
        userType: data?.user_type ?? "",
      },
    }
  }
}

export default new AuthServices()
