import { useQuery } from '@apollo/client';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { t } from '../../constants/labels';
import { CURRENT_USER } from '../../graphql/user/client';

interface NavItem {
  label: string;
  key: string;
  href: string;
}

const ADMIN_ITEMS: Array<NavItem> = [
  {
    label: t('menu.roles'),
    key: 'ROLE',
    href: '/admin/role',
  },
  {
    label: t('menu.users'),
    key: 'USER',
    href: '/admin/user',
  },
  {
    label: t('menu.listItems'),
    key: 'LIST_ITEM',
    href: '/admin/listItem',
  },
  {
    label: t('menu.farms'),
    key: 'FARM',
    href: '/admin/farm',
  },
  {
    label: t('menu.animals'),
    key: 'ANIMAL',
    href: '/admin/animal',
  },
  {
    label: t('menu.upload'),
    key: 'UPLOAD',
    href: '/admin/upload',
  },
  {
    label: t('menu.reports'),
    key: '*',
    href: '/',
  },
];

const USER_ITEMS: Array<NavItem> = [
  {
    label: t('menu.stats'),
    key: 'STATS',
    href: '/',
  },
  {
    label: t('menu.admin'),
    key: '*',
    href: '/admin',
  },
];

type Props = {
  layoutType: 'ADMIN' | 'USER' | undefined;
};

const Navbar: React.FC<Props> = ({ layoutType }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [current, setCurrent] = useState('');

  const router = useRouter();

  const {
    data: {
      currentUser: {
        role: { modules },
      },
    },
  } = useQuery(CURRENT_USER);

  useEffect(() => {
    const items = (layoutType === 'ADMIN' ? ADMIN_ITEMS : USER_ITEMS).filter(
      (item) =>
        modules.some(
          (module: { key: string }) =>
            item.key === module.key || item.key === '*'
        )
    );
    setNavItems(items);
    setCurrent(items.find((item) => item.href === router.pathname)?.key || '*');
  }, [layoutType, modules, router.pathname]);

  const onClick: MenuProps['onClick'] = (e) => {
    router.push(navItems.find((item) => item.key === e.key)?.href || '/');
  };

  return (
    <div className='flex-row'>
      <Image src='/logo.png' width={50} height={50} alt='Logo Gestock' />
      <h2>Gestock</h2>
      <Menu
        onClick={onClick}
        mode='horizontal'
        items={navItems}
        selectedKeys={[current]}
      />
    </div>
  );
};

export default Navbar;
