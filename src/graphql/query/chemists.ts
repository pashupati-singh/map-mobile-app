export const CHEMISTS_QUERY = `
  query Chemists($page: Int, $limit: Int) {
    chemists(page: $page, limit: $limit) {
      code
      success
      message
      lastPage
      chemists {
        id
        email
        phone
        chemist {
          name
        }
      }
    }
  }
`;

