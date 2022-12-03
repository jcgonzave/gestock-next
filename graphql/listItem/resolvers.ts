import { successResponse, errorResponse } from '../utils/common';
import { SUCCESS_MESSAGES, LISTS } from '../utils/constants';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SUCCESS_MESSAGES;
const {
  COLOR,
  STATE,
  STAGE,
  LOT,
  MEDICINE,
  WEIGHT,
  BREED,
  REPRODUCTION,
  GENDER,
  LOSS,
  VACCINE,
} = LISTS;

const lists = [
  { id: COLOR, name: 'Color' },
  { id: STATE, name: 'Estado reproductivo' },
  { id: STAGE, name: 'Etapa de desarrollo' },
  { id: LOT, name: 'Lote' },
  { id: MEDICINE, name: 'Medicamento' },
  { id: WEIGHT, name: 'Peso' },
  { id: BREED, name: 'Raza' },
  { id: REPRODUCTION, name: 'Reproducción' },
  { id: GENDER, name: 'Sexo' },
  { id: LOSS, name: 'Siniestro' },
  { id: VACCINE, name: 'Vacuna' },
];

const resolvers = {
  Query: {
    lists: () => lists,
    listItem: (root, { id }, { prisma }) =>
      prisma.listItem.findUnique({ where: { id } }),
    listItems: (root, args, { prisma }) => prisma.listItem.findMany(),
    listsMobile: () => lists,
    listItemsMobile: async (root, args, { prisma }) => {
      if (args.date) {
        const date = new Date(args.date);
        const items = await prisma.listItem.findMany({
          where: {
            updatedAt: { gt: date },
          },
          orderBy: { updatedAt: 'desc' },
        });
        return items;
      }
      return prisma.listItem.findMany({ orderBy: { updatedAt: 'desc' } });
    },
  },
  Mutation: {
    upsertListItem: async (root, { listItem }, { prisma }) => {
      try {
        const { id, list, item, state } = listItem;
        const data = {
          list,
          item,
          list_item: `${list}_${item}`,
          state,
        };

        await prisma.listItem.upsert({
          where: { id: id || '' },
          update: data,
          create: data,
        });

        return successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteListItem: async (root, { id }, { prisma }) => {
      try {
        await prisma.listItem.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
};

export default resolvers;
