import type { GetServerSidePropsContext } from 'next';
import User from '../../../../components/user/Form';
import { USER_MASTERS } from '../../../../graphql/user/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

export default function AddUser() {
  return <User />;
}

AddUser.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: USER_MASTERS }];
  return serverSideApolloFetching(context, requests, 'USER');
}
