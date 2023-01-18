import type { GetServerSidePropsContext } from 'next';
import ListItem from '../../../../components/listItem/Form';
import {
  LIST_ITEM,
  LIST_ITEM_MASTERS,
} from '../../../../graphql/listItem/client';
import { serverSideApolloFetching } from '../../../../utils/dataFetching';

type Props = {
  id: string;
};

export default function EditListItem({ id }: Props) {
  return <ListItem id={id} />;
}

EditListItem.layoutType = 'ADMIN';

export function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  const requests = [
    { query: LIST_ITEM_MASTERS },
    { query: LIST_ITEM, variables: { id } },
  ];
  return serverSideApolloFetching(context, requests, 'LIST_ITEM');
}
