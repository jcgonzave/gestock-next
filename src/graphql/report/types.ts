export const typeDefs = /* GraphQL */`
  extend type Query {
    statsReport(report: ReportInput!): ReportResponse @authorized(module: REPORT)
  }
  
  type ReportResponse {
    resumes: [ReportResume]
    events: [ReportEvent]
  }
  
  type ReportResume {
    breed: ListItem!
    color: ListItem!
    stage: ListItem!
    gender: ListItem!
  }
  
  type ReportEvent {
    listItem: ListItem!
    numericValue: String
    registeredAt: String!
    updatedBy: User!
  }
  
  input ReportInput {
    farmId: String!
    date: String!
  }
`;
