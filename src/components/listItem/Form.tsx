import { useMutation, useQuery } from '@apollo/client';
import { Form, Input, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { t } from '../../constants/labels';
import {
  LIST_ITEM,
  LIST_ITEMS,
  LIST_ITEM_MASTERS,
  UPSERT_LIST_ITEM,
} from '../../graphql/listItem/client';
import { FormButtons } from '../admin';
import { Loading, Title } from '../shared';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { Option } = Select;

interface List {
  id: string;
  name: string;
}

interface State extends List {}

interface ListItem {
  id: string;
  list: string;
  item: string;
  state: string;
}

type Props = {
  id?: string;
};

const ListItem: React.FC<Props> = ({ id }) => {
  const [data, setData] = useState<ListItem>();
  const [listOptions, setListOptions] = useState<List[]>([]);
  const [stateOptions, setStateOptions] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: { lists, states },
  } = useQuery(LIST_ITEM_MASTERS);
  const { data: listItemData } = useQuery(LIST_ITEM, {
    variables: { id },
    skip: !id,
  });
  const listItem = listItemData?.listItem;

  const [upsertListItem, { loading }] = useMutation(UPSERT_LIST_ITEM, {
    refetchQueries: [{ query: LIST_ITEMS }],
    onCompleted: ({ upsertListItem: { result, message } }) => {
      messageApi.open({
        type: result ? 'success' : 'warning',
        content: t(`messages.${message}`),
      });
      if (result) {
        router.push('/admin/listItem');
      }
    },
  });

  const onFinish = (values: any) => {
    upsertListItem({
      variables: { listItem: { ...values, id } },
    });
  };

  useEffect(() => {
    setListOptions(lists);
    setStateOptions(states);

    if (id) {
      if (!listItem) {
        router.replace('/admin/listItem');
        return;
      }
      setData(listItem);
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [id]);

  if (isLoading) return null;

  return (
    <>
      {contextHolder}
      <Title text={t('listItem.formTitle')} />
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t('listItem.list')}
          name='list'
          initialValue={data?.list}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Select>
            {listOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={t('listItem.item')}
          name='item'
          initialValue={data?.item}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('listItem.state')}
          name='state'
          initialValue={data?.state}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Select>
            {stateOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <FormButtons loading={loading} />
      </Form>
      {loading && <Loading />}
    </>
  );
};

export default ListItem;
