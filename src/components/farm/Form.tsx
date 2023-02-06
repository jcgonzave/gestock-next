import { useMutation, useQuery } from '@apollo/client';
import { Form, Input, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ROLES } from '../../constants/enums';
import {
  FARM,
  FARMS,
  FARM_MASTERS,
  UPSERT_FARM,
} from '../../graphql/farm/client';
import { CURRENT_USER, USER } from '../../graphql/user/client';
import { useApollo } from '../../lib/apolloClient';
import { useTranslation } from '../../translations';
import { FormButtons } from '../admin';
import { Loading, Title } from '../shared';

const { ADMIN, COMPANY } = ROLES;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { Option } = Select;

interface User {
  id: string;
  name: string;
}

interface Farm {
  id: string;
  name: string;
  farmer: User;
  cowboys: User[];
}

type Props = {
  id?: string;
};

const Farm: React.FC<Props> = ({ id }) => {
  const [data, setData] = useState<Farm>();
  const [farmerOptions, setFarmerOptions] = useState<User[]>([]);
  const [cowboyOptions, setCowboyOptions] = useState<User[]>([]);
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
    data: { farmers },
  } = useQuery(FARM_MASTERS);
  const { data: farmData } = useQuery(FARM, { variables: { id }, skip: !id });
  const farm = farmData?.farm;

  const [upsertFarm, { loading }] = useMutation(UPSERT_FARM, {
    refetchQueries: [{ query: FARMS }],
    onCompleted: ({ upsertFarm: { result, message } }) => {
      messageApi.open({
        type: result ? 'success' : 'warning',
        content: t.messages[message as keyof typeof t.messages],
      });
      if (result) {
        router.push('/admin/farm');
      }
    },
  });

  const onFinish = (values: any) => {
    upsertFarm({ variables: { farm: { ...values, id } } });
  };

  useEffect(() => {
    setFarmerOptions(farmers);

    if (id) {
      if (!farm) {
        router.replace('/admin/farm');
        return;
      }
      setData(farm);
      setCowboyOptions(farm.farmer.children);

      setIsReadOnly(
        farm.farmer.id !== currentUser.id &&
          (currentUser.role.key !== COMPANY ||
            !currentUser.children.some(
              (child: { id: string }) => child.id === farm.farmer.id
            )) &&
          currentUser.role.key !== ADMIN
      );
    } else {
      if (farmers.length === 1) {
        setData({
          id: '',
          name: '',
          farmer: { id: farmers[0].id, name: '' },
          cowboys: [],
        });
        onChangeFarmer(farmers[0].id);
      }
      setIsReadOnly(false);
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [id]);

  const onChangeFarmer = async (farmerId: string) => {
    form.setFieldsValue({ cowboys: undefined });
    const {
      data: {
        user: { children: cowboys },
      },
    } = await apolloClient.query({
      query: USER,
      fetchPolicy: 'network-only',
      variables: { id: farmerId },
    });
    setCowboyOptions(cowboys);
  };

  if (isLoading) return null;

  return (
    <>
      {contextHolder}
      <Title text={t.farm.formTitle} />
      <Form form={form} {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t.farm.name}
          name='name'
          initialValue={data?.name}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Input disabled={isReadOnly} />
        </Form.Item>
        <Form.Item
          label={t.farm.farmer}
          name='farmerId'
          initialValue={data?.farmer.id}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Select
            onChange={onChangeFarmer}
            disabled={farmerOptions.length === 1 || isReadOnly}
          >
            {farmerOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={t.farm.cowboys}
          name='cowboys'
          initialValue={data?.cowboys.map((cowboy) => cowboy.id)}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Select mode='multiple' disabled={isReadOnly}>
            {cowboyOptions.map((option) => (
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

export default Farm;
