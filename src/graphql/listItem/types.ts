export const typeDefs = /* GraphQL */`
  extend type Query {
    lists: [List]! @authorized(module: LIST_ITEM)
    listItem(id: String!): ListItem @authorized(module: LIST_ITEM)
    listItems: [ListItem]! @authorized(module: LIST_ITEM)
    listsMobile: [List]!
    listItemsMobile(date: String): [ListItem]!
  }
  
  extend type Mutation {
    upsertListItem(listItem: ListItemInput!): Response
      @authorized(module: LIST_ITEM)
    deleteListItem(id: String!): Response @authorized(module: LIST_ITEM)
  }
  
  type ListItem {
    id: String!
    list: ListEnum!
    item: String!
    state: StateEnum!
    updatedAt: String!
  }
  
  input ListItemInput {
    id: String
    list: ListEnum!
    item: String!
    state: StateEnum!
  }
  
  enum ListEnum {
    COLOR
    STATE
    STAGE
    LOT
    MEDICINE
    WEIGHT
    BREED
    REPRODUCTION
    GENDER
    LOSS
    VACCINE
  }
`;
