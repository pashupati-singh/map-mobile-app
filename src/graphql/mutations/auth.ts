export const LOGIN_MUTATION = `
mutation LoginUser($email: String!, $password: String!) {
  loginUser(email: $email, password: $password) {
    code
    success
    message
    token
    user {
      id
      name
      company { name id }
    }
  }
}
`;

export const VERIFY_MPIN_MUTATION = `
mutation VerifyMpin($userId: Int!, $mpin: String!) {
  verifyMpin(userId: $userId, mpin: $mpin) {
    code
    success
    message
    token
    user {
      id
      name
      company { name id }
    }
  }
}
`;


