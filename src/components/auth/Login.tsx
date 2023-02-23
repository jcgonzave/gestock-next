import { useMutation } from '@apollo/client';
import { Button, Card, Form, Input, message, Row, Space } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Loading } from '../../components/shared';
import { LOGIN } from '../../graphql/auth/client';
import { useTranslation } from '../../translations';

const Login: React.FC = () => {
  const router = useRouter();
  const t = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: ({ login: { response } }) => {
      messageApi.open({
        type: response.result ? 'success' : 'warning',
        content: t.messages[response.message as keyof typeof t.messages],
      });
      router.push('/');
    },
    onError: () => {},
  });

  const onFinish = (values: any) => {
    login({ variables: values });
  };

  return (
    <>
      {contextHolder}
      <Row className='flex-container'>
        <Card>
          <Space direction='vertical' align='center'>
            <Image
              src='/logo.png'
              width={200}
              height={124}
              alt='Logo MTRAZA'
              priority
            />
            <Form
              layout='vertical'
              onFinish={onFinish}
              autoComplete='off'
              className='w-400'
            >
              <Form.Item
                label={t.login.email}
                name='email'
                rules={[
                  { required: true, message: t.rules.required },
                  { type: 'email', message: t.rules.invalidEmail },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t.login.password}
                name='password'
                rules={[{ required: true, message: t.rules.required }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type='primary' htmlType='submit' block>
                  {t.actions.login}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Row>
      {loading && <Loading />}
    </>
  );
};

export default Login;
