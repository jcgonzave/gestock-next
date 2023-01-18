import { DocumentNode } from 'graphql';
import { GetServerSidePropsContext } from 'next';
import { serverContext } from '../graphql/context';
import { CURRENT_USER } from '../graphql/user/client';
import { addApolloState, createApolloClient } from '../lib/apolloClientSS';

type Request = {
  query: DocumentNode;
  variables?: any;
};

export const serverSideApolloFetching = async (
  context: GetServerSidePropsContext,
  requests: Request[],
  moduleKey?: string
) => {
  const apolloClient = createApolloClient(serverContext(context));

  const {
    data: { currentUser },
  } = await apolloClient.query({ query: CURRENT_USER });
  if (
    moduleKey &&
    !currentUser.role.modules.some((module: any) => module.key === moduleKey)
  ) {
    return {
      redirect: {
        destination: '/401',
        permanent: false,
      },
    };
  }

  for (let request of requests) {
    await apolloClient.query({
      query: request.query,
      variables: request.variables || undefined,
    });
  }

  return addApolloState(apolloClient, {
    props: { id: context.params?.id || null },
  });
};
