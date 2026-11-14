export const userPlanKeys = {
  all: ["user-plan"] as const,
  detail: (userId: number) => [...userPlanKeys.all, userId] as const,
}
