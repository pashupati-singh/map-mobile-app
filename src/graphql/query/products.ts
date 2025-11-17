export const GET_PRODUCTS_BY_COMPANY_QUERY = `
  query GetProductsByCompany($page: Int, $limit: Int, $companyId: Int) {
    getProductsByCompany(page: $page, limit: $limit, companyId: $companyId) {
      code
      success
      message
      lastPage
      data {
        id
        name
        type
        salt
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID_QUERY = `
  query GetProductById($productId: Int!) {
    getProductById(productId: $productId) {
      code
      success
      message
      product {
        name
        type
        salt
        details
      }
    }
  }
`;

