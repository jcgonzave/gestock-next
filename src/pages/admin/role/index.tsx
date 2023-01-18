import type { GetServerSidePropsContext } from 'next';
import Roles from '../../../components/role/List';
import { ROLES } from '../../../graphql/role/client';
import { serverSideApolloFetching } from '../../../utils/dataFetching';

export default function FarmsPage() {
  return <Roles />;
}

FarmsPage.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: ROLES }];
  return serverSideApolloFetching(context, requests, 'ROLE');
}
