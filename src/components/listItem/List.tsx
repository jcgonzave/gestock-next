import type { ColumnsType } from 'antd/es/table';
import { t } from '../../constants/labels';
import { DELETE_LIST_ITEM, LIST_ITEMS } from '../../graphql/listItem/client';
import { List } from '../admin';

interface ListItem {
  list: string;
  item: string;
  state: string;
}

const columns: ColumnsType<ListItem> = [
  {
    title: t('listItem.list'),
    dataIndex: 'list',
    render: (text) => text && t(`lists.${text}`),
    onFilter: (value, record) =>
      t(`lists.${record.list}`)
        .toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase()),
  },
  {
    title: t('listItem.item'),
    dataIndex: 'item',
  },
  {
    title: t('listItem.state'),
    dataIndex: 'state',
    render: (text) => text && t(`states.${text}`),
    onFilter: (value, record) =>
      t(`states.${record.state}`)
        .toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase()),
  },
];

const props = {
  title: t('listItem.listTitle'),
  fetch: { query: LIST_ITEMS, response: 'listItems' },
  remove: { mutation: DELETE_LIST_ITEM, response: 'deleteListItem' },
  add: { text: t('listItem.addButton'), route: 'admin/listItem/add' },
  edit: { route: 'admin/listItem/edit' },
  columns,
};

const ListItems = () => <List {...props} />;

export default ListItems;
