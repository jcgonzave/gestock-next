import {
  successResponse,
  errorResponse,
  resolveRelation,
} from '../utils/common';
import { getFarmsByUser } from '../utils/farm';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

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
    upsertFarm: async (root, { farm }, { prisma }) => {
      try {
        const { id, farmerId, cowboys, ...rest } = farm;

        const data = {
          ...rest,
          farmer: { connect: { id: farmerId } },
        };

        await prisma.farm.upsert({
          where: { id: id || '' },
          update: {
            ...data,
            cowboys: resolveRelation('update', cowboys),
          },
          create: {
            ...data,
            cowboys: resolveRelation('create', cowboys),
          },
        });

        return successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteFarm: async (root, { id }, { prisma }) => {
      try {
        const animalsCount = await prisma.farm.findUnique({
          where: { id },
          select: { _count: { select: { animals: true } } },
        });

        if (animalsCount > 0) {
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
    cowboys: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .cowboys(),
    animals: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .animals(),
  },
};

export default resolvers;
