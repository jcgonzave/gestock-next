import { InboxOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Form, message, Select, Table, Upload as UploadAntd } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { read } from 'xlsx';
import { FARMS } from '../../graphql/farm/client';
import { BULK_UPLOAD_EXCEL } from '../../graphql/resume/client';
import { useTranslation } from '../../translations';
import { FormButtons } from '../admin';
import { Title } from '../shared';

const { Dragger } = UploadAntd;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const Upload = () => {
  const [invalidData, setInvalidData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const t = useTranslation();

  const columns: ColumnsType<any> = [
    {
      title: t.upload.invalid.sheet,
      dataIndex: 'sheet',
      key: 'sheet',
    },
    {
      title: t.upload.invalid.row,
      dataIndex: 'row',
      key: 'row',
    },
    {
      title: t.upload.invalid.columns,
      dataIndex: 'columns',
      key: 'columns',
      render: (value) => <span>{value.join(', ')}</span>,
    },
  ];

  const {
    data: { farms },
  } = useQuery(FARMS);
  const [bulkUploadExcel, { loading }] = useMutation(BULK_UPLOAD_EXCEL, {
    onCompleted: ({ bulkUploadExcel }) => {
      messageApi.open({
        type: 'success',
        content: t.upload.completed,
      });
      setInvalidData(bulkUploadExcel.invalidData);
    },
  });

  const getDataFromFile = async (file: any) => {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const resumes = getResumes(workbook.Sheets[workbook.SheetNames[0]]);
    const events = getEvents(workbook.Sheets[workbook.SheetNames[1]]);
    return { resumes, events };
  };

  const getResumes = (data: any) => {
    const resumes = [];
    let row = 2;
    let animalCode = data[`A${row}`] && String(data[`A${row}`].v);
    while (animalCode) {
      resumes.push({
        animalCode,
        caravan: data[`B${row}`] && String(data[`B${row}`].v),
        birthday: data[`C${row}`] && String(data[`C${row}`].v),
        initialWeight: data[`D${row}`] && String(data[`D${row}`].v),
        breed: data[`E${row}`] && String(data[`E${row}`].v),
        stage: data[`F${row}`] && String(data[`F${row}`].v),
        gender: data[`G${row}`] && String(data[`G${row}`].v),
        color: data[`H${row}`] && String(data[`H${row}`].v),
        name: data[`I${row}`] && String(data[`I${row}`].v),
      });
      row = row += 1;
      animalCode = data[`A${row}`] && String(data[`A${row}`].v);
    }
    return resumes;
  };

  const getEvents = (data: any) => {
    const events = [];
    let row = 2;
    let animalCode = data[`A${row}`] && String(data[`A${row}`].v);
    while (animalCode) {
      events.push({
        animalCode,
        list: data[`B${row}`] && String(data[`B${row}`].v),
        item: data[`C${row}`] && String(data[`C${row}`].v),
        comments: data[`D${row}`] && String(data[`D${row}`].v),
      });
      row = row += 1;
      animalCode = data[`A${row}`] && String(data[`A${row}`].v);
    }
    return events;
  };

  const onFinish = async (values: any) => {
    setInvalidData([]);
    const { farmId, dragger } = values;
    const { originFileObj: file } = dragger[0];
    const { resumes, events } = await getDataFromFile(file);
    bulkUploadExcel({ variables: { farmId, resumes, events } });
  };

  return (
    <>
      {contextHolder}
      <Title text={t.upload.title} />
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label={t.upload.farm}
          name='farmId'
          rules={[{ required: true, message: t.rules.required }]}
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
          label={t.upload.file}
          name='dragger'
          valuePropName='fileList'
          getValueFromEvent={(e) => {
            setInvalidData([]);
            if (Array.isArray(e)) {
              return e.slice(e.length - 1);
            }
            return e && e.fileList.slice(e.fileList.length - 1);
          }}
          rules={[{ required: true, message: t.rules.required }]}
        >
          <Dragger name='file' accept='.xlsx' beforeUpload={() => false}>
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>{t.upload.help}</p>
          </Dragger>
        </Form.Item>
        <FormButtons loading={loading} />
      </Form>

      {invalidData.length > 0 && (
        <>
          <h2 style={{ marginTop: 40 }}>{t.upload.resultTitle}</h2>
          <Table dataSource={invalidData} columns={columns} />
        </>
      )}
    </>
  );
};

export default Upload;
