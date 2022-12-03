import { startOfMonth, endOfMonth } from 'date-fns';

const resolvers = {
  Query: {
    statsReport: async (root, { report }, { prisma }) => {
      const { farmId, date } = report;

      const startMonth = startOfMonth(new Date(date));
      const endMonth = endOfMonth(new Date(date));

      if (farmId) {
        const animals = await prisma.animal.findMany({
          where: { farmId: farmId },
        });
        const codes = animals.map((animal) => animal.code);

        const resumes = await prisma.resume.findMany({
          where: { animalCode: { in: codes } },
          include: {
            breed: true,
            stage: true,
            gender: true,
          },
        });

        const events = await prisma.event.findMany({
          where: {
            AND: [
              { resume: { animalCode: { in: codes } } },
              { registeredAt: { gte: startMonth } },
              { registeredAt: { lte: endMonth } },
            ],
          },
          orderBy: { registeredAt: 'desc' },
          include: { listItem: true },
        });

        return { resumes: resumes || [], events: events || [] };
      }
      return null;
    },
  },
};

export default resolvers;
