import { ListEnum, SuccessMessagesEnum } from '../enums';
import { ContextType, ListItemInputType } from '../types';
import { errorResponse, successResponse } from '../utils/responses';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SuccessMessagesEnum;
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
} = ListEnum;

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
    listItem: (_root: unknown, args: { id: string }, context: ContextType) => {
      const { id } = args;
      const { prisma } = context;
      return prisma.listItem.findUnique({ where: { id } });
    },
    listItems: (_root: unknown, _args: unknown, context: ContextType) => {
      const { prisma } = context;
      return prisma.listItem.findMany();
    },
    listsMobile: () => lists,
    listItemsMobile: async (
      _root: unknown,
      args: { date: string },
      context: ContextType
    ) => {
      try {
        const { date } = args;
        const { prisma } = context;
        if (date) {
          const items = await prisma.listItem.findMany({
            where: {
              updatedAt: { gt: new Date(date) },
            },
            orderBy: { updatedAt: 'desc' },
          });
          return items;
        }
        return prisma.listItem.findMany({ orderBy: { updatedAt: 'desc' } });
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Mutation: {
    upsertListItem: async (
      _root: unknown,
      args: { listItem: ListItemInputType },
      context: ContextType
    ) => {
      try {
        const { id, list, item, state } = args.listItem;
        const { prisma } = context;
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
    deleteListItem: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma } = context;
        await prisma.listItem.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  ListItem: {
    updatedAt: (parent: { updatedAt: number }) =>
      new Date(parent.updatedAt).toISOString(),
  },
};

export default resolvers;
