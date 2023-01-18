import { successResponse, errorResponse } from '../utils/common';
import { getFarmsByUser } from '../utils/farm';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SUCCESS_MESSAGES;
const { ERROR_FOREIGN_KEY } = ERROR_MESSAGES;

const resolvers = {
  Query: {
    animal: async (root, { id }, { prisma, user }) => {
      const farms = await getFarmsByUser(prisma, user);
      const animal = await prisma.animal.findUnique({
        where: { id },
      });
      if (farms.some((farm) => farm.id === animal.farmId)) {
        return animal;
      }
      return null;
    },
    animals: async (root, args, { prisma, user }) => {
      const farms = await getFarmsByUser(prisma, user);
      const animals = await prisma.animal.findMany({
        where: { farmId: { in: farms.map((farm) => farm.id) } },
      });
      return animals;
    },
  },
  Mutation: {
    upsertAnimal: async (root, { animal }, { prisma }) => {
      try {
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
    deleteAnimal: async (root, { id }, { prisma }) => {
      try {
        const resume = await prisma.animal
          .findUnique({
            where: { id },
          })
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
    farm: (parent, args, { prisma }) =>
      prisma.animal
        .findUnique({
          where: { id: parent.id },
        })
        .farm(),
    resume: (parent, args, { prisma }) =>
      prisma.animal
        .findUnique({
          where: { id: parent.id },
        })
        .resume(),
  },
};

export default resolvers;
