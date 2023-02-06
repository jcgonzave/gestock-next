import type { ColumnsType } from 'antd/es/table';
import { DELETE_ROLE, ROLES } from '../../graphql/role/client';
import { useTranslation } from '../../translations';
import { List } from '../admin';

interface Role {
  name: string;
}

const Roles = () => {
  const t = useTranslation();

  const columns: ColumnsType<Role> = [
    {
      title: t.role.name,
      dataIndex: 'name',
    },
  ];

  const props = {
    title: t.role.listTitle,
    fetch: { query: ROLES, response: 'roles' },
    remove: { mutation: DELETE_ROLE, response: 'deleteRole' },
    add: { text: t.role.addButton, route: 'admin/role/add' },
    edit: { route: 'admin/role/edit' },
    columns,
  };

  return <List {...props} />;
};

export default Roles;
