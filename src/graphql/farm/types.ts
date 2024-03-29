export const typeDefs = /* GraphQL */`
  extend type Query {
    farm(id: String!): Farm @authorized(module: FARM)
    farms: [Farm]! @authorized(module: FARM)
    farmsMobile: [Farm]! @authenticated
  }
  
  extend type Mutation {
    upsertFarm(farm: FarmInput!): Response @authorized(module: FARM)
    deleteFarm(id: String!): Response @authorized(module: FARM)
  }
  
  type Farm {
    id: String!
    name: String!
    farmer: User!
    cowboys: [User!]!
    animals: [Animal]
  }
  
  input FarmInput {
    id: String
    name: String!
    farmerId: String!
    cowboys: [String!]!
  }
`;
