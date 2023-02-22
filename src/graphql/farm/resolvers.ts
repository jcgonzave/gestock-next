import { ErrorMessagesEnum, SuccessMessagesEnum } from '../../constants/enums';
import { ContextType, FarmInputType } from '../types';
import { getFarmsByUser } from '../utils/farm';
import { errorResponse, successResponse } from '../utils/responses';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SuccessMessagesEnum;
const { ERROR_FOREIGN_KEY } = ErrorMessagesEnum;

const resolvers = {
  Query: {
    farm: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma } = context;
        const farms = await getFarmsByUser(context);
        if (farms.some((farm) => farm.id === id)) {
          return prisma.farm.findUnique({ where: { id } });
        }
        return null;
      } catch (e) {
        return errorResponse(e);
      }
    },
    farms: (_root: unknown, _args: unknown, context: ContextType) =>
      getFarmsByUser(context),
    farmsMobile: (_root: unknown, _args: unknown, context: ContextType) =>
      getFarmsByUser(context),
  },
  Mutation: {
    upsertFarm: async (
      _root: unknown,
      args: { farm: FarmInputType },
      context: ContextType
    ) => {
      try {
        const { id, name, farmerId, cowboys } = args.farm;
        const { prisma } = context;

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
    deleteFarm: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma } = context;

        const farm = await prisma.farm.findUnique({
          where: { id },
          select: { _count: { select: { animals: true } } },
        });
        const animalsCount = farm?._count.animals || 0;

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
    farmer: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.farm.findUnique({ where: { id } }).farmer();
    },
    cowboys: async (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id: farmId } = parent;
      const { prisma } = context;
      const list = await prisma.cowboysOnFarms.findMany({
        where: { farmId },
        select: { cowboy: true },
      });
      return list.map((item) => item.cowboy);
    },
    animals: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.farm.findUnique({ where: { id } }).animals();
    },
  },
};

export default resolvers;
