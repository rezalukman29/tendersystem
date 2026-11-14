import { apiClient } from "../../api/client"
import type { IUserPlanResponse } from "../../entities/api/response/IUserPlanResponse"

class UserPlanRepositories {
  async getUserPlan(): Promise<IUserPlanResponse> {
    const response = await apiClient.get<IUserPlanResponse>("/v1/user/plan")
    return response.data
  }
}

export default new UserPlanRepositories()
