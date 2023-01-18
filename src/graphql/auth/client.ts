import { gql } from '@apollo/client';
import { response } from '../common/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      response {
        ${response}
      }
    }
  }
`;

export const VALIDATE_PASSWORD_RESET = gql`
  query ValidatePasswordResetToken($token: String!) {
    validatePasswordResetToken(token: $token)
  }
`;

export const PASSWORD_RESET = gql`
  mutation PasswordReset(
    $password: String!
    $confirmPassword: String!
    $token: String!
  ) {
    passwordReset(
      password: $password
      confirmPassword: $confirmPassword
      token: $token
    ) {
      ${response}
      }
  }
`;

export const PASSWORD_RECOVERY = gql`
  mutation PasswordRecovery($email: String!) {
    passwordRecovery(email: $email) {
      ${response}
      }
  }
`;
