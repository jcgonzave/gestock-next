import type { GetServerSidePropsContext } from 'next';
import Users from '../../../components/user/List';
import { USERS } from '../../../graphql/user/client';
import { serverSideApolloFetching } from '../../../utils/dataFetching';

export default function FarmsPage() {
  return <Users />;
}

FarmsPage.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: USERS }];
  return serverSideApolloFetching(context, requests, 'USER');
}
