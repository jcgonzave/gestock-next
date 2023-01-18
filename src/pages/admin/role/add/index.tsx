import type { GetServerSidePropsContext } from 'next';
import Role from '../../../../components/role/Form';
import { ROLE_MASTERS } from '../../../../graphql/role/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

export default function AddRole() {
  return <Role />;
}

AddRole.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: ROLE_MASTERS }];
  return serverSideApolloFetching(context, requests, 'ROLE');
}
