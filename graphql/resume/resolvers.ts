import { getFarmsByUser } from '../utils/farm';
import { errorResponse } from '../utils/common';

const resolvers = {
  Query: {
    resumesByFarmMobile: async (root, { farmId }, { prisma }) => {
      if (farmId) {
        const animals = await prisma.animal.findMany({
          where: { farmId },
        });
        const resumes = await prisma.resume.findMany({
          where: {
            animalCode: { in: animals.map((animal) => animal.code) },
          },
        });

        return resumes || [];
      }
      return [];
    },
  },
  Mutation: {
    syncResumesMobile: async (root, args, { prisma, user }) => {
      let validResumes = [];
      try {
        let farms = await getFarmsByUser(prisma, user);
        if (farms && farms.length > 0) {
          farms = farms.map((farm) => farm.id);
          for (const resume of args.resumes) {
            const farm = await prisma.animal
              .findUnique({ where: { code: resume.animalCode } })
              .farm();
            if (farm && farms.indexOf(farm.id) > -1) {
              const {
                modified, //exclude
                isNew, //exclude
                isValid, //exclude
                hasNewEvents, //exclude
                animalCode,
                birthday,
                initialWeight,
                registeredAt,
                ...data
              } = resume;

              const create = {
                ...data,
                birthday: new Date(birthday),
                initialWeight: parseFloat(initialWeight),
                registeredAt: new Date(registeredAt),
                updatedById: user.id,
              };

              const update = {
                name: data.name,
                caravan: data.caravan,
              };

              await prisma.resume.upsert({
                where: { animalCode },
                create,
                update,
              });
              validResumes.push(animalCode);
            }
          }

          for (const event of args.events) {
            const farm = await prisma.animal
              .findUnique({ where: { code: event.animalCode } })
              .farm();
            if (farm && farms.indexOf(farm.id) > -1) {
              const {
                isNew, //exclude
                eventId, //exclude
                animalCode,
                numericValue,
                registeredAt,
                ...rest
              } = event;

              animalCode: String!;

              const resume = await prisma.resume.findUnique({
                where: { animalCode: event.animalCode },
              });
              const data = {
                ...rest,
                resumeId: resume.id,
                numericValue: parseFloat(numericValue) || 0,
                registeredAt: new Date(registeredAt),
                updatedById: user.id,
              };

              await prisma.event.create({ data });
              if (validResumes.indexOf(animalCode) === -1) {
                validResumes.push(animalCode);
              }
            }
          }
        } else {
          validResumes = null;
        }
      } catch (e) {
        return errorResponse(e);
      }

      return {
        message: 'OK',
        status: 200,
        result: validResumes,
      };
    },
  },
  Resume: {
    events: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .events(),
  },
  Event: {
    listItem: (parent, args, { prisma }) =>
      prisma.farm
        .findUnique({
          where: { id: parent.id },
        })
        .listItem(),
  },
};

export default resolvers;
