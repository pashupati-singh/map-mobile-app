export const CREATE_DCR_MUTATION = `
  mutation CreateDcr($data: CreateDcrInput!) {
    createDcr(data: $data) {
      code
      success
      message
    }
  }
`;

