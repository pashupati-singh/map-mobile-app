export const CREATE_QUICK_ACTION_MUTATION = `
  mutation CreateQuickAction($data: CreateQuickActionInput!) {
    createQuickAction(data: $data) {
      code
      success
      message
    }
  }
`;

