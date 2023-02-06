import { Button, Col, Row, Space } from 'antd';
import { useRouter } from 'next/router';
import { useTranslation } from '../../translations';

type Props = {
  loading: boolean;
  isReadOnly?: boolean;
};

const FormButtons: React.FC<Props> = ({ loading, isReadOnly }) => {
  const router = useRouter();
  const t = useTranslation();

  return (
    <Row>
      <Col span={8} offset={8}>
        <Space>
          <Button className='btn-form' onClick={() => router.back()}>
            {t.actions.cancel}
          </Button>
          <Button
            htmlType='submit'
            type='primary'
            loading={loading}
            className='btn-form'
            disabled={isReadOnly}
          >
            {t.actions.save}
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default FormButtons;
