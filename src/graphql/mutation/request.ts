export const CREATE_REQUEST_MUTATION = `
  mutation CreateRequest($data: CreateRequestInput!) {
    createRequest(data: $data) {
      code
      success
      message
    }
  }
`;

