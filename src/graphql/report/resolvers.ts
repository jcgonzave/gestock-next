import { endOfMonth, startOfMonth } from 'date-fns';
import { ContextType, ReportInputType } from '../types';
import { errorResponse } from '../utils/responses';

const resolvers = {
  Query: {
    statsReport: async (
      _root: unknown,
      args: { report: ReportInputType },
      context: ContextType
    ) => {
      try {
        const { farmId, date } = args.report;
        const { prisma } = context;

        const startMonth = startOfMonth(new Date(date));
        const endMonth = endOfMonth(new Date(date));

        if (farmId) {
          const animals = await prisma.animal.findMany({
            where: { farmId: farmId },
          });
          const codes = animals.map((animal) => animal.code);

          const resumes = await prisma.resume.findMany({
            where: { code: { in: codes } },
            include: {
              breed: true,
              stage: true,
              gender: true,
            },
          });

          const events = await prisma.event.findMany({
            where: {
              AND: [
                { resume: { code: { in: codes } } },
                { registeredAt: { gte: startMonth } },
                { registeredAt: { lte: endMonth } },
              ],
            },
            orderBy: { registeredAt: 'desc' },
            include: { listItem: true, updatedBy: true },
          });

          return { resumes: resumes || [], events: events || [] };
        }
        return null;
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  ReportEvent: {
    registeredAt: (parent: { registeredAt: number }) =>
      new Date(parent.registeredAt).toISOString(),
  },
};

export default resolvers;
