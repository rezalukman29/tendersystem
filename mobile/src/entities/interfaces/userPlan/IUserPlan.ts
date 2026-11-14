export interface IUserPlan {
  planId: number
  planName: string
  storageLimit: number
  storageLimitReadable: string
  price: number
  currency: string
  billingCycle: string
  status: string
  startedAt: string
  expiresAt?: string
  storageUsed: number
  storageUsedReadable: string
  storageRemaining: number
  storageRemainingReadable: string
  usagePercentage: number
  eventManagementPrice?: number
  inventoryManagementPrice?: number
  warehouseManagementPrice?: number
  qrScanningPrice?: number
  reportsDashboardPrice?: number
  itemLoanPrice?: number
  aiAnalyzerPrice?: number
}
