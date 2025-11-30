export const CREATE_SALE_MUTATION = `
  mutation CreateSale($data: CreateSaleInput!) {
    createSale(data: $data) {
      code
      success
      message
    }
  }
`;

