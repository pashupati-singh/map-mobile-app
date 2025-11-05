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

export const RESEND_OTP_MUTATION = `
mutation ResendOtp($type: String!, $email: String, $phone: String) {
  resendOtp(type: $type, email: $email, phone: $phone) {
    code
  }
}
`;

export const VERIFY_OTP_MUTATION = `
mutation VerifyOtp($type: String!, $otpOrToken: String!, $email: String, $phone: String) {
  verifyOtp(type: $type, otpOrToken: $otpOrToken, email: $email, phone: $phone) {
    code
    message
  }
}
`;


