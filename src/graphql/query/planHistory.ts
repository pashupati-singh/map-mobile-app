export const GET_DAILY_PLANS_BY_MR_ID_QUERY = `
  query GetDailyPlansByMRId($page: Int, $limit: Int) {
    getDailyPlansByMRId(page: $page, limit: $limit) {
      code
      success
      message
      data {
        id
        planDate
        isWorkTogetherConfirmed
        isRejected
        workTogether
        isApproved
        notes
      }
    }
  }
`;

export const GET_DAILY_PLAN_BY_ID_QUERY = `
  query GetDailyPlanById($getDailyPlanByIdId: Int!) {
    getDailyPlanById(id: $getDailyPlanByIdId) {
      code
      success
      message
      data {
        isApproved
        workTogether
        isWorkTogetherConfirmed
        isRejected
        planDate
        notes
        doctors {
          dcr
          doctorCompanyId
          DoctorCompany {
            email
            phone
            doctor {
              name
              titles
            }
          }
        }
        chemists {
          dcr
          chemistCompanyId
          ChemistCompany {
            email
            phone
            chemist {
              name
              titles
            }
          }
        }
      }
    }
  }
`;

