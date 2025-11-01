export const CHEMIST_QUERY = `
  query Chemist($chemistId: Int!) {
    chemist(id: $chemistId) {
      code
      success
      message
      data {
        email
        phone
        dob
        anniversary
        approxTarget
        chemist {
          name
          titles
          status
          address {
            address
            city
            state
            pinCode
            country
            landmark
          }
        }
        doctorChemist {
          doctorCompany {
            email
            phone
            approxTarget
            doctor {
              name
              titles
              status
              address {
                address
                city
                state
                landmark
              }
            }
          }
        }
      }
    }
  }
`;

