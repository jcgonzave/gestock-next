export const typeDefs = /* GraphQL */`
  extend type Query {
    resumesByFarmMobile(farmId: String!): [Resume]! @authenticated
  }
  
  extend type Mutation {
    bulkUploadMobile(
      farmId: String!
      resumes: [ResumeInputMobile]
      events: [EventInputMobile]
    ): UploadMobileResponse @authorized(module: UPLOAD)
    bulkUploadExcel(
      farmId: String!
      resumes: [ResumeInputExcel]
      events: [EventInputExcel]
    ): UploadWebResponse @authorized(module: UPLOAD)
  }
  
  type Resume {
    id: String!
    code: String!
    image: String
    breedId: String!
    colorId: String!
    stageId: String!
    genderId: String!
    birthday: String!
    caravan: String
    initialWeight: String!
    name: String
    registeredAt: String!
    events: [Event]
  }
  
  type Event {
    id: String!
    resume: Resume!
    listItem: ListItem!
    numericValue: String
    image: String
    comments: String
    registeredAt: String!
  }
  
  input ResumeInputMobile {
    id: String
    code: String!
    image: String
    breedId: String!
    colorId: String!
    stageId: String!
    genderId: String!
    birthday: String!
    caravan: String
    initialWeight: String!
    name: String
    registeredAt: String!
    modified: String
    isNew: Boolean
    isValid: Boolean
    hasNewEvents: Boolean
  }
  
  input ResumeInputExcel {
    code: String!
    breed: String
    color: String
    stage: String
    gender: String
    birthday: String
    caravan: String
    initialWeight: String
    name: String
  }
  
  input EventInputMobile {
    code: String!
    list: String!
    item: String!
    image: String
    numericValue: String
    comments: String
    registeredAt: String!
    isNew: Boolean
    eventId: Float
  }
  
  input EventInputExcel {
    code: String!
    list: String
    item: String
    comments: String
  }
  
  type UploadMobileResponse {
    message: String!
    status: Int!
    result: [String]
  }
  
  type UploadWebResponse {
    invalidData: [InvalidData]!
    status: Int!
    result: Boolean!
  }
  
  type InvalidData {
    key: String!
    sheet: Float!
    row: Float!
    columns: [String]!
  }
`;
