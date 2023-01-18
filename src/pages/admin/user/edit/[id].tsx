import type { GetServerSidePropsContext } from 'next';
import User from '../../../../components/user/Form';
import { serverContext } from '../../../../graphql/context';
import { ROLES_BY_PARENT_USER } from '../../../../graphql/role/client';
import { USER, USER_MASTERS } from '../../../../graphql/user/client';
import { createApolloClient } from '../../../../lib/apolloClientSS';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

type Props = {
  id: string;
};

export default function EditUser({ id }: Props) {
  return <User id={id} />;
}

EditUser.layoutType = 'ADMIN';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  const apolloClient = createApolloClient(serverContext(context));
  const {
    data: { user },
  } = await apolloClient.query({ query: USER, variables: { id } });
  const requests = [
    { query: USER_MASTERS },
    {
      query: ROLES_BY_PARENT_USER,
      variables: { parentUserId: user.parent.id },
    },
  ];
  return serverSideApolloFetching(context, requests, 'USER');
}
