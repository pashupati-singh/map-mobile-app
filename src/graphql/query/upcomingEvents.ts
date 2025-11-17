export const UPCOMING_EVENTS_QUERY = `
  query UpcomingEvents {
    upcomingEvents {
      code
      success
      message
      data {
        events {
          ... on DoctorCompany {
            type
            phone
            email
            dob
            anniversary
            doctor {
              name
              titles
              status
            }
          }
          ... on ChemistCompany {
            type
            phone
            email
            dob
            anniversary
            chemist {
              name
              titles
              status
            }
          }
        }
      }
    }
  }
`;


