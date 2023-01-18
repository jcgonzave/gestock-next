import type { GetServerSidePropsContext } from 'next';
import Stats from '../components/stats';
import { FARMS } from '../graphql/farm/client';
import { serverSideApolloFetching } from '../utils/dataFetching';

export default function StatsPage() {
  return <Stats />;
}

StatsPage.layoutType = 'USER';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: FARMS }];
  return serverSideApolloFetching(context, requests);
}
