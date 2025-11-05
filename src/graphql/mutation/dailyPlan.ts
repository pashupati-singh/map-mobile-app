export const CREATE_DAILY_PLAN_MUTATION = `
  mutation CreateDailyPlan($data: CreateDailyPlanInput!) {
    createDailyPlan(data: $data) {
      code
      success
      message
    }
  }
`;

