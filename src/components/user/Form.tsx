import { useMutation, useQuery } from '@apollo/client';
import { Form, Input, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RoleEnum } from '../../constants/enums';
import { ROLES_BY_PARENT_USER } from '../../graphql/role/client';
import {
  CURRENT_USER,
  UPSERT_USER,
  USER,
  USERS,
  USER_MASTERS,
} from '../../graphql/user/client';
import { useApollo } from '../../lib/apolloClient';
import { useTranslation } from '../../translations';
import { FormButtons } from '../admin';
import { Loading, Title } from '../shared';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { Option } = Select;

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  parent: { id: string };
  name: string;
  email: string;
  phone: string;
  role: { id: string };
}

type Props = {
  id?: string;
};

const User: React.FC<Props> = ({ id }) => {
  const [data, setData] = useState<User>();
  const [parentOptions, setParentOptions] = useState<User[]>([]);
  const [roleOptions, setRoleOptions] = useState<Role[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const apolloClient = useApollo();
  const [form] = Form.useForm();
  const router = useRouter();
  const t = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: { currentUser },
  } = useQuery(CURRENT_USER);

  const {
    data: { parentUsers },
  } = useQuery(USER_MASTERS, {
    variables: { id },
  });

  const { data: userData } = useQuery(USER, {
    variables: { id },
    skip: !id,
  });
  const user = userData?.user;

  const { data: rolesData } = useQuery(ROLES_BY_PARENT_USER, {
    variables: { parentUserId: user?.id },
    skip: !user?.id,
  });
  const roles = rolesData?.rolesByParentUser.roles;

  const [upsertUser, { loading }] = useMutation(UPSERT_USER, {
    refetchQueries: [{ query: USERS }],
    onCompleted: ({ upsertUser: { result, message } }) => {
      messageApi.open({
        type: result ? 'success' : 'warning',
        content: t.messages[message as keyof typeof t.messages],
      });
      if (result) {
        router.push('/admin/user');
      }
    },
  });

  const onFinish = (values: any) => {
    upsertUser({ variables: { user: { ...values, id } } });
  };

  useEffect(() => {
    setParentOptions(parentUsers);

    if (id) {
      if (!user) {
        router.replace('/admin/user');
        return;
      }
      setData(user);
      setRoleOptions(roles);
      setIsReadOnly(
        user.parent.id !== currentUser.id &&
          currentUser.role.key !== RoleEnum.ADMIN
      );
    } else {
      if (parentUsers.length === 1) {
        setData({
          id: '',
          parent: { id: parentUsers[0].id },
          name: '',
          email: '',
          phone: '',
          role: { id: '' },
        });
        onChangeParent(parentUsers[0].id);
      }
      setIsReadOnly(false);
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    form.setFieldsValue({
      roleId: roleOptions.length === 1 ? roleOptions[0].id : undefined,
    });
    // eslint-disable-next-line
  }, [roleOptions]);

  const onChangeParent = async (parentUserId: string) => {
    const {
      data: { rolesByParentUser },
    } = await apolloClient.query({
      query: ROLES_BY_PARENT_USER,
      fetchPolicy: 'network-only',
      variables: { parentUserId },
    });
    setRoleOptions(rolesByParentUser);
  };

  if (isLoading) return null;

  return (
    <>
      {contextHolder}
      <Title text={t.user.formTitle} />
      <Form form={form} {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t.user.parent}
          name='parentId'
          initialValue={data?.parent.id}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Select
            disabled={parentOptions.length === 1 || isReadOnly}
            onChange={onChangeParent}
          >
            {parentOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={t.user.name}
          name='name'
          initialValue={data?.name}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Input disabled={isReadOnly} />
        </Form.Item>
        <Form.Item
          label={t.user.email}
          name='email'
          initialValue={data?.email}
          rules={[
            { required: true, message: t.rules.required },
            { type: 'email', message: t.rules.invalidEmail },
          ]}
        >
          <Input disabled={isReadOnly} />
        </Form.Item>
        <Form.Item
          label={t.user.phone}
          name='phone'
          initialValue={data?.phone}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Input disabled={isReadOnly} />
        </Form.Item>
        <Form.Item
          label={t.user.role}
          name='roleId'
          initialValue={data?.role.id}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Select disabled>
            {roleOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <FormButtons loading={loading} isReadOnly={isReadOnly} />
      </Form>
      {loading && <Loading />}
    </>
  );
};

export default User;
