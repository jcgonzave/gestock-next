import gql from 'graphql-tag';

export const BULK_UPLOAD_EXCEL = gql`
  mutation BulkUploadExcel(
    $farmId: String!
    $resumes: [ResumeInputExcel]
    $events: [EventInputExcel]
  ) {
    bulkUploadExcel(farmId: $farmId, resumes: $resumes, events: $events) {
      invalidData {
        key
        sheet
        row
        columns
      }
      status
      result
    }
  }
`;
