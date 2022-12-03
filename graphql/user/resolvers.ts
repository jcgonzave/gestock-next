import { successResponse, errorResponse } from '../utils/common';
import { getToken } from '../utils/auth';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROLES } from '../utils/constants';

const { SUCCESS_EDITED, SUCCESS_SAVED, SUCCESS_DELETED } = SUCCESS_MESSAGES;
const {
  ERROR_USER_NOT_FOUND,
  ERROR_DELETE_HIMSELF,
  ERROR_FOREIGN_KEY,
  ERROR_DELETE_ADMIN,
} = ERROR_MESSAGES;
const { ADMIN, COMPANY, FARMER, COWBOY } = ROLES;

const resolvers = {
  Query: {
    currentUser: (root, args, { prisma, user }) => {
      if (!user) {
        return errorResponse(ERROR_USER_NOT_FOUND);
      }
      return prisma.user.findUnique({ where: { id: user.id } });
    },
    user: (root, { id }, { prisma }) =>
      prisma.user.findUnique({ where: { id } }),
    users: async (root, args, { prisma, user }) => {
      const role = await prisma.user
        .findUnique({ where: { id: user.id } })
        .role();
      if (role.key === ADMIN) {
        return prisma.user.findMany({
          where: { role: { key: { not: ADMIN } } },
          orderBy: { name: 'asc' },
        });
      }
      return prisma.user.findMany({
        where: { parentId: user.id },
        orderBy: { name: 'asc' },
      });
    },
    farmers: async (root, args, { prisma, user }) => {
      const role = await prisma.user
        .findUnique({ where: { id: user.id } })
        .role();
      if (role.key === ADMIN) {
        return prisma.user.findMany({
          where: { role: { key: FARMER } },
          orderBy: { name: 'asc' },
        });
      }
      if (role.type === FARMER) {
        const farmer = await prisma.user.findUnique({ where: { id: user.id } });
        return [farmer];
      }
      return prisma.user.findMany({
        where: {
          AND: [{ parentId: user.id }, { role: { key: FARMER } }],
        },
        orderBy: { name: 'asc' },
      });
    },
    parentUsers: async (root, { childId }, { prisma, user }) => {
      const roleKeys = [ADMIN, COMPANY, FARMER];
      let childUser = null;
      let parentUser = null;
      let role = null;

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
        parentUser = await prisma.user.findUnique({ where: { id: user.id } });
      }

      const currentRole = await prisma.user
        .findUnique({ where: { id: user.id } })
        .role();
      if (currentRole.key === ADMIN || parentUser.id === user.id) {
        role = currentRole;
      } else {
        role = await prisma.user
          .findUnique({ where: { id: parentUser.id } })
          .role();
      }

      if (roleKeys.indexOf(role.key) > -1) {
        if (role.key === ADMIN) {
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
    },
  },
  Mutation: {
    upsertUser: async (root, { user }, { prisma }) => {
      try {
        const { id, parentId, roleId, ...rest } = user;

        const data = {
          ...rest,
          parent: { connect: { id: parentId } },
          role: { connect: { id: roleId } },
        };

        await prisma.user.upsert({
          where: { id: id || '' },
          create: {
            ...data,
            password: getToken(data, '1d'),
          },
          update: data,
        });

        const result = successResponse(id ? SUCCESS_EDITED : SUCCESS_SAVED);

        return result;
      } catch (e) {
        return errorResponse(e);
      }
    },
    deleteUser: async (root, { id }, { prisma, user }) => {
      try {
        if (user.id === id) {
          return errorResponse(ERROR_DELETE_HIMSELF);
        }

        const childrenCount = await prisma.user.findUnique({
          where: { id },
          select: { _count: { select: { children: true } } },
        });
        if (childrenCount > 0) {
          return errorResponse(ERROR_FOREIGN_KEY);
        }

        const role = await prisma.user.findUnique({ where: { id } }).role();
        if (role.key === ADMIN) {
          return errorResponse(ERROR_DELETE_ADMIN);
        }
        if (role.key === FARMER) {
          const farmsCount = await prisma.user.findUnique({
            where: { id },
            select: { _count: { select: { farmsAsFarmer: true } } },
          });
          if (farmsCount > 0) {
            return errorResponse(ERROR_FOREIGN_KEY);
          }
        }
        if (role.type === COWBOY) {
          const farmsCount = await prisma.user.findUnique({
            where: { id },
            select: { _count: { select: { farmsAsCowboy: true } } },
          });
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
    role: (parent, args, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.id } }).role(),
    parent: (parent, args, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.id } }).parent(),
    children: (parent, args, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.id } }).children(),
    farmsAsFarmer: (parent, args, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.id } }).farmsAsFarmer(),
    farmsAsCowboy: (parent, args, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.id } }).farmsAsCowboy(),
  },
};

export default resolvers;
