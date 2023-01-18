import { errorResponse, successResponse } from '../utils/common';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { getFarmsByUser } from '../utils/farm';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SUCCESS_MESSAGES;
const { ERROR_FOREIGN_KEY } = ERROR_MESSAGES;

const resolvers = {
  Query: {
    farm: async (root, { id }, { prisma, user }) => {
      const farms = await getFarmsByUser(prisma, user);
      if (farms.some((farm) => farm.id === id)) {
        return prisma.farm.findUnique({ where: { id } });
      }
      return null;
    },
    farms: (root, args, { prisma, user }) => getFarmsByUser(prisma, user),
    farmsMobile: (root, args, { prisma, user }) => getFarmsByUser(prisma, user),
  },
  Mutation: {
    upsertFarm: async (root, { farm }, { prisma, user }) => {
      try {
        const { id, name, farmerId, cowboys } = farm;

        const create = {
          name,
          farmer: { connect: { id: farmerId } },
          cowboys: {
            connectOrCreate: cowboys.map((cowboyId) => ({
              create: { cowboyId },
              where: { cowboyId_farmId: { farmId: id || '', cowboyId } },
            })),
          },
        };

        const update = {
          ...create,
          cowboys: { deleteMany: {}, ...create.cowboys },
        };

        await prisma.farm.upsert({
          where: { id: id || '' },
          update,
          create,
        });

        return successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteFarm: async (root, { id }, { prisma }) => {
      try {
        const {
          _count: { animals },
        } = await prisma.farm.findUnique({
          where: { id },
          select: { _count: { select: { animals: true } } },
        });

        if (animals > 0) {
          return errorResponse(ERROR_FOREIGN_KEY);
        }

        await prisma.farm.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Farm: {
    farmer: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .farmer(),
    cowboys: async (parent, args, { prisma }) => {
      const list = await prisma.cowboysOnFarms.findMany({
        where: { farmId: parent.id },
        select: { cowboy: true },
      });
      return list.map((item) => item.cowboy);
    },
    animals: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .animals(),
  },
};

export default resolvers;
