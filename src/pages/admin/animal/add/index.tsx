import type { GetServerSidePropsContext } from 'next';
import Animal from '../../../../components/animal/Form';
import { ANIMAL_MASTERS } from '../../../../graphql/animal/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

export default function AddAnimal() {
  return <Animal />;
}

AddAnimal.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: ANIMAL_MASTERS }];
  return serverSideApolloFetching(context, requests, 'ANIMAL');
}
