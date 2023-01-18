import gql from 'graphql-tag';
import { response } from '../common/client';

export const LIST_ITEM_MASTERS = gql`
  query ListItemMasters {
    lists {
      id
      name
    }
    states {
      id
      name
    }
  }
`;

export const LIST_ITEMS = gql`
  query ListItems {
    listItems {
      id
      list
      item
      state
    }
  }
`;

export const LIST_ITEM = gql`
  query ListItem($id: String!) {
    listItem(id: $id) {
      id
      list
      item
      state
    }
  }
`;

export const UPSERT_LIST_ITEM = gql`
  mutation UpsertListItem($listItem: ListItemInput!) {
    upsertListItem(listItem: $listItem) {
      ${response}
    }
  }
`;

export const DELETE_LIST_ITEM = gql`
  mutation DeleteListItem($id: String!) {
    deleteListItem(id: $id) {
      ${response}
    }
  }
`;
