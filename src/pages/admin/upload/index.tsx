import type { GetServerSidePropsContext } from 'next';
import Upload from '../../../components/upload';
import { FARMS } from '../../../graphql/farm/client';
import { serverSideApolloFetching } from '../../../utils/dataFetching';

export default function FarmsPage() {
  return <Upload />;
}

FarmsPage.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const requests = [{ query: FARMS }];
  return serverSideApolloFetching(context, requests, 'UPLOAD');
}
