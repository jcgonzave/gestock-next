export const typeDefs = /* GraphQL */`
  extend type Query {
    role(id: String!): Role! @authorized(module: ROLE)
    roles: [Role!]! @authorized(module: ROLE)
    rolesByParentUser(parentUserId: String!): [Role!]! @authorized(module: USER)
    modules: [Module!]! @authorized(module: ROLE)
    roleKeys: [List]!
  }
  
  extend type Mutation {
    upsertRole(role: RoleInput!): Response @authorized(module: ROLE)
    deleteRole(id: String!): Response @authorized(module: ROLE)
  }
  
  type Role {
    id: String!
    name: String!
    key: RoleEnum!
    modules: [Module!]!
    users: [User]
  }
  
  input RoleInput {
    id: String
    key: RoleEnum!
    modules: [String!]!
  }
  
  type Module {
    id: String!
    name: String!
    key: ModuleEnum!
    roles: [Role]
  }
  
  type ModulesOnRoles {
    role: Role!
    roleId: String!
    module: Module!
    moduleId: String!
  }
  
  enum RoleEnum {
    ADMIN
    COMPANY
    FARMER
    COWBOY
  }
  
  enum ModuleEnum {
    ROLE
    USER
    LIST_ITEM
    FARM
    ANIMAL
    REPORT
    UPLOAD
  }
`;
