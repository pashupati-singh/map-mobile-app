export const HOME_PAGE_QUERY = `
  query HomePageQuery {
    homePage {
      data {
        events {
          ... on DoctorCompany {
            email
            phone
            dob
            type
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
            type
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
          id
          isApproved
          workTogether
          isWorkTogetherConfirmed
          isRejected
          planDate
          notes
          abmId
          doctors {
            id
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

