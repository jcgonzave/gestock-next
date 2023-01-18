import type { GetServerSidePropsContext } from 'next';
import { createApolloClient, addApolloState } from '../../lib/apolloClientSS';
import { CURRENT_USER } from '../../graphql/user/client';
import { serverContext } from '../../graphql/context';

export default function AdminPage() {
  return null;
}

AdminPage.layoutType = 'ADMIN';

export async function getServerSideProps(
  serverSidePropsContext: GetServerSidePropsContext
) {
  const apolloClient = createApolloClient(
    serverContext(serverSidePropsContext)
  );

  await apolloClient.query({ query: CURRENT_USER });

  return addApolloState(apolloClient, {
    props: {},
  });
}
