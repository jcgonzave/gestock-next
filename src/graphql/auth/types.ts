export const typeDefs = /* GraphQL */`
  extend type Query {
    validatePasswordResetToken(token: String!): Boolean
  }
  
  extend type Mutation {
    login(email: String!, password: String!): LoginResponse!
    changePassword(
      currentPassword: String!
      newPassword: String!
      confirmNewPassword: String!
    ): LoginResponse!
    passwordRecovery(email: String!): Response
    passwordReset(
      password: String!
      confirmPassword: String!
      token: String!
    ): Response
  }
  
  type LoginResponse {
    token: String
    user: User
    response: Response
  }
`;
