import type { GetServerSidePropsContext } from 'next';
import Role from '../../../../components/role/Form';
import { ROLE, ROLE_MASTERS } from '../../../../graphql/role/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

type Props = {
  id: string;
};

export default function EditRole({ id }: Props) {
  return <Role id={id} />;
}

EditRole.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  const requests = [
    { query: ROLE_MASTERS },
    { query: ROLE, variables: { id } },
  ];
  return serverSideApolloFetching(context, requests, 'ROLE');
}
