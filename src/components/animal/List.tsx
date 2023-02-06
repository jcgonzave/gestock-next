import type { ColumnsType } from 'antd/es/table';
import { ANIMALS, DELETE_ANIMAL } from '../../graphql/animal/client';
import { useTranslation } from '../../translations';
import { List } from '../admin';

interface Farm {
  name: string;
}

interface Animal {
  code: string;
  farm: Farm;
}

const Animals: React.FC = () => {
  const t = useTranslation();

  const columns: ColumnsType<Animal> = [
    {
      title: t.animal.code,
      dataIndex: 'code',
    },
    {
      title: t.animal.farm,
      dataIndex: 'farm',
      render: (_, record) => record.farm && record.farm.name,
      onFilter: (value, record) =>
        record.farm &&
        record.farm.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
    },
  ];

  const props = {
    title: t.animal.listTitle,
    fetch: { query: ANIMALS, response: 'animals' },
    remove: { mutation: DELETE_ANIMAL, response: 'deleteAnimal' },
    add: { text: t.animal.addButton, route: 'admin/animal/add' },
    edit: { route: 'admin/animal/edit' },
    columns,
  };

  return <List {...props} />;
};

export default Animals;
