import { GraphQLError } from 'graphql';
import { ERROR_MESSAGES } from './constants';

const { ERROR_DUPLICATE_KEY, ERROR_FOREIGN_KEY } = ERROR_MESSAGES;

const successResponse = (message = 'OK') => ({
  message,
  status: 200,
  result: true,
});

const errorResponse = (e) => {
  throw new GraphQLError(e.toString());
};

const resolveRelation = (type, ids) => {
  const idsForRelation = ids.map((rid) => ({ id: rid }));
  switch (type) {
    case 'create': {
      return {
        connect: idsForRelation,
      };
    }
    default:
    case 'update': {
      return {
        set: idsForRelation,
      };
    }
  }
};

export { successResponse, errorResponse, resolveRelation };
