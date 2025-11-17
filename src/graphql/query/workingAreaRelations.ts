export const GET_WORKING_AREA_RELATIONS_QUERY = `
  query GetWorkingAreaRelations($workingAreaId: Int!) {
    getWorkingAreaRelations(workingAreaId: $workingAreaId) {
      code
      success
      message
      data {
        doctorCompanies {
          id
          phone
          doctor {
            name
            titles
          }
        }
        chemistCompanies {
          id
          phone
          chemist {
            name
            titles
          }
        }
      }
    }
  }
`;

