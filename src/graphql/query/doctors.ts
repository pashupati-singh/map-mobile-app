export const DOCTORS_QUERY = `
  query Doctors($page: Int, $limit: Int) {
    doctors(page: $page, limit: $limit) {
      code
      success
      message
      lastPage
      doctors {
        id
        email
        phone
        doctor {
          name
          titles
        }
      }
    }
  }
`;

