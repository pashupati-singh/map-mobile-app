export const GET_MY_SALES_ANALYTICS_QUERY = `
  query GetMySalesAnalytics($startDate: String!, $endDate: String!) {
    getMySalesAnalytics(startDate: $startDate, endDate: $endDate) {
      totalAmount
      doctorContributions {
        doctorCompanyId
        doctorName
        totalAmount
        percentage
      }
      chemistContributions {
        chemistCompanyId
        chemistName
        totalAmount
        percentage
      }
      productContributions {
        productId
        productName
        totalAmount
        percentage
      }
      areaContributions {
        workingAreaId
        workingAreaName
        totalAmount
        percentage
      }
    }
  }
`;

