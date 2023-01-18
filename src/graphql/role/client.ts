import gql from 'graphql-tag';
import { response } from '../common/client';

export const ROLE_MASTERS = gql`
  query Modules {
    roleKeys {
      id
      name
    }
    modules {
      id
      name
    }
  }
`;

export const ROLES_BY_PARENT_USER = gql`
  query RolesByParentUser($parentUserId: String!) {
    rolesByParentUser(parentUserId: $parentUserId) {
      id
      name
    }
  }
`;

export const ROLES = gql`
  query Roles {
    roles {
      id
      name
      modules {
        id
        name
      }
    }
  }
`;

export const ROLE = gql`
  query Role($id: String!) {
    role(id: $id) {
      id
      key
      modules {
        id
      }
    }
  }
`;

export const UPSERT_ROLE = gql`
  mutation UpsertRole($role: RoleInput!) {
    upsertRole(role: $role) {
      ${response}
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($id: String!) {
    deleteRole(id: $id) {
      ${response}
    }
  }
`;
