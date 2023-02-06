import type { ColumnsType } from 'antd/es/table';
import { DELETE_USER, USERS } from '../../graphql/user/client';
import { useTranslation } from '../../translations';
import { List } from '../admin';

interface Role {
  name: string;
}

interface User {
  name: string;
  email: string;
  phone: string;
  role: Role;
}

const Users = () => {
  const t = useTranslation();

  const columns: ColumnsType<User> = [
    {
      title: t.user.name,
      dataIndex: 'name',
    },
    {
      title: t.user.email,
      dataIndex: 'email',
    },
    {
      title: t.user.phone,
      dataIndex: 'phone',
    },
    {
      title: t.user.role,
      dataIndex: 'role',
      render: (_, record) => record.role && record.role.name,
      onFilter: (value, record) =>
        record.role &&
        record.role.name
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
    },
  ];

  const props = {
    title: t.user.listTitle,
    fetch: { query: USERS, response: 'users' },
    remove: { mutation: DELETE_USER, response: 'deleteUser' },
    add: { text: t.user.addButton, route: 'admin/user/add' },
    edit: { route: 'admin/user/edit' },
    columns,
  };

  return <List {...props} />;
};

export default Users;
