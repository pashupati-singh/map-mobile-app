export const CREATE_REMINDAR_MUTATION = `
  mutation CreateRemindar($data: CreateRemindarInput!) {
    createRemindar(data: $data) {
      code
      success
      message
    }
  }
`;

