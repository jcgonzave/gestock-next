import {
  successResponse,
  errorResponse,
  resolveRelation,
} from '../utils/common';
import { SUCCESS_MESSAGES, ROLES } from '../utils/constants';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SUCCESS_MESSAGES;
const { ADMIN, COMPANY, FARMER, COWBOY } = ROLES;

const roleKeys = [
  { id: ADMIN, name: 'Admin' },
  { id: COMPANY, name: 'Empresa' },
  { id: FARMER, name: 'Ganadero' },
  { id: COWBOY, name: 'Vaquero' },
];

const resolvers = {
  Query: {
    role: (root, { id }, { prisma }) =>
      prisma.role.findUnique({ where: { id } }),
    roles: (root, args, { prisma }) => prisma.roles.findMany(),
    rolesByParentUser: async (root, { parentUserId }, { prisma }) => {
      const roles = await prisma.roles.findMany();
      const role = await prisma.user
        .findUnique({ where: { id: parentUserId } })
        .role();
      if (role.key === ADMIN) {
        return roles.filter((item) => item.type === COMPANY);
      }
      if (role.key === COMPANY) {
        return roles.filter((item) => item.type === FARMER);
      }
      if (role.key === FARMER) {
        return roles.filter((item) => item.type === COWBOY);
      }
      return [];
    },
    modules: (root, args, { prisma }) => prisma.modules(),
    roleKeys: () => roleKeys,
  },
  Mutation: {
    upsertRole: async (root, { role }, { prisma }) => {
      try {
        const { id, key, modules } = role;
        const { name } = roleKeys.find((roleKey) => roleKey.id === key);

        const data = {
          key,
          name,
        };

        await prisma.role.upsert({
          where: { id: id || '' },
          update: { ...data, modules: resolveRelation('update', modules) },
          create: { ...data, modules: resolveRelation('create', modules) },
        });

        return successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteRole: async (root, { id }, { prisma }) => {
      try {
        await prisma.role.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Role: {
    users: (parent, args, { prisma }) =>
      prisma.role.findUnique({ where: { id: parent.id } }).users(),
    modules: (parent, args, { prisma }) =>
      prisma.role.findUnique({ where: { id: parent.id } }).modules(),
  },
  Module: {
    roles: (parent, args, { prisma }) =>
      prisma.module.findUnique({ where: { id: parent.id } }).roles(),
  },
};

export default resolvers;
