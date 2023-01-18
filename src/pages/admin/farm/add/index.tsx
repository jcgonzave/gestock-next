import type { GetServerSidePropsContext } from 'next';
import Farm from '../../../../components/farm/Form';
import { FARM_MASTERS } from '../../../../graphql/farm/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

export default function AddFarm() {
  return <Farm />;
}

AddFarm.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: FARM_MASTERS }];
  return serverSideApolloFetching(context, requests, 'FARM');
}
