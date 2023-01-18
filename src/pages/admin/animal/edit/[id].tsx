import type { GetServerSidePropsContext } from 'next';
import Animal from '../../../../components/animal/Form';
import { ANIMAL, ANIMAL_MASTERS } from '../../../../graphql/animal/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

type Props = {
  id: string;
};

export default function EditAnimal({ id }: Props) {
  return <Animal id={id} />;
}

EditAnimal.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  const requests = [
    { query: ANIMAL_MASTERS },
    { query: ANIMAL, variables: { id } },
  ];
  return serverSideApolloFetching(context, requests, 'ANIMAL');
}
