import { useMutation, useQuery } from '@apollo/client';
import { Form, Input, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ROLES } from '../../constants/enums';
import { t } from '../../constants/labels';
import {
  ANIMAL,
  ANIMALS,
  ANIMAL_MASTERS,
  UPSERT_ANIMAL,
} from '../../graphql/animal/client';
import { CURRENT_USER } from '../../graphql/user/client';
import { FormButtons } from '../admin';
import { Loading, Title } from '../shared';

const { ADMIN, COMPANY } = ROLES;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const { Option } = Select;

interface Farm {
  id: string;
  name: string;
}

interface Animal {
  code: string;
  farm: Farm;
}

type Props = {
  id?: string;
};

const Animal: React.FC<Props> = ({ id }) => {
  const [farmOptions, setFarmOptions] = useState<Farm[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: { currentUser },
  } = useQuery(CURRENT_USER);
  const {
    data: { farms },
  } = useQuery(ANIMAL_MASTERS);
  const { data: animalData } = useQuery(ANIMAL, {
    variables: { id },
    skip: !id,
  });
  const animal = animalData?.animal;
  const [data, setData] = useState<Animal>(animal);

  const [upsertAnimal, { loading }] = useMutation(UPSERT_ANIMAL, {
    refetchQueries: [{ query: ANIMALS }],
    onCompleted: ({ upsertAnimal: { result, message } }) => {
      messageApi.open({
        type: result ? 'success' : 'warning',
        content: t(`messages.${message}`),
      });
      if (result) {
        router.push('/admin/animal');
      }
    },
  });

  const onFinish = (values: any) => {
    upsertAnimal({ variables: { animal: { ...values, id } } });
  };

  useEffect(() => {
    setFarmOptions(farms);

    if (id) {
      if (!animal) {
        router.replace('/admin/animal');
        return;
      }
      setData(animal);

      setIsReadOnly(
        animal.farm.farmer.id !== currentUser.id &&
          (currentUser.role.key !== COMPANY ||
            !currentUser.children.some(
              (child: { id: string }) => child.id === animal.farm.farmer.id
            )) &&
          currentUser.role.key !== ADMIN
      );
    } else {
      setIsReadOnly(false);
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, [id]);

  if (isLoading) return null;

  return (
    <>
      {contextHolder}
      <Title text={t('animal.formTitle')} />
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t('animal.code')}
          name='code'
          initialValue={data?.code}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Input disabled={isReadOnly} />
        </Form.Item>
        <Form.Item
          label={t('animal.farm')}
          name='farmId'
          initialValue={data?.farm.id}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Select disabled={isReadOnly}>
            {farmOptions.map((option) => (
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

export default Animal;
