export const GET_REMINDARS_QUERY = `
  query GetRemindars($page: Int, $limit: Int) {
    getRemindars(page: $page, limit: $limit) {
      code
      success
      message
      lastPage
      data {
        remindAt
        heading
        message
      }
    }
  }
`;


