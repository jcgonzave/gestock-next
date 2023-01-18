import bcrypt from 'bcryptjs';
import { getTokenFromData, getDataFromToken } from '../../utils/tokenHandler';
import { successResponse, errorResponse } from '../utils/common';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

const {
  ERROR_USER_NOT_FOUND,
  ERROR_INVALID_USER_OR_PASSWORD,
  ERROR_PASSWORD_MUST_MATCH,
  ERROR_INVALID_TOKEN,
} = ERROR_MESSAGES;

const { SUCCESS_SESSION_STARTED, SUCCESS_MAIL_SENT } = SUCCESS_MESSAGES;

const validateUser = async (user, password) => {
  if (!user || !user.password) {
    return errorResponse(ERROR_USER_NOT_FOUND);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return errorResponse(ERROR_INVALID_USER_OR_PASSWORD);
  }
};

const validateAndGetDataToken = async (token) => {
  if (!token) {
    return errorResponse(ERROR_INVALID_TOKEN);
  }
  return getDataFromToken(token);
};

const resolvers = {
  Query: {
    validatePasswordResetToken: async (root, { token }) => {
      const data = await validateAndGetDataToken(token);
      if (data === null) {
        return false;
      }
      return true;
    },
  },
  Mutation: {
    login: async (root, { email, password }, { prisma, res }) => {
      const currentUser = await prisma.user.findUnique({ where: { email } });
      await validateUser(currentUser, password);

      const token = await getTokenFromData(currentUser);
      res.setHeader(
        'Set-Cookie',
        `appToken=${encodeURIComponent(token)}; SameSite=Strict; Path=/`
      );

      return {
        token,
        user: currentUser,
        response: {
          status: 200,
          message: SUCCESS_SESSION_STARTED,
          result: true,
        },
      };
    },
    changePassword: async (
      root,
      { currentPassword, newPassword, confirmNewPassword },
      { prisma, user }
    ) => {
      if (newPassword !== confirmNewPassword) {
        return errorResponse(ERROR_PASSWORD_MUST_MATCH);
      }

      let currentUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      await validateUser(currentUser, currentPassword);

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      currentUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      const token = await getTokenFromData(currentUser);

      return {
        token,
        user: currentUser,
      };
    },
    passwordRecovery: async (root, { email }, { prisma }) => {
      const currentUser = await prisma.user.findUnique({ where: { email } });

      if (currentUser) {
        // await sendResetMail(currentUser, getTokenFromData);
      }

      return successResponse(SUCCESS_MAIL_SENT);
    },
    passwordReset: async (root, args, { prisma }) => {
      const { password, confirmPassword, token } = args;

      if (password !== confirmPassword) {
        return errorResponse(ERROR_PASSWORD_MUST_MATCH);
      }

      const data = await validateAndGetDataToken(token);
      if (data === null) {
        return errorResponse(ERROR_INVALID_TOKEN);
      }

      const currentUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (!currentUser) {
        return errorResponse(ERROR_USER_NOT_FOUND);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email: currentUser.email },
        data: { password: hashedPassword },
      });

      return successResponse();
    },
  },
};

export default resolvers;
