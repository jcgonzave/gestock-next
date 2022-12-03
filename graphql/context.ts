import { prisma } from '../lib/prisma';
import { getDataFromToken } from './utils/auth';

const resolveUserToken = (req) => {
  const tokenWithBearer = req.headers.authorization || '';
  const token = tokenWithBearer.split(' ')[1];
  return getDataFromToken(token);
};

const context = async (req) => {
  return {
    prisma,
    user: resolveUserToken(req),
  };
};

export { context };
