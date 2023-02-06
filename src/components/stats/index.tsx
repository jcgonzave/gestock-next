import { useQuery } from '@apollo/client';
import { DatePicker, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Loading, Title } from '../../components/shared';
import { LISTS } from '../../constants/enums';
import { FARMS } from '../../graphql/farm/client';
import { STATS_REPORT } from '../../graphql/report/client';
import { useTranslation } from '../../translations';

const { Option } = Select;
const { MonthPicker } = DatePicker;
const { LOT, STATE, LOSS, VACCINE } = LISTS;

type DataSource = { item: string; value: string };

type Table = {
  id: string;
  title: string;
  columns: ColumnsType<DataSource>;
  dataSource: DataSource[];
};

const resumeKeys = ['gender', 'stage', 'breed'];
const eventKeys = [LOT, STATE, LOSS, VACCINE];
const accessKeys = ['access'];

const Stats = () => {
  const [farmId, setFarmId] = useState();
  const [date, setDate] = useState();
  const [processing, setProcessing] = useState(false);
  const [resumeTables, setResumeTables] = useState<Table[]>([]);
  const [eventTables, setEventTables] = useState<Table[]>([]);
  const [accessTables, setAccessTables] = useState<Table[]>([]);

  const t = useTranslation();

  const commonColumns: ColumnsType<DataSource> = [
    { title: t.stats.item, dataIndex: 'item' },
  ];

  const resumeColumns: ColumnsType<DataSource> = commonColumns.concat([
    { title: t.stats.animals, dataIndex: 'value' },
  ]);

  const eventColumns: ColumnsType<DataSource> = commonColumns.concat([
    { title: t.stats.events, dataIndex: 'value' },
  ]);

  const accessColumns: ColumnsType<DataSource> = [
    { title: t.stats.user, dataIndex: 'item' },
    { title: t.stats.date, dataIndex: 'value' },
  ];

  const {
    data: { farms },
  } = useQuery(FARMS);

  const { data, loading, error } = useQuery(STATS_REPORT, {
    skip: !farmId || !date,
    variables: { report: { farmId, date } },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data) {
      setProcessing(true);

      const { statsReport = {} } = data;
      const { resumes = [], events = [] } = statsReport;

      const resumeLists: Table[] = [];
      resumeKeys.forEach((key) => {
        const items = resumes.reduce((previous: any, current: any) => {
          const { item } = current[key];
          return {
            ...previous,
            [item]: (previous[item] || 0) + 1,
          };
        }, {});

        resumeLists.push({
          id: key,
          title: t.resume[key as keyof typeof t.resume],
          columns: resumeColumns,
          dataSource: Object.keys(items).map((key) => ({
            item: key,
            value: items[key],
          })),
        });
      });
      setResumeTables(resumeLists);

      const eventLists: Table[] = [];
      eventKeys.forEach((key) => {
        const items = events
          .filter((event: any) => event.listItem.list === key)
          .reduce((previous: any, current: any) => {
            const { item } = current.listItem;
            return {
              ...previous,
              [item]: (previous[item] || 0) + 1,
            };
          }, {});

        eventLists.push({
          id: key,
          title: t.lists[key],
          columns: eventColumns,
          dataSource: Object.keys(items).map((key) => ({
            item: key,
            value: items[key],
          })),
        });
      });
      setEventTables(eventLists);

      const accessLists: Table[] = [];
      accessKeys.forEach((key) => {
        const items = events.reduce((previous: any, current: any) => {
          const { name: item } = current.updatedBy;
          if (!previous[item]) {
            return {
              ...previous,
              [item]: `Día ${new Date(current.registeredAt).getDate()}`,
            };
          }
          return previous;
        }, {});

        accessLists.push({
          id: key,
          title: t.stats.access,
          columns: accessColumns,
          dataSource: Object.keys(items).map((key) => ({
            item: key,
            value: items[key],
          })),
        });
      });
      setAccessTables(accessLists);

      setProcessing(false);
    }
  }, [data]);

  if (error) return <p>Error: {error.message}</p>;
  if (loading || processing) return <Loading />;

  return (
    <>
      <div className='title-container'>
        <Title text={t.menu.stats} />

        <Select
          placeholder={t.report.farm}
          style={{ width: 300, marginBottom: 10 }}
          value={farmId}
          onChange={(value) => {
            setFarmId(value);
          }}
        >
          {farms.map((farm: any) => (
            <Option key={farm.id} value={farm.id}>
              {farm.name}
            </Option>
          ))}
        </Select>
        <MonthPicker
          placeholder={t.report.month}
          value={date}
          onChange={(value: any) => {
            setDate(value);
          }}
        />
      </div>

      <div id='card-container'>
        {resumeTables
          .concat(eventTables)
          .concat(accessTables)
          .map((table) => (
            <div key={table.id} className='card-table'>
              <Title text={table.title} />
              <Table
                rowKey='item'
                columns={table.columns}
                dataSource={table.dataSource}
              />
            </div>
          ))}
      </div>
    </>
  );
};

export default Stats;
