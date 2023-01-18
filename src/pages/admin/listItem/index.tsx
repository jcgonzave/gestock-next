import type { GetServerSidePropsContext } from 'next';
import ListItems from '../../../components/listItem/List';
import { LIST_ITEMS } from '../../../graphql/listItem/client';
import { serverSideApolloFetching } from '../../../utils/dataFetching';

export default function FarmsPage() {
  return <ListItems />;
}

FarmsPage.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: LIST_ITEMS }];
  return serverSideApolloFetching(context, requests, 'LIST_ITEM');
}
