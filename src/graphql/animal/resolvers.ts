import { ErrorMessagesEnum, SuccessMessagesEnum } from '../../constants/enums';
import { AnimalInputType, ContextType } from '../types';
import { getFarmsByUser } from '../utils/farm';
import { errorResponse, successResponse } from '../utils/responses';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SuccessMessagesEnum;
const { ERROR_FOREIGN_KEY } = ErrorMessagesEnum;

const resolvers = {
  Query: {
    animal: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma } = context;
        const farms = await getFarmsByUser(context);
        const animal = await prisma.animal.findUnique({
          where: { id },
        });
        if (farms.some((farm) => farm.id === animal?.farmId)) {
          return animal;
        }
        return null;
      } catch (e) {
        return errorResponse(e);
      }
    },
    animals: async (_root: unknown, _args: unknown, context: ContextType) => {
      try {
        const { prisma } = context;
        const farms = await getFarmsByUser(context);
        const animals = await prisma.animal.findMany({
          where: { farmId: { in: farms.map((farm) => farm.id) } },
        });
        return animals;
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Mutation: {
    upsertAnimal: async (
      _root: unknown,
      args: { animal: AnimalInputType },
      context: ContextType
    ) => {
      try {
        const { animal } = args;
        const { prisma } = context;
        const { id, ...data } = animal;

        await prisma.animal.upsert({
          where: { id: id || '' },
          update: data,
          create: data,
        });

        return successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteAnimal: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma } = context;
        const resume = await prisma.animal
          .findUnique({ where: { id } })
          .resume();
        if (resume) {
          return errorResponse(ERROR_FOREIGN_KEY);
        }

        await prisma.animal.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Animal: {
    farm: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.animal.findUnique({ where: { id } }).farm();
    },
    resume: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.animal.findUnique({ where: { id } }).resume();
    },
  },
};

export default resolvers;
