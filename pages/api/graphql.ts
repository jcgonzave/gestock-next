import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '../../graphql/schema';
import { context } from '../../graphql/context';

const server = new ApolloServer({ schema });

export default startServerAndCreateNextHandler(server, { context });
