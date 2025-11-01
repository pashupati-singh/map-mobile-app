export const DOCTOR_QUERY = `
  query Doctor($doctorId: Int!) {
    doctor(id: $doctorId) {
      code
      success
      message
      data {
        doctor {
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
        email
        phone
        dob
        anniversary
        approxTarget
        doctorChemist {
          chemistCompany {
            chemist {
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
            email
            phone
            approxTarget
          }
        }
        DoctorProduct {
          product {
            name
            type
            salt
          }
          assignedAt
        }
      }
    }
  }
`;

