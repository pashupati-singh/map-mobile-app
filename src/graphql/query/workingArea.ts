export const GET_USERS_BY_WORKING_AREA_BY_USER_ID_QUERY = `
  query GetUsersByWorkingAreabyUserId {
    getUsersByWorkingAreabyUserId {
      code
      success
      message
      data {
        id
        state
        city
        district
        workingArea
      }
    }
  }
`;

