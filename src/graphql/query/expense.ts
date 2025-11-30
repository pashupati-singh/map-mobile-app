export const GET_DEFAULT_BY_USER_ID_QUERY = `
  query GetDefaultByUserId {
    getDefaultByUserId {
      success
      message
      data {
        id
        ta
        da
        ha
        ca
        oa
      }
      code
    }
  }
`;

export const GET_EXPENSE_BY_MONTHS_QUERY = `
  query GetExpenseByMonths($dates: [String!]!) {
    getExpenseByMonths(dates: $dates) {
      code
      success
      message
      data {
        ExpenseMonth
        amount
        isApproved
        isCompleted
        details {
          date
          total
          expenseId
          id
        }
      }
    }
  }
`;
