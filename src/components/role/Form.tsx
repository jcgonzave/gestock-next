import { useMutation, useQuery } from '@apollo/client';
import { Form, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { t } from '../../constants/labels';
import {
  ROLE,
  ROLES,
  ROLE_MASTERS,
  UPSERT_ROLE,
} from '../../graphql/role/client';
import { FormButtons } from '../admin';
import { Loading, Title } from '../shared';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { Option } = Select;

interface Key {
  id: string;
  name: string;
}

interface Module extends Key {}

interface Role {
  id: string;
  key: string;
  modules: Module[];
}

type Props = {
  id?: string;
};

const Role: React.FC<Props> = ({ id }) => {
  const [data, setData] = useState<Role>();
  const [keyOptions, setKeyOptions] = useState<Key[]>([]);
  const [moduleOptions, setModuleOptions] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: { roleKeys, modules },
  } = useQuery(ROLE_MASTERS);
  const { data: roleData } = useQuery(ROLE, {
    variables: { id },
    skip: !id,
  });
  const role = roleData?.role;

  const [upsertRole, { loading }] = useMutation(UPSERT_ROLE, {
    refetchQueries: [{ query: ROLES }],
    onCompleted: ({ upsertRole: { result, message } }) => {
      messageApi.open({
        type: result ? 'success' : 'warning',
        content: t(`messages.${message}`),
      });
      if (result) {
        router.push('/admin/role');
      }
    },
  });

  const onFinish = (values: any) => {
    upsertRole({ variables: { role: { ...values, id } } });
  };

  useEffect(() => {
    setKeyOptions(roleKeys);
    setModuleOptions(modules);

    if (id) {
      if (!role) {
        router.replace('/admin/role');
        return;
      }
      setData(role);
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [id]);

  if (isLoading) return null;

  return (
    <>
      {contextHolder}
      <Title text={t('role.formTitle')} />
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t('role.name')}
          name='key'
          initialValue={data?.key}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Select>
            {keyOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={t('role.modules')}
          name='modules'
          initialValue={data?.modules.map((cowboy) => cowboy.id)}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Select mode='multiple'>
            {moduleOptions.map((option) => (
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

export default Role;
