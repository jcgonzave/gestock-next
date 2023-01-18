import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { prisma } from '../lib/prisma';
import { getDataFromToken } from '../utils/tokenHandler';

const clientContext = async (req: NextApiRequest, res: NextApiResponse) => {
  let token = req.cookies?.appToken;
  if (!token) {
    const autorization = req.headers.authorization || '';
    token = autorization.split(' ')[1];
  }
  const user = await getDataFromToken(token);

  return { res, prisma, user };
};

const serverContext = async ({ req, res }: GetServerSidePropsContext) => {
  const { appToken } = req.cookies;
  const user = await getDataFromToken(appToken);

  return { res, prisma, user, ssrMode: true };
};

export { clientContext, serverContext };
