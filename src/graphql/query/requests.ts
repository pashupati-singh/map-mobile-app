export const GET_REQUESTS_QUERY = `
  query GetRequests($page: Int, $limit: Int) {
    getRequests(page: $page, limit: $limit) {
      code
      success
      message
      lastPage
      data {
        requestType
        name
        startDate
        endDate
        productName
        assoicateDoc
        remark
        associates
        requestedDate
        isApproved
        isReject
      }
    }
  }
`;

