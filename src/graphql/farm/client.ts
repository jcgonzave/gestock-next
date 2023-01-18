import gql from 'graphql-tag';
import { response } from '../common/client';

export const FARM_MASTERS = gql`
  query FarmMasters {
    farmers {
      id
      name
    }
  }
`;

export const FARMS = gql`
  query Farms {
    farms {
      id
      name
      farmer {
        id
        name
      }
    }
  }
`;

export const FARM = gql`
  query Farm($id: String!) {
    farm(id: $id) {
      id
      name
      farmer {
        id
        name
        children {
          id
          name
        }
      }
      cowboys {
        id
        name
      }
    }
  }
`;

export const UPSERT_FARM = gql`
  mutation UpsertFarm($farm: FarmInput!) {
    upsertFarm(farm: $farm) {
      ${response}
    }
  }
`;

export const DELETE_FARM = gql`
  mutation DeleteFarm($id: String!) {
    deleteFarm(id: $id) {
      ${response}
    }
  }
`;
