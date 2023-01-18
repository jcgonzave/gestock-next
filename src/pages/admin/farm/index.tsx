import type { GetServerSidePropsContext } from 'next';
import Farms from '../../../components/farm/List';
import { FARMS } from '../../../graphql/farm/client';
import { serverSideApolloFetching } from '../../../utils/dataFetching';

export default function FarmsPage() {
  return <Farms />;
}

FarmsPage.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: FARMS }];
  return serverSideApolloFetching(context, requests, 'FARM');
}
