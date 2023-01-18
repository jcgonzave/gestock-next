import { InboxOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Form, message, Select, Table, Upload as UploadAntd } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { t } from '../../constants/labels';
import { FARMS } from '../../graphql/farm/client';
import { UPLOAD } from '../../graphql/upload/client';
import { FormButtons } from '../admin';
import { Title } from '../shared';

const { Dragger } = UploadAntd;
const { Option } = Select;

const columns: ColumnsType<any> = [
  {
    title: t('upload.invalid.sheet'),
    dataIndex: 'sheet',
    key: 'sheet',
  },
  {
    title: t('upload.invalid.row'),
    dataIndex: 'row',
    key: 'row',
  },
  {
    title: t('upload.invalid.columns'),
    dataIndex: 'columns',
    key: 'columns',
    render: (value) => <span>{value.join(', ')}</span>,
  },
];

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const Upload = () => {
  const [invalidDataLocations, setInvalidDataLocations] = useState([]);
  const [resumesUploadedCount, setResumesUploadedCount] = useState(0);
  const [eventsUploadedCount, setEventsUploadedCount] = useState(0);

  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: { farms },
  } = useQuery(FARMS);
  const [upload, { loading }] = useMutation(UPLOAD, {
    onCompleted: ({ upload }) => {
      messageApi.open({
        type: 'success',
        content: t('upload.completed'),
      });
      setInvalidDataLocations(upload.invalidDataLocations);
      setResumesUploadedCount(upload.resumesUploadedCount);
      setEventsUploadedCount(upload.eventsUploadedCount);
    },
  });

  const onFinish = (values: any) => {
    setInvalidDataLocations([]);
    const { farmId, dragger } = values;
    upload({ variables: { farmId, file: dragger[0] } });
  };

  return (
    <>
      {contextHolder}
      <Title text={t('upload.title')} />
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t('upload.farm')}
          name='farmId'
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Select>
            {farms.map((farm: any) => (
              <Option key={farm.id} value={farm.id}>
                {farm.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={t('upload.file')}
          name='dragger'
          valuePropName='fileList'
          getValueFromEvent={(e) => {
            setInvalidDataLocations([]);
            if (Array.isArray(e)) {
              return e.slice(e.length - 1);
            }
            return e && e.fileList.slice(e.fileList.length - 1);
          }}
          rules={[{ required: true, message: t('rules.required') }]}
        >
          <Dragger name='file' accept='.xlsx' beforeUpload={() => false}>
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>{t('upload.help')}</p>
          </Dragger>
        </Form.Item>
        <FormButtons loading={loading} />
      </Form>

      {invalidDataLocations.length > 0 && (
        <>
          <h2 style={{ marginTop: 40 }}>{t('upload.result.title')}</h2>
          <h4>
            {t('upload.result.resumes')}
            {': '}
            {resumesUploadedCount}
          </h4>
          <h4>
            {t('upload.result.events')}
            {': '}
            {eventsUploadedCount}
          </h4>
          <h2 style={{ marginTop: 20 }}>{t('upload.invalid.title')}</h2>
          <Table dataSource={invalidDataLocations} columns={columns} />
        </>
      )}
    </>
  );
};

export default Upload;
