import { GraphQLError } from 'graphql';
import { ERROR_MESSAGES } from './constants';

const { ERROR_NO_TOKEN_SENT, ERROR_NO_MODULE_ACCESS } = ERROR_MESSAGES;

function checkAuthentication(context) {
  if (context.ssrMode) {
    return;
  }
  if (!context || !context.user) {
    throw new GraphQLError(ERROR_NO_TOKEN_SENT, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

async function checkAuthorization(context, module) {
  if (context.ssrMode) {
    return;
  }
  if (!context || !context.user || !module) {
    throw new GraphQLError(ERROR_NO_MODULE_ACCESS, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }

  const { roleId } = await prisma.user.findUnique({
    where: { id: context.user.id },
    select: {
      roleId: true,
    },
  });

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
