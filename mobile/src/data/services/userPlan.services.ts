import type { IUserPlanResponse } from "../../entities/api/response/IUserPlanResponse"
import type { IUserPlan } from "../../entities/interfaces/userPlan/IUserPlan"
import { ApiError } from "../ApiError"
import userPlanRepositories from "../repositories/userPlan.repositories"

class UserPlanServices {
  async getUserPlan(): Promise<IUserPlan> {
    try {
      const response = await userPlanRepositories.getUserPlan()
      return this.transformUserPlanResponse(response)
    } catch (error) {
      throw new ApiError(error)
    }
  }

  private transformUserPlanResponse(response: IUserPlanResponse): IUserPlan {
    if (!response.success || !response.data) {
      throw new ApiError(response.message || "Failed to get user plan", {
        code: response.code,
      })
    }

    const data = response.data
    return {
      planId: data.plan_id,
      planName: data.plan_name,
      storageLimit: data.storage_limit,
      storageLimitReadable: data.storage_limit_readable,
      price: data.price,
      currency: data.currency,
      billingCycle: data.billing_cycle,
      status: data.status,
      startedAt: data.started_at,
      expiresAt: data.expires_at ?? undefined,
      storageUsed: data.storage_used,
      storageUsedReadable: data.storage_used_readable,
      storageRemaining: data.storage_remaining,
      storageRemainingReadable: data.storage_remaining_readable,
      usagePercentage: data.usage_percentage,
      eventManagementPrice: data.event_management_price ?? undefined,
      inventoryManagementPrice: data.inventory_management_price ?? undefined,
      warehouseManagementPrice: data.warehouse_management_price ?? undefined,
      qrScanningPrice: data.qr_scanning_price ?? undefined,
      reportsDashboardPrice: data.reports_dashboard_price ?? undefined,
      itemLoanPrice: data.item_loan_price ?? undefined,
      aiAnalyzerPrice: data.ai_analyzer_price ?? undefined,
    }
  }
}

export default new UserPlanServices()
