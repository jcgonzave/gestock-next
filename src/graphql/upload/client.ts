import gql from 'graphql-tag';

export const UPLOAD = gql`
  mutation Upload($farmId: String!, $file: Upload!) {
    upload(farmId: $farmId, file: $file) {
      invalidDataLocations {
        key
        sheet
        row
        columns
      }
      resumesUploadedCount
      eventsUploadedCount
      status
      result
    }
  }
`;
