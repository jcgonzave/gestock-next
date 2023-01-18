import gql from 'graphql-tag';

export const STATS_REPORT = gql`
  query StatsReport($report: ReportInput!) {
    statsReport(report: $report) {
      resumes {
        breed {
          item
        }
        stage {
          item
        }
        gender {
          item
        }
      }
      events {
        listItem {
          list
          item
        }
        numericValue
        registeredAt
        updatedBy {
          name
        }
      }
    }
  }
`;
