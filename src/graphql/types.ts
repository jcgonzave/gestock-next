import { Prisma, PrismaClient, Role, User } from '@prisma/client';
import { ServerResponse } from 'http';
import type { NextApiResponse } from 'next';
import { ListEnum, RoleEnum, StateEnum } from './enums';

export type PrismaType = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>;

export type CurrentUserType = {
  id: string;
  email: string;
};

export type ContextType = {
  res: NextApiResponse | ServerResponse;
  prisma: PrismaType;
  currentUser: CurrentUserType;
  ssrMode?: boolean;
};

export type UserType = User | null;
export type RoleType = Role | null;

export type AnimalInputType = {
  id: string;
  code: string;
  farmId: string;
};

export type FarmInputType = {
  id: string;
  name: string;
  farmerId: string;
  cowboys: [string];
};

export type ListItemInputType = {
  id: string;
  list: ListEnum;
  item: string;
  state: StateEnum;
};

export type ReportInputType = {
  farmId: string;
  date: string;
};

export type RoleInputType = {
  id: string;
  key: RoleEnum;
  modules: [string];
};

export type UserInputType = {
  id: string;
  parentId: string;
  roleId: string;
  name: string;
  email: string;
  phone: string;
};
