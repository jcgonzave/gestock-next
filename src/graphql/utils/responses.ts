import { GraphQLError } from 'graphql';

const successResponse = (message = 'OK') => ({
  message,
  status: 200,
  result: true,
});

const errorResponse = (e: any) => {
  throw new GraphQLError(e.toString());
};

export { successResponse, errorResponse };
