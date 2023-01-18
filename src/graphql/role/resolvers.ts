import { errorResponse, successResponse } from '../utils/common';
import { ROLES, SUCCESS_MESSAGES } from '../utils/constants';

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
    roles: (root, args, { prisma }) => prisma.role.findMany(),
    rolesByParentUser: async (root, { parentUserId }, { prisma }) => {
      const roles = await prisma.role.findMany();
      const role = await prisma.user
        .findUnique({ where: { id: parentUserId } })
        .role();
      if (role.key === ADMIN) {
        return roles.filter((item) => item.key === COMPANY);
      }
      if (role.key === COMPANY) {
        return roles.filter((item) => item.key === FARMER);
      }
      if (role.key === FARMER) {
        return roles.filter((item) => item.key === COWBOY);
      }
      return [];
    },
    modules: (root, args, { prisma }) => prisma.module.findMany(),
    roleKeys: () => roleKeys,
  },
  Mutation: {
    upsertRole: async (root, { role }, { prisma }) => {
      try {
        const { id, key, modules } = role;
        const { name } = roleKeys.find((roleKey) => roleKey.id === key);

        const create = {
          key,
          name,
          modules: {
            connectOrCreate: modules.map((moduleId) => ({
              create: { moduleId },
              where: { moduleId_roleId: { roleId: id, moduleId } },
            })),
          },
        };

        const update = {
          ...create,
          modules: { deleteMany: {}, ...create.modules },
        };

        await prisma.role.upsert({
          where: { id: id || '' },
          update,
          create,
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
    modules: async (parent, args, { prisma }) => {
      const list = await prisma.modulesOnRoles.findMany({
        where: { roleId: parent.id },
        select: { module: true },
      });
      return list.map((item) => item.module);
    },
  },
  Module: {
    roles: async (parent, args, { prisma }) => {
      const list = await prisma.modulesOnRoles.findMany({
        where: { moduleId: parent.id },
        select: { role: true },
      });
      return list.map((item) => item.role);
    },
  },
};

export default resolvers;
