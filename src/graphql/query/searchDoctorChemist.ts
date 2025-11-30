export const SEARCH_DOCTOR_CHEMIST_QUERY = `
  query SearchDoctorChemist($text: String!) {
    searchDoctorChemist(text: $text) {
      doctors {
        name
        email
        phone
        doctorCompanyId
      }
      chemists {
        chemistCompanyId
        name
        email
        phone
      }
    }
  }
`;

