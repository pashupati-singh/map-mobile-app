export const CREATE_DEFAULT_MUTATION = `
  mutation CreateDefault($data: CreateDefaultInput!) {
    createDefault(data: $data) {
      code
      success
      message
    }
  }
`;

export const CREATE_EXPENSE_MUTATION = `
  mutation CreateExpense($data: CreateExpenseInput!) {
    createExpense(data: $data) {
      code
      success
      message
    }
  }
`;

export const COMPLETE_EXPENSE_MUTATION = `
  mutation CompleteExpense($expenseId: Int!) {
    completeExpense(expenseId: $expenseId) {
      code
      success
      message
    }
  }
`;

