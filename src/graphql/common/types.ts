export const typeDefs = /* GraphQL */ `
  type Query
  type Mutation

  directive @authenticated on FIELD_DEFINITION
  directive @authorized(module: ModuleEnum!) on FIELD_DEFINITION

  extend type Query {
    states: [List]!
  }

  type List {
    id: String
    name: String
  }

  type Response {
    message: String!
    status: Int!
    result: Boolean!
  }

  enum StateEnum {
    ACTIVE
    INACTIVE
  }
`;
