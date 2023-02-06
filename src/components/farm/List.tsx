import type { ColumnsType } from 'antd/es/table';
import { DELETE_FARM, FARMS } from '../../graphql/farm/client';
import { useTranslation } from '../../translations';
import { List } from '../admin';

interface User {
  name: string;
}

interface Farm {
  name: string;
  farmer: User;
}

const Farms = () => {
  const t = useTranslation();

  const columns: ColumnsType<Farm> = [
    {
      title: t.farm.name,
      dataIndex: 'name',
    },
    {
      title: t.farm.farmer,
      dataIndex: 'farmer',
      render: (_, record) => record.farmer && record.farmer.name,
      onFilter: (value, record) =>
        record.farmer &&
        record.farmer.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
    },
  ];

  const props = {
    title: t.farm.listTitle,
    fetch: { query: FARMS, response: 'farms' },
    remove: { mutation: DELETE_FARM, response: 'deleteFarm' },
    add: { text: t.farm.addButton, route: 'admin/farm/add' },
    edit: { route: 'admin/farm/edit' },
    columns,
  };

  return <List {...props} />;
};

export default Farms;
