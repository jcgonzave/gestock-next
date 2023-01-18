import gql from 'graphql-tag';
import { response } from '../common/client';

export const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      name
      role {
        key
        modules {
          key
        }
      }
      children {
        id
      }
    }
  }
`;

export const USER_MASTERS = gql`
  query UserMasters($id: String) {
    parentUsers(childId: $id) {
      id
      name
    }
  }
`;

export const USERS = gql`
  query Users {
    users {
      id
      name
      email
      phone
      role {
        id
        name
      }
    }
  }
`;

export const USER = gql`
  query User($id: String!) {
    user(id: $id) {
      id
      parent {
        id
      }
      name
      email
      phone
      role {
        id
      }
      children {
        id
        name
      }
    }
  }
`;

export const UPSERT_USER = gql`
  mutation UpsertUser($user: UserInput!) {
    upsertUser(user: $user) {
      ${response}
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id) {
      ${response}
    }
  }
`;
