import { GraphQLError } from 'graphql';
import { ErrorMessagesEnum } from '../../constants/enums';
import { ContextType } from '../types';

const { ERROR_NO_TOKEN_SENT, ERROR_NO_MODULE_ACCESS } = ErrorMessagesEnum;

function checkAuthentication(context: ContextType) {
  if (context.ssrMode) {
    return;
  }
  if (!context || !context.currentUser) {
    throw new GraphQLError(ERROR_NO_TOKEN_SENT, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

async function checkAuthorization(context: ContextType, module: any) {
  if (context.ssrMode) {
    return;
  }
  if (!context || !context.currentUser || !module) {
    throw new GraphQLError(ERROR_NO_MODULE_ACCESS, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }

  const { prisma, currentUser } = context;
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      roleId: true,
    },
  });
  const roleId = user?.roleId;

  const modules = await prisma.modulesOnRoles.findMany({
    where: { roleId },
    select: { module: { select: { key: true } } },
  });

  const allowedModules = modules.map((m) => m.module.key);
  if (!allowedModules.includes(module)) {
    throw new GraphQLError(ERROR_NO_MODULE_ACCESS, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

export { checkAuthentication, checkAuthorization };
