import type { GetServerSidePropsContext } from 'next';
import ListItem from '../../../../components/listItem/Form';
import { LIST_ITEM_MASTERS } from '../../../../graphql/listItem/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

export default function AddListItem() {
  return <ListItem />;
}

AddListItem.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: LIST_ITEM_MASTERS }];
  return serverSideApolloFetching(context, requests, 'LIST_ITEM');
}
