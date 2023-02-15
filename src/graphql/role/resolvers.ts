import { RoleEnum, SuccessMessagesEnum } from '../enums';
import { ContextType, RoleInputType } from '../types';
import { errorResponse, successResponse } from '../utils/responses';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SuccessMessagesEnum;
const { ADMIN, COMPANY, FARMER, COWBOY } = RoleEnum;

const roleKeys = [
  { id: ADMIN, name: 'Admin' },
  { id: COMPANY, name: 'Empresa' },
  { id: FARMER, name: 'Ganadero' },
  { id: COWBOY, name: 'Vaquero' },
];

const resolvers = {
  Query: {
    role: (_root: unknown, args: { id: string }, context: ContextType) => {
      const { id } = args;
      const { prisma } = context;
      return prisma.role.findUnique({ where: { id } });
    },
    roles: (_root: unknown, _args: unknown, context: ContextType) => {
      const { prisma } = context;
      return prisma.role.findMany();
    },
    rolesByParentUser: async (
      _root: unknown,
      args: { parentUserId: string },
      context: ContextType
    ) => {
      try {
        const { parentUserId } = args;
        const { prisma } = context;
        const roles = await prisma.role.findMany();
        const role = await prisma.user
          .findUnique({ where: { id: parentUserId } })
          .role();

        switch (role?.key) {
          case ADMIN:
            return roles.filter((item) => item.key === COMPANY);
          case COMPANY:
            return roles.filter((item) => item.key === FARMER);
          case FARMER:
            return roles.filter((item) => item.key === COWBOY);
          default:
            return [];
        }
      } catch (e) {
        return errorResponse(e);
      }
    },
    modules: (_root: unknown, _args: unknown, context: ContextType) => {
      const { prisma } = context;
      return prisma.module.findMany();
    },
    roleKeys: () => roleKeys,
  },
  Mutation: {
    upsertRole: async (
      _root: unknown,
      args: { role: RoleInputType },
      context: ContextType
    ) => {
      try {
        const { id, key, modules } = args.role;
        const { prisma } = context;
        const name = roleKeys.find((roleKey) => roleKey.id === key)?.name || '';

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
    deleteRole: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma } = context;
        await prisma.role.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Role: {
    users: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.role.findUnique({ where: { id } }).users();
    },
    modules: async (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id: roleId } = parent;
      const { prisma } = context;
      const list = await prisma.modulesOnRoles.findMany({
        where: { roleId },
        select: { module: true },
      });
      return list.map((item) => item.module);
    },
  },
  Module: {
    roles: async (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id: moduleId } = parent;
      const { prisma } = context;
      const list = await prisma.modulesOnRoles.findMany({
        where: { moduleId },
        select: { role: true },
      });
      return list.map((item) => item.role);
    },
  },
};

export default resolvers;
