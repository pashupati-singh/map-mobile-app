export const HOME_PAGE_QUERY = `
  query HomePageQuery {
    homePage {
      data {
        events {
          ... on DoctorCompany {
            email
            phone
            dob
            anniversary
            doctor {
              name
              titles
            }
          }
          ... on ChemistCompany {
            email
            phone
            dob
            anniversary
            chemist {
              name
              titles
              status
            }
          }
        }
        remindars {
          remindAt
          heading
          message
        }
        dailyplans {
          isApproved
          workTogether
          isWorkTogetherConfirmed
          isRejected
          planDate
          notes
          doctors {
            doctorCompanyId
            dcr
            DoctorCompany {
              email
              phone
            }
          }
          chemists {
            id
            dcr
            ChemistCompany {
              email
              phone
              dob
              anniversary
            }
          }
        }
      }
      message
      success
      code
    }
  }
`;

