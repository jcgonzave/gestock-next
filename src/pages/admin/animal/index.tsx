import type { GetServerSidePropsContext } from 'next';
import Animals from '../../../components/animal/List';
import { ANIMALS } from '../../../graphql/animal/client';
import { serverSideApolloFetching } from '../../../utils/dataFetching';

export default function AnimalsPage() {
  return <Animals />;
}

AnimalsPage.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: ANIMALS }];
  return serverSideApolloFetching(context, requests, 'ANIMAL');
}
