import {
  ErrorMessagesEnum,
  RoleEnum,
  SuccessMessagesEnum,
} from '../../constants/enums';
import { getTokenFromData } from '../../utils/tokenHandler';
import { ContextType, RoleType, UserInputType } from '../types';
import { errorResponse, successResponse } from '../utils/responses';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SuccessMessagesEnum;
const {
  ERROR_INVALID_USER_OR_PASSWORD,
  ERROR_DELETE_HIMSELF,
  ERROR_FOREIGN_KEY,
  ERROR_DELETE_ADMIN,
} = ErrorMessagesEnum;
const { ADMIN, COMPANY, FARMER, COWBOY } = RoleEnum;

const resolvers = {
  Query: {
    currentUser: (_root: unknown, _args: unknown, context: ContextType) => {
      try {
        const { prisma, currentUser } = context;
        if (!currentUser) {
          return errorResponse(ERROR_INVALID_USER_OR_PASSWORD);
        }
        return prisma.user.findUnique({ where: { id: currentUser.id } });
      } catch (e) {
        return errorResponse(e);
      }
    },
    user: (_root: unknown, args: { id: string }, context: ContextType) => {
      const { id } = args;
      const { prisma } = context;
      return prisma.user.findUnique({ where: { id } });
    },
    users: async (_root: unknown, _args: unknown, context: ContextType) => {
      try {
        const { prisma, currentUser } = context;
        const role = await prisma.user
          .findUnique({ where: { id: currentUser.id } })
          .role();
        if (role?.key === ADMIN) {
          return prisma.user.findMany({
            where: { role: { key: { not: ADMIN } } },
            orderBy: { name: 'asc' },
          });
        }
        return prisma.user.findMany({
          where: { parentId: currentUser.id },
          orderBy: { name: 'asc' },
        });
      } catch (e) {
        return errorResponse(e);
      }
    },
    farmers: async (_root: unknown, _args: unknown, context: ContextType) => {
      try {
        const { prisma, currentUser } = context;
        const role = await prisma.user
          .findUnique({ where: { id: currentUser.id } })
          .role();

        switch (role?.key) {
          case ADMIN:
            return prisma.user.findMany({
              where: { role: { key: FARMER } },
              orderBy: { name: 'asc' },
            });
          case FARMER:
            const farmer = await prisma.user.findUnique({
              where: { id: currentUser.id },
            });
            return [farmer];
          default:
            return prisma.user.findMany({
              where: {
                AND: [{ parentId: currentUser.id }, { role: { key: FARMER } }],
              },
              orderBy: { name: 'asc' },
            });
        }
      } catch (e) {
        return errorResponse(e);
      }
    },
    parentUsers: async (
      _root: unknown,
      args: { childId: string },
      context: ContextType
    ) => {
      try {
        const { childId } = args;
        const { prisma, currentUser } = context;
        const roleKeys = [ADMIN, COMPANY, FARMER];
        let childUser = null;
        let parentUser = null;
        let role: RoleType = null;

        if (childId) {
          childUser = await prisma.user.findUnique({ where: { id: childId } });
          if (childUser) {
            parentUser = await prisma.user
              .findUnique({ where: { id: childId } })
              .parent();
          }
        }

        if (!childUser) {
          childUser = {};
          parentUser = await prisma.user.findUnique({
            where: { id: currentUser.id },
          });
        }

        const currentRole = await prisma.user
          .findUnique({ where: { id: currentUser.id } })
          .role();
        if (currentRole?.key === ADMIN || parentUser?.id === currentUser.id) {
          role = currentRole;
        } else {
          role = await prisma.user
            .findUnique({ where: { id: parentUser?.id } })
            .role();
        }

        if (roleKeys.some((key) => key === role?.key)) {
          if (role?.key === ADMIN) {
            return prisma.user.findMany({
              where: {
                AND: [
                  { role: { key: { in: roleKeys } } },
                  { id: { not: childUser.id } },
                ],
              },
              orderBy: { name: 'asc' },
            });
          }
          return [parentUser];
        }
        return [];
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Mutation: {
    upsertUser: async (
      _root: unknown,
      args: { user: UserInputType },
      context: ContextType
    ) => {
      try {
        const { id, ...data } = args.user;
        const { prisma } = context;

        await prisma.user.upsert({
          where: { id: id || '' },
          create: {
            ...data,
            password:
              (await getTokenFromData({ id, email: args.user.email })) || '',
          },
          update: data,
        });

        const result = successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);

        return result;
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteUser: async (
      _root: unknown,
      args: { id: string },
      context: ContextType
    ) => {
      try {
        const { id } = args;
        const { prisma, currentUser } = context;

        if (currentUser.id === id) {
          return errorResponse(ERROR_DELETE_HIMSELF);
        }

        const user = await prisma.user.findUnique({
          where: { id },
          select: { _count: { select: { children: true } } },
        });
        const childrenCount = user?._count.children || 0;
        if (childrenCount > 0) {
          return errorResponse(ERROR_FOREIGN_KEY);
        }

        const role = await prisma.user.findUnique({ where: { id } }).role();
        const key = role?.key;

        if (key === ADMIN) {
          return errorResponse(ERROR_DELETE_ADMIN);
        }
        if (key === FARMER) {
          const user = await prisma.user.findUnique({
            where: { id },
            select: { _count: { select: { farmsAsFarmer: true } } },
          });
          const farmsCount = user?._count.farmsAsFarmer || 0;
          if (farmsCount > 0) {
            return errorResponse(ERROR_FOREIGN_KEY);
          }
        }
        if (key === COWBOY) {
          const user = await prisma.user.findUnique({
            where: { id },
            select: { _count: { select: { farmsAsCowboy: true } } },
          });
          const farmsCount = user?._count.farmsAsCowboy || 0;
          if (farmsCount > 0) {
            return errorResponse(ERROR_FOREIGN_KEY);
          }
        }

        await prisma.user.delete({ where: { id } });
        return successResponse(SUCCESS_DELETED);
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  User: {
    role: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.user.findUnique({ where: { id } }).role();
    },
    parent: (parent: { id: string }, _args: unknown, context: ContextType) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.user.findUnique({ where: { id } }).parent();
    },
    children: (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.user.findUnique({ where: { id } }).children();
    },
    farmsAsFarmer: (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id } = parent;
      const { prisma } = context;
      return prisma.user.findUnique({ where: { id } }).farmsAsFarmer();
    },
    farmsAsCowboy: async (
      parent: { id: string },
      _args: unknown,
      context: ContextType
    ) => {
      const { id: cowboyId } = parent;
      const { prisma } = context;
      const list = await prisma.cowboysOnFarms.findMany({
        where: { cowboyId },
        select: { farm: true },
      });
      return list.map((item) => item.farm);
    },
  },
};

export default resolvers;
