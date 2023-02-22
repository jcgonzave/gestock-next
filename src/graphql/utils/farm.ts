import { RoleEnum } from '../../constants/enums';
import { ContextType } from '../types';

const { ADMIN, COMPANY, FARMER, COWBOY } = RoleEnum;

const getFarmsByUser = async (context: ContextType) => {
  const { prisma, currentUser } = context;
  const { id } = currentUser;
  const key = (
    await prisma.user.findUnique({
      where: { id },
      select: { role: { select: { key: true } } },
    })
  )?.role.key;
  let farms;
  if (key === COWBOY) {
    farms = await prisma.cowboysOnFarms.findMany({
      where: { cowboyId: id },
      select: { farm: true },
    });
    return farms.map((item) => item.farm);
  } else if (key === FARMER) {
    farms = await prisma.user
      .findUnique({
        where: { id },
      })
      .farmsAsFarmer();
  } else if (key === COMPANY) {
    farms = await prisma.farm.findMany({
      where: { farmer: { parentId: id } },
    });
  } else if (key === ADMIN) {
    farms = await prisma.farm.findMany();
  }
  return farms || [];
};

export { getFarmsByUser };
