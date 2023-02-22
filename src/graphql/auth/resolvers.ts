import bcrypt from 'bcryptjs';
import { ErrorMessagesEnum, SuccessMessagesEnum } from '../../constants/enums';
import { getDataFromToken, getTokenFromData } from '../../utils/tokenHandler';
import { ContextType, UserType } from '../types';
import { errorResponse, successResponse } from '../utils/responses';

const { SUCCESS_SESSION_STARTED, SUCCESS_MAIL_SENT } = SuccessMessagesEnum;
const {
  ERROR_INVALID_USER_OR_PASSWORD,
  ERROR_PASSWORD_MUST_MATCH,
  ERROR_INVALID_TOKEN,
} = ErrorMessagesEnum;

const validateUser = async (user: UserType, password: string) => {
  if (!user || !user.password) {
    return errorResponse(ERROR_INVALID_USER_OR_PASSWORD);
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return errorResponse(ERROR_INVALID_USER_OR_PASSWORD);
  }
  return true;
};

const validateAndGetDataToken = async (token: string) => {
  if (!token) {
    return errorResponse(ERROR_INVALID_TOKEN);
  }
  return getDataFromToken(token);
};

const resolvers = {
  Query: {
    validatePasswordResetToken: async (
      _root: unknown,
      args: { token: string }
    ) => {
      try {
        const { token } = args;
        const data = await validateAndGetDataToken(token);
        if (data === null) {
          return false;
        }
        return true;
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
  Mutation: {
    login: async (
      _root: unknown,
      args: { email: string; password: string },
      context: ContextType
    ) => {
      try {
        const { email, password } = args;
        const { prisma, res } = context;
        const user = await prisma.user.findUnique({ where: { email } });
        await validateUser(user, password);

        const token = await getTokenFromData(user || undefined);
        if (token) {
          res.setHeader(
            'Set-Cookie',
            `appToken=${encodeURIComponent(token)}; SameSite=Strict; Path=/`
          );

          return {
            token,
            user,
            response: {
              status: 200,
              message: SUCCESS_SESSION_STARTED,
              result: true,
            },
          };
        }
        return errorResponse(ERROR_INVALID_TOKEN);
      } catch (e) {
        return errorResponse(e);
      }
    },
    changePassword: async (
      _root: unknown,
      args: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
      },
      context: ContextType
    ) => {
      try {
        const { currentPassword, newPassword, confirmNewPassword } = args;
        const {
          prisma,
          currentUser: { id },
        } = context;

        if (newPassword !== confirmNewPassword) {
          return errorResponse(ERROR_PASSWORD_MUST_MATCH);
        }

        let user = await prisma.user.findUnique({ where: { id } });
        await validateUser(user, currentPassword);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user = await prisma.user.update({
          where: { id },
          data: { password: hashedPassword },
        });

        const token = await getTokenFromData(user);

        return { token, user };
      } catch (e) {
        return errorResponse(e);
      }
    },
    passwordRecovery: async (
      _root: unknown,
      args: { email: string },
      context: ContextType
    ) => {
      try {
        const { email } = args;
        const { prisma } = context;
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // await sendResetMail(user, getTokenFromData(user));
        }

        return successResponse(SUCCESS_MAIL_SENT);
      } catch (e) {
        return errorResponse(e);
      }
    },
    passwordReset: async (
      _root: unknown,
      args: { password: string; confirmPassword: string; token: string },
      context: ContextType
    ) => {
      try {
        const { password, confirmPassword, token } = args;
        const { prisma } = context;

        if (password !== confirmPassword) {
          return errorResponse(ERROR_PASSWORD_MUST_MATCH);
        }

        const data = await validateAndGetDataToken(token);
        if (data === null) {
          return errorResponse(ERROR_INVALID_TOKEN);
        }

        const user = await prisma.user.findUnique({
          where: { email: data.email },
        });
        if (!user) {
          return errorResponse(ERROR_INVALID_USER_OR_PASSWORD);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email: user.email },
          data: { password: hashedPassword },
        });

        return successResponse();
      } catch (e) {
        return errorResponse(e);
      }
    },
  },
};

export default resolvers;
