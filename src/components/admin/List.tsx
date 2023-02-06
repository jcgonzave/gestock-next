import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  ApolloCache,
  DefaultContext,
  MutationFunctionOptions,
  OperationVariables,
  useMutation,
  useQuery,
} from '@apollo/client';
import type { InputRef } from 'antd';
import {
  Button,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { DocumentNode } from 'graphql/language/ast';
import { NextRouter, useRouter } from 'next/router';
import { useRef } from 'react';
import { useTranslation } from '../../translations';
import { Loading, Title } from '../shared';

const actionsColumn = (
  operation: (
    options: MutationFunctionOptions<
      any,
      OperationVariables,
      DefaultContext,
      ApolloCache<any>
    >
  ) => void,
  route: string,
  router: NextRouter,
  t: any
): ColumnType<any> => ({
  title: t.actions.title,
  dataIndex: 'action',
  align: 'right',
  render: (_, record) => (
    <Space>
      <Tooltip title={t.actions.edit}>
        <Button
          type='primary'
          shape='circle'
          icon={<EditOutlined />}
          onClick={() => router.push(`/${route}/${record.id}`)}
        />
      </Tooltip>
      <Popconfirm
        title={t.actions.confirm}
        onConfirm={() => {
          operation({ variables: { id: record.id } });
        }}
        okText={t.actions.yes}
        cancelText={t.actions.no}
        placement='bottom'
      >
        <Tooltip title={t.actions.delete}>
          <Button
            type='primary'
            danger
            shape='circle'
            icon={<DeleteOutlined />}
          />
        </Tooltip>
      </Popconfirm>
    </Space>
  ),
});

type Props = {
  title: string;
  fetch: { query: DocumentNode; response: string };
  remove: { mutation: DocumentNode; response: string };
  add: { text: string; route: string };
  edit: { route: string };
  columns: ColumnsType<any>;
};

const List: React.FC<Props> = ({
  title,
  fetch,
  remove,
  add,
  edit,
  columns,
}) => {
  const searchInput = useRef<InputRef>(null);

  const router = useRouter();
  const t = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const { data } = useQuery(fetch.query);
  const [operation, { loading }] = useMutation(remove.mutation, {
    refetchQueries: [{ query: fetch.query }],
    onCompleted: (data) => {
      messageApi.open({
        type: data[remove.response].result ? 'success' : 'warning',
        content:
          t.messages[data[remove.response].message as keyof typeof t.messages],
      });
    },
    onError: () => {},
  });

  const handleSearch = (confirm: (param?: FilterConfirmProps) => void) => {
    confirm();
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: (param?: FilterConfirmProps) => void
  ) => {
    clearFilters();
    confirm();
  };

  const getColumnSearchProps = (column: ColumnType<any>): ColumnType<any> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={t.actions.search}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(confirm)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(confirm)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            {t.actions.search}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size='small'
            style={{ width: 90 }}
          >
            {t.actions.reset}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter:
      (column.onFilter as (
        value: string | number | boolean,
        record: any
      ) => boolean) ||
      ((value, record) =>
        column.dataIndex &&
        record[column.dataIndex as keyof any]
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase())),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  return (
    <>
      {contextHolder}
      <div className='title-container'>
        <Title text={title} />
        <Button onClick={() => router.push(`/${add.route}`)} type='primary'>
          {add.text}
        </Button>
      </div>
      <Table
        rowKey='id'
        dataSource={data[fetch.response]}
        columns={[
          ...columns.map((column) => ({
            ...column,
            ...getColumnSearchProps(column),
          })),
          actionsColumn(operation, edit.route, router, t),
        ]}
      />
      {loading && <Loading />}
    </>
  );
};

export default List;
