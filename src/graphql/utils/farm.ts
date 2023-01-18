import { ROLES } from './constants';

const { ADMIN, COMPANY, FARMER, COWBOY } = ROLES;

const getFarmsByUser = async (prisma, user) => {
  const { id } = user;
  const key = (
    await prisma.user.findUnique({
      where: { id },
      select: { role: { select: { key: true } } },
    })
  )?.role.key;
  let farms;
  if (key === COWBOY) {
    farms = await prisma.user
      .findUnique({
        where: { id },
      })
      .farmsAsCowboy();
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
  return farms;
};

export { getFarmsByUser };
