import type { GetServerSidePropsContext } from 'next';
import Farm from '../../../../components/farm/Form';
import { FARM, FARM_MASTERS } from '../../../../graphql/farm/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

type Props = {
  id: string;
};

export default function EditFarm({ id }: Props) {
  return <Farm id={id} />;
}

EditFarm.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  const requests = [
    { query: FARM_MASTERS },
    { query: FARM, variables: { id } },
  ];
  return serverSideApolloFetching(context, requests, 'FARM');
}
