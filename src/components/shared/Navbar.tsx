import { useQuery } from '@apollo/client';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CURRENT_USER } from '../../graphql/user/client';
import { useTranslation } from '../../translations';

interface NavItem {
  label: string;
  key: string;
  href: string;
}

type LayoutType = 'ADMIN' | 'USER';
type Props = {
  layoutType: LayoutType;
};

const getMenuItems = (layoutType: LayoutType, t: any): NavItem[] =>
  ({
    ['ADMIN']: [
      {
        label: t.menu.roles,
        key: 'ROLE',
        href: '/admin/role',
      },
      {
        label: t.menu.users,
        key: 'USER',
        href: '/admin/user',
      },
      {
        label: t.menu.listItems,
        key: 'LIST_ITEM',
        href: '/admin/listItem',
      },
      {
        label: t.menu.farms,
        key: 'FARM',
        href: '/admin/farm',
      },
      {
        label: t.menu.animals,
        key: 'ANIMAL',
        href: '/admin/animal',
      },
      {
        label: t.menu.upload,
        key: 'UPLOAD',
        href: '/admin/upload',
      },
      {
        label: t.menu.stats,
        key: '*',
        href: '/',
      },
    ],
    ['USER']: [
      {
        label: t.menu.stats,
        key: 'STATS',
        href: '/',
      },
    ],
  }[layoutType] || []);

const Navbar: React.FC<Props> = ({ layoutType }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [current, setCurrent] = useState('');

  const router = useRouter();
  const t = useTranslation();

  const {
    data: {
      currentUser: {
        role: { modules },
      },
    },
  } = useQuery(CURRENT_USER);

  useEffect(() => {
    const items = getMenuItems(layoutType, t).filter((item: NavItem) =>
      modules.some(
        (module: { key: string }) =>
          item.key === module.key ||
          (layoutType === 'ADMIN' && item.key === '*')
      )
    );
    if (layoutType === 'USER') {
      const adminItems = getMenuItems('ADMIN', t).filter((item: NavItem) =>
        modules.some((module: { key: string }) => item.key === module.key)
      );
      if (adminItems.length > 0) {
        items.push({ ...adminItems[0], label: t.menu.admin });
      }
    }
    setNavItems(items);
    setCurrent(
      items.find((item: NavItem) => router.pathname.includes(item.href))?.key ||
        '*'
    );
  }, [layoutType, modules, router.pathname, t]);

  const onClick: MenuProps['onClick'] = (e) => {
    router.push(navItems.find((item) => item.key === e.key)?.href || '/');
  };

  return (
    <div className='flex-row'>
      <Image src='/logo.png' width={102} height={64} alt='Logo MTRAZA' />
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
