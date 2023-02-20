export const typeDefs = /* GraphQL */`
  extend type Query {
    currentUser: User @authenticated
    user(id: String!): User @authorized(module: USER)
    users: [User!]! @authorized(module: USER)
    farmers: [User!]! @authorized(module: USER)
    parentUsers(childId: String): [User!]! @authorized(module: USER)
  }
  
  extend type Mutation {
    upsertUser(user: UserInput!): Response @authorized(module: USER)
    deleteUser(id: String!): Response @authorized(module: USER)
  }
  
  type User {
    id: String!
    name: String!
    email: String!
    phone: String!
    role: Role!
    parent: User
    children: [User]
    farmsAsFarmer: [Farm]
    farmsAsCowboy: [Farm]
  }
  
  input UserInput {
    id: String
    parentId: String!
    roleId: String!
    name: String!
    email: String!
    phone: String!
  }
`;
