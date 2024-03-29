export const typeDefs = /* GraphQL */`
  extend type Query {
    animal(id: String!): Animal @authorized(module: ANIMAL)
    animals: [Animal]! @authorized(module: ANIMAL)
  }
  
  extend type Mutation {
    upsertAnimal(animal: AnimalInput!): Response @authorized(module: ANIMAL)
    deleteAnimal(id: String!): Response @authorized(module: ANIMAL)
  }
  
  type Animal {
    id: String!
    code: String!
    farm: Farm!
    resume: Resume
  }
  
  input AnimalInput {
    id: String
    code: String!
    farmId: String!
  }
`;
